from concurrent import futures
import grpc
from grpc import StatusCode
from google.protobuf.empty_pb2 import Empty
from pydantic import BaseModel
import uuid
from datetime import datetime, timezone

from pyexpat.errors import messages

from generated_proto.content_pb2_grpc import add_ContentServiceServicer_to_server
from generated_proto.content_pb2_grpc import ContentService, ContentServiceServicer, ContentServiceStub
from generated_proto.content_pb2 import (CreateNewsRequest, GetNewsRequest, UpdateNewsRequest,
                                         DeleteNewsRequest, CreateNewsRequest, GetNewsResponse,
                                         UpdateNewsResponse, DeleteNewsResponse, CreateNewsResponse,
                                         GetNewsResponse, ListNewsResponse, CreateVacancyResponse,
                                         GetVacancyResponse, UpdateVacancyResponse, DeleteVacancyResponse,
                                         ListVacanciesResponse, GetCountNewsResponse,GetCountVacanciesResponse,
                                         CreateDocumentResponse, GetDocumentResponse, Document,
                                         DeleteDocumentResponse, ListDocumentsResponse, Contact,
                                         ContactListResponse, DeleteContactResponse, CreateProjectResponse,
                                         GetProjectResponse, UpdateProjectResponse, DeleteProjectResponse,
                                         ListProjectsResponse)
from database.db_helper import get_session
from database import database_functions, s3_storage
from workers import news_worker, vacancy_worker, document_worker, contact_worker
from configuration.logger import logger
from configuration.config import settings




class ContentServicer(ContentServiceServicer):

    def __init__(self):
        self.session = get_session()

    # ================
    # NEWS CRUD
    # ================

    def CreateNews(self, request, context):
        try:
            try:
                uploaded_by_uuid = uuid.UUID(request.uploaded_by)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid uploaded_by UUID format")
                return Empty()

            bucket_name = "news-files"
            upload_id = None
            file_url = None


            if request.file:

                filename = request.filename if request.filename else f"news-files_{uuid.uuid4()}.bin"
                object_name = f"{uuid.uuid4()}_{filename}"

                try:
                    # Создаём multipart upload
                    response = s3_storage.s3.create_multipart_upload(Bucket=bucket_name, Key=object_name)
                    upload_id = response["UploadId"]

                    parts = []
                    chunk_size = 5 * 1024 * 1024  # 5 MB


                    for i in range(0, len(request.file), chunk_size):
                        chunk = request.file[i:i + chunk_size]
                        part_number = len(parts) + 1

                        part = s3_storage.s3.upload_part(
                            Bucket=bucket_name,
                            Key=object_name,
                            PartNumber=part_number,
                            UploadId=upload_id,
                            Body=chunk,
                        )
                        parts.append({"ETag": part["ETag"], "PartNumber": part_number})


                    s3_storage.s3.complete_multipart_upload(
                        Bucket=bucket_name,
                        Key=object_name,
                        UploadId=upload_id,
                        MultipartUpload={"Parts": parts},
                    )


                    file_url = f"{settings.minio.public_url}/{bucket_name}/{object_name}"

                except Exception as upload_err:
                    if upload_id is not None:
                        s3_storage.s3.abort_multipart_upload(Bucket="news-files", Key=filename, UploadId=upload_id)
                    raise upload_err


            result = news_worker.create_news(
                session=self.session,
                title=request.title,
                content=request.content,
                uploaded_by=uploaded_by_uuid,
                file_url=file_url,
            )

            return CreateNewsResponse(
                id=str(result),
                title=request.title,
                content=request.content,
                uploaded_by=request.uploaded_by,
                file_url=file_url or "",
                created_at=str(datetime.now(timezone.utc)),
            )

        except Exception as e:
            print(f"Error creating news: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to create news: {str(e)}")
            return CreateNewsResponse()

    def GetNews(self, request, context):
        try:
            try:
                news_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid news ID format")
                return GetNewsResponse()

            news = news_worker.get_news(self.session, news_id)
            if not news:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("News not found")
                return GetNewsResponse()

            file_bytes = b""
            if news.file_url:
                filename = news.file_url.split("/")[-1]

                try:
                    # скачиваем файл из MinIO
                    resp = s3_storage.s3.get_object(Bucket="news-files", Key=filename)
                    file_bytes = resp['Body'].read()
                except Exception as e:
                    print(f"Failed to fetch file from MinIO: {e}")
                    # можно игнорировать или вернуть пустой bytes

            return GetNewsResponse(
                id=str(news.id),
                title=news.title,
                content=news.content,
                uploaded_by=str(news.uploaded_by),
                created_at=news.created_at.isoformat() if news.created_at else "",
                updated_at=news.updated_at.isoformat() if news.updated_at else "",
                file=file_bytes,
                filename=news.file_url.split("/")[-1] if news.file_url else ""
            )
        except Exception as e:
            print(f"Error getting news: {e}")


    def UpdateNews(self, request, context):
        try:
            try:
                news_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid news ID format")
                return UpdateNewsResponse()


            existing_news = news_worker.get_news(self.session, news_id)
            if not existing_news:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("News not found")
                return UpdateNewsResponse()


            update_data = {}
            if request.title:
                update_data['title'] = request.title
            if request.content:
                update_data['content'] = request.content
            if request.uploaded_by:
                try:
                    update_data['uploaded_by'] = uuid.UUID(request.uploaded_by)
                except ValueError:
                    context.set_code(StatusCode.INVALID_ARGUMENT)
                    context.set_details("Invalid uploaded_by UUID format")
                    return UpdateNewsResponse()

            if not update_data:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("No fields to update")
                return UpdateNewsResponse()

            success = news_worker.update_news(
                session=self.session,
                news_id=news_id,
                **update_data
            )

            if success:
                updated_news = news_worker.get_news(self.session, news_id)
                return UpdateNewsResponse(
                    id=str(updated_news.id),
                    title=updated_news.title,
                    content=updated_news.content,
                    uploaded_by=str(updated_news.uploaded_by),
                    created_at=updated_news.created_at.isoformat() if updated_news.created_at else "",
                    updated_at=updated_news.updated_at.isoformat() if updated_news.updated_at else "",
                )
            else:
                context.set_code(StatusCode.INTERNAL)
                context.set_details("Failed to update news")
                return UpdateNewsResponse()

        except Exception as e:
            print(f"Error updating news: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to update news: {str(e)}")
            return UpdateNewsResponse()


    def DeleteNews(self, request, context):
        try:
            try:
                news_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid news ID format")
                return DeleteNewsResponse()

            existing_news = news_worker.get_news(self.session, news_id)
            if not existing_news:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("News not found")
                return DeleteNewsResponse()

            success = news_worker.delete_news(self.session, news_id)
            if success:
                return DeleteNewsResponse(
                    id=request.id,
                    message="deleted",
                )

        except Exception as e:
            print(f"Error deleting news: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to delete news: {str(e)}")
            return DeleteNewsResponse()

    def ListNews(self, request, context):
        try:
            limit = request.limit if request.limit > 0 else 10
            offset = request.offset if request.offset >= 0 else 0

            news_list = news_worker.get_all_news(
                session=self.session,
                limit=limit,
                offset=offset,
            )

            news_responses = []
            for news in news_list:
                file_bytes = b""
                filename = ""
                if news.file_url:
                    filename = news.file_url.split("/")[-1]
                    try:
                        resp = s3_storage.s3.get_object(Bucket="news-files", Key=filename)
                        file_bytes = resp['Body'].read()
                    except Exception as e:
                        print(f"Failed to fetch file from MinIO for news {news.id}: {e}")
                        file_bytes = b""
                        filename = ""

                news_responses.append(
                    GetNewsResponse(
                        id=str(news.id),
                        title=news.title,
                        content=news.content,
                        uploaded_by=str(news.uploaded_by),
                        created_at=news.created_at.isoformat() if news.created_at else "",
                        updated_at=news.updated_at.isoformat() if news.updated_at else "",
                        file=file_bytes,
                        filename=filename
                    )
                )

            return ListNewsResponse(items=news_responses)

        except Exception as e:
            print(f"Error listing news: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to list news: {str(e)}")
            return ListNewsResponse()

        # =================
        # VACANCY CRUD
        # ==================

    def CreateVacancy(self, request, context):
        try:
            print(f"CreateVacancy request: position={request.position}")
            vacancy_id = vacancy_worker.create_vacancy(
                session=self.session,
                position=request.position,
                description=request.description,
                salary=request.salary,
                is_active=request.is_active
            )
            vacancy = vacancy_worker.get_vacancy(self.session, vacancy_id)
            if vacancy:
                return CreateVacancyResponse(
                    id=str(vacancy.id),
                    position=vacancy.position,
                    description=vacancy.description,
                    salary=vacancy.salary,
                    is_active=vacancy.is_active,
                    published_at=vacancy.published_at.isoformat() if vacancy.published_at else ""
                )
            else:
                context.set_code(StatusCode.INTERNAL)
                context.set_details("Vacancy created but cannot be retrieved")
                return CreateVacancyResponse()
        except Exception as e:
            print(f"Error creating vacancy: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to create vacancy: {str(e)}")
            return CreateVacancyResponse()


    def GetVacancy(self, request, context):
        try:
            print(f"GetVacancy request: id={request.id}")
            try:
                uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid vacancy ID format")
                return GetVacancyResponse()
            vacancy = vacancy_worker.get_vacancy(self.session, request.id)
            if not vacancy:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("Vacancy not found")
                return GetVacancyResponse()
            return GetVacancyResponse(
                id=str(vacancy.id),
                position=vacancy.position,
                description=vacancy.description,
                salary=vacancy.salary,
                is_active=vacancy.is_active,
                published_at=vacancy.published_at.isoformat() if vacancy.published_at else ""
            )
        except Exception as e:
            print(f"Error getting vacancy: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to get vacancy: {str(e)}")
            return GetVacancyResponse()


    def UpdateVacancy(self, request, context):
        try:
            try:
                vacancy_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid vacancy ID format")
                return Empty()
            print(f"UpdateVacancy request: id={request.id}")
            existing_vacancy = vacancy_worker.get_vacancy(self.session, request.id)
            if not existing_vacancy:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("Vacancy not found")
                return UpdateVacancyResponse()
            # Подготавливаем данные для обновления
            update_data = {}
            if request.position:
                update_data['position'] = request.position
            if request.description:
                update_data['description'] = request.description
            if request.salary:
                update_data['salary'] = request.salary
            if request.is_active:
                update_data["is_active"] = request.is_active
            if not update_data:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("No fields to update")
                return UpdateVacancyResponse()
            success = vacancy_worker.update_vacancy(self.session, request.id, **update_data)
            if success:
                updated_vacancy = vacancy_worker.get_vacancy(self.session, request.id)
                return UpdateVacancyResponse(
                    id=str(updated_vacancy.id),
                    position=updated_vacancy.position,
                    description=updated_vacancy.description,
                    salary=updated_vacancy.salary,
                    is_active=updated_vacancy.is_active,
                    published_at=updated_vacancy.published_at.isoformat() if updated_vacancy.published_at else ""
                )
            else:
                context.set_code(StatusCode.INTERNAL)
                context.set_details("Failed to update vacancy")
                return UpdateVacancyResponse()

        except Exception as e:
            print(f"Error updating vacancy: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to update vacancy: {str(e)}")
            return UpdateVacancyResponse()




    def DeleteVacancy(self, request, context):
        try:
            print(f"DeleteVacancy request: id={request.id}")
            existing_vacancy = vacancy_worker.get_vacancy(self.session, request.id)
            if not existing_vacancy:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("Vacancy not found")
                return DeleteVacancyResponse()
            success = vacancy_worker.delete_vacancy(self.session, request.id)
            return DeleteVacancyResponse(
                id=str(existing_vacancy.id),
                message="successful delete"
            )

        except Exception as e:
            print(f"Error deleting vacancy: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to delete vacancy: {str(e)}")
            return DeleteVacancyResponse()


    def ListAllVacancies(self, request, context):
        try:
            print(f"ListVacancies request: limit={request.limit}")
            limit = request.limit if request.limit > 0 else 10
            offset = request.offset if request.offset >= 0 else 0
            vacancies_list = vacancy_worker.get_all_vacancies(
                session=self.session,
                limit=limit,
                offset=offset,
            )

            vacancy_responses = []
            for vacancy in vacancies_list:
                vacancy_responses.append(
                    GetVacancyResponse(
                        id=str(vacancy.id),
                        position=vacancy.position,
                        description=vacancy.description,
                        salary=vacancy.salary or "",
                        is_active=vacancy.is_active,
                        published_at=vacancy.published_at.isoformat() if vacancy.published_at else ""
                    )
                )
            #total_count = vacancy_worker.get_vacancies_count(self.session, is_active=is_active_filter)
            return ListVacanciesResponse(
                items=vacancy_responses,
            )
        except Exception as e:
            print(f"Error listing vacancies: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to list vacancies: {str(e)}")
            return ListVacanciesResponse()


    def ListActiveVacancies(self, request, context):
        try:
            print(f"ListVacancies request: limit={request.limit}")
            limit = request.limit if request.limit > 0 else 10
            offset = request.offset if request.offset >= 0 else 0
            vacancies_list = vacancy_worker.get_active_vacancies(
                session=self.session,
                limit=limit,
                offset=offset,
            )

            vacancy_responses = []
            for vacancy in vacancies_list:
                vacancy_responses.append(
                    GetVacancyResponse(
                        id=str(vacancy.id),
                        position=vacancy.position,
                        description=vacancy.description,
                        salary=vacancy.salary or "",
                        is_active=vacancy.is_active,
                        published_at=vacancy.published_at.isoformat() if vacancy.published_at else ""
                    )
                )
            #total_count = vacancy_worker.get_vacancies_count(self.session, is_active=is_active_filter)
            return ListVacanciesResponse(
                items=vacancy_responses,
            )
        except Exception as e:
            print(f"Error listing vacancies: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to list vacancies: {str(e)}")
            return ListVacanciesResponse()

    def GetCountVacancies(self, request, context):
        count = vacancy_worker.get_count_vacancies(session=self.session)
        return GetCountNewsResponse(count = count)

    def GetCountNews(self, request, context):
        count = news_worker.get_count_news(session=self.session)
        return GetCountVacanciesResponse(count = count)

    # =================
    # DOCUMENTS CRD
    # ==================

    def CreateDocument(self, request, context):
        try:
            uploaded_by_uuid = uuid.UUID(request.uploaded_by)

            file_url = None
            filename = None
            documents_bucket = "docs"
            if request.file:
                filename = request.filename or f"{uuid.uuid4()}.bin"
                s3_storage.s3.put_object(Bucket=documents_bucket, Key=filename, Body=request.file)
                file_url = f"{settings.minio.public_url}/{documents_bucket}/{filename}"
            else:
                print(f"not  document")
                context.set_code(StatusCode.INTERNAL)
                context.set_details(f"not  document")
                return CreateDocumentResponse()

            doc = document_worker.create_document(
                session=self.session,
                title=request.title,
                description=request.description,
                uploaded_by=uploaded_by_uuid,
                filename=filename,
                file_url=file_url,
            )

            return CreateDocumentResponse(
                id=str(doc.id),
                title=doc.title,
                description=doc.description or "",
                uploaded_by=str(doc.uploaded_by),
                created_at=doc.created_at.isoformat(),
                file_url=doc.file_url or "",
                filename=doc.filename or "",
            )

        except Exception as e:
            print(f"Error creating document: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to create document: {str(e)}")
            return CreateDocumentResponse()

    # READ (один документ)
    def GetDocument(self, request, context):
        try:
            try:
                doc_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid document ID format")
                return GetDocumentResponse()

            doc = document_worker.get_document(self.session, doc_id)

            if not doc:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("Document not found")
                return GetDocumentResponse()

            # Загружаем файл из MinIO
            file_data = b""
            documents_bucket = "docs"
            if doc.file_url:
                try:
                    #filename = doc.file_url.split("/")[-1]
                    response = s3_storage.s3.get_object(Bucket=documents_bucket, Key=doc.filename)
                    file_data = response['Body'].read()
                except Exception as e:
                    print(f"Failed to fetch file from S3 for document {doc_id}: {e}")
                    context.set_code(StatusCode.INTERNAL)
                    context.set_details(f"Failed to fetch file: {str(e)}")
                    return GetDocumentResponse()

            return GetDocumentResponse(
                document=Document(
                    id=str(doc.id),
                    title=doc.title,
                    description=doc.description or "",
                    uploaded_by=str(doc.uploaded_by),
                    created_at=doc.created_at.isoformat(),
                    filename=doc.filename or "",
                    file=file_data
                )
            )

        except Exception as e:
            print(f"Error getting document: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to get document: {str(e)}")
            return GetDocumentResponse()

    # READ (список документов)
    def ListDocuments(self, request, context):
        try:
            limit = request.limit if request.limit > 0 else 10
            offset = request.offset if request.offset >= 0 else 0

            documents = document_worker.get_all_documents(
                session=self.session, limit=limit, offset=offset
            )
            logger.debug(f"--------{documents}")
            bucket_name = "docs"
            document_responses = []
            for doc in documents:
                file_bytes = b""
                if doc.filename:
                    try:
                        response = s3_storage.s3.get_object(Bucket=bucket_name, Key=doc.filename)
                        file_bytes = response['Body'].read()
                    except Exception as e:
                        print(f"Failed to fetch file for document {doc.id}: {e}")
                        file_bytes = b""

                document_responses.append(
                    Document(
                        id=str(doc.id),
                        title=doc.title,
                        description=doc.description or "",
                        uploaded_by=str(doc.uploaded_by),
                        created_at=doc.created_at.isoformat() if doc.created_at else "",
                        filename=doc.filename or "",
                        file=file_bytes
                    )
                )

            return ListDocumentsResponse(items=document_responses)

        except Exception as e:
            print(f"Error listing documents: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to list documents: {str(e)}")
            return ListDocumentsResponse()

    # DELETE
    def DeleteDocument(self, request, context):
        try:
            try:
                doc_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid document ID format")
                return Empty()

            doc = document_worker.get_document(self.session, doc_id)
            documents_bucket = "docs"
            if not doc:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("Document not found")
                return Empty()

            if doc.file_url:
                #filename = doc.file_url.split("/")[-1]
                s3_storage.s3.delete_object(Bucket=documents_bucket, Key=doc.filename)

            success = document_worker.delete_document(self.session, doc_id)
            if not success:
                context.set_code(StatusCode.INTERNAL)
                context.set_details("Failed to delete document")

            return Empty()

        except Exception as e:
            print(f"Error deleting document: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to delete document: {str(e)}")
            return DeleteDocumentResponse(message="success delete")

    # ================
    #====Contacts=====
    #=================

    def CreateContact(self, request, context):
        try:
            session = self.session
            contact_id = uuid.uuid4()

            contact = database_functions.create_contact_to_db(session, contact_id=contact_id, title=request.title, phones=request.phones, emails=request.emails, addresses=request.addresses)

            return Contact(id=str(contact_id), title=request.title)

        except Exception as e:
            self.session.rollback()
            print(f"Error creating contact: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to create contact: {str(e)}")
            return Contact()

    # READ (один контакт)
    def GetContact(self, request, context):
        try:
            try:
                contact_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid document ID format")
                return Empty()
            contact = database_functions.get_contact_by_id(self.session, contact_id)
            if not contact:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("Contact not found")
                return Contact()
            return Contact(
                id=str(contact.id),
                title=contact.title,
                phones=[p.phone for p in contact.phones],
                emails=[e.email for e in contact.emails],
                addresses=[a.address for a in contact.addresses],
            )
        except Exception as e:
            print(f"Error getting contact: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to get contact: {str(e)}")
            return Contact()
    # READ (все контакты)
    def ListContacts(self, request, context):
        try:
            print(f"ListContact request: limit={request.limit}")
            limit = request.limit if request.limit > 0 else 10
            offset = request.offset if request.offset >= 0 else 0
            contacts = database_functions.get_all_contacts_from_db(
                session=self.session,
                limit=limit,
                offset=offset,
            )

            contacts_response = []
            for contact in contacts:
                contacts_response.append(
                    Contact(
                        id=str(contact.id),
                        title=contact.title,
                        phones=[p.phone for p in contact.phones],
                        emails=[e.email for e in contact.emails],
                        addresses=[a.address for a in contact.addresses]
                    )
                )
            # total_count = vacancy_worker.get_vacancies_count(self.session, is_active=is_active_filter)
            return ContactListResponse(
                items=contacts_response,
            )
        except Exception as e:
            print(f"Error listing contacts: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to list contacts: {str(e)}")
            return ContactListResponse()

    def UpdateContact(self, request, context):
        try:
            try:
                contact_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid contact ID format")
                return Empty()

            print(f"UpdateContact request: id={contact_id}")

            update_data = {}
            if request.title:
                update_data['title'] = request.title
            if request.phones:
                update_data['phones'] = request.phones
            if request.emails:
                update_data['emails'] = request.emails
            if request.addresses:
                update_data["addresses"] = request.addresses
            if not update_data:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("No fields to update")
                return Contact()
            success = database_functions.update_contact_by_id(self.session, contact_id, **update_data)

            if success:
                updated_contact = database_functions.get_contact_by_id(self.session, contact_id)
                return Contact(
                    id=str(updated_contact.id),
                    title=updated_contact.title,
                    phones=[p.phone for p in updated_contact.phones],
                    emails=[e.email for e in updated_contact.emails],
                    addresses=[a.address for a in updated_contact.addresses],
                )
            else:
                context.set_code(StatusCode.INTERNAL)
                context.set_details("Failed to update Contact")
                return Contact()

        except Exception as e:
            print(f"Error updating Contact: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to update Contact: {str(e)}")
            return Contact()

    def DeleteContact(self, request, context):
        try:
            try:
                contact_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid contact ID format")
                return Empty()
            print(f"DeleteContact request: id={contact_id}")
            existing_contact = database_functions.get_contact_by_id(self.session, contact_id)
            if not existing_contact:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("Contact not found")
                return DeleteContactResponse()
            success = database_functions.delete_contact_by_id(self.session, contact_id)
            return DeleteContactResponse(
                message="successful delete"
            )

        except Exception as e:
            print(f"Error deleting Contact: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to delete Contact: {str(e)}")
            return DeleteContactResponse()


    #===============
    #====Products===
    #===============

    def CreateProject(self, request, context):
        try:
            try:
                uploaded_by_uuid = uuid.UUID(request.uploaded_by)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid uploaded_by UUID format")
                return Empty()

            bucket_name = "projects"
            upload_id = None
            file_url = None

            if request.file:

                filename = request.filename if request.filename else f"projects_{uuid.uuid4()}.bin"
                object_name = f"{uuid.uuid4()}_{filename}"

                try:
                    response = s3_storage.s3.create_multipart_upload(Bucket=bucket_name, Key=object_name)
                    upload_id = response["UploadId"]

                    parts = []
                    chunk_size = 5 * 1024 * 1024  # 5 MB

                    for i in range(0, len(request.file), chunk_size):
                        chunk = request.file[i:i + chunk_size]
                        part_number = len(parts) + 1

                        part = s3_storage.s3.upload_part(
                            Bucket=bucket_name,
                            Key=object_name,
                            PartNumber=part_number,
                            UploadId=upload_id,
                            Body=chunk,
                        )
                        parts.append({"ETag": part["ETag"], "PartNumber": part_number})

                    s3_storage.s3.complete_multipart_upload(
                        Bucket=bucket_name,
                        Key=object_name,
                        UploadId=upload_id,
                        MultipartUpload={"Parts": parts},
                    )

                    file_url = f"{settings.minio.public_url}/{bucket_name}/{object_name}"

                except Exception as upload_err:
                    if upload_id is not None:
                        s3_storage.s3.abort_multipart_upload(Bucket=bucket_name, Key=filename, UploadId=upload_id)
                    raise upload_err

            result = database_functions.add_project_to_db(
                session=self.session,
                title=request.title,
                description=request.description,
                uploaded_by=uploaded_by_uuid,
                file_url=file_url,
                filename=filename,
            )
            logger.debug(
                f"Project created: id={result}, title={request.title}, "
                f"description={request.description}, uploaded_by={request.uploaded_by}, "
                f"file_url={file_url}, created_at={datetime.now(timezone.utc)}"
            )
            return CreateProjectResponse(
                id=str(result),
                title=request.title,
                description=request.description,
                uploaded_by=request.uploaded_by,
                file_url=file_url or "",
                created_at=str(datetime.now(timezone.utc)),
            )

        except Exception as e:
            print(f"Error creating project: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to create project: {str(e)}")
            return CreateProjectResponse()
    def GetProject(self, request, context):
        try:
            try:
                project_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid project ID format")
                return GetProjectResponse()
            backet_name="projects"
            project = database_functions.get_project_from_db(self.session, project_id)
            if not project:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("project not found")
                return GetProjectResponse()

            file_bytes = b""
            if project.file_url:
                filename = project.file_url.split("/")[-1]

                try:
                    # скачиваем файл из MinIO
                    resp = s3_storage.s3.get_object(Bucket=backet_name, Key=filename)
                    file_bytes = resp['Body'].read()
                except Exception as e:
                    print(f"Failed to fetch file from MinIO: {e}")
                    # можно игнорировать или вернуть пустой bytes

            return GetProjectResponse(
                id=str(project.id),
                title=project.title,
                description=project.description,
                uploaded_by=str(project.uploaded_by),
                created_at=project.created_at.isoformat() if project.created_at else "",
                updated_at=project.updated_at.isoformat() if project.updated_at else "",
                file=file_bytes,
                filename=project.file_url.split("/")[-1] if project.file_url else ""
            )
        except Exception as e:
            print(f"Error getting project: {e}")


    def UpdateProject(self, request, context):
        try:
            try:
                project_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid project ID format")
                return UpdateProjectResponse()


            existing_project = database_functions.get_project_from_db(self.session, project_id)
            if not existing_project:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("project not found")
                return UpdateProjectResponse()


            update_data = {}
            if request.title:
                update_data['title'] = request.title
            if request.description:
                update_data['description'] = request.description
            if request.uploaded_by:
                try:
                    update_data['uploaded_by'] = uuid.UUID(request.uploaded_by)
                except ValueError:
                    context.set_code(StatusCode.INVALID_ARGUMENT)
                    context.set_details("Invalid uploaded_by UUID format")
                    return UpdateProjectResponse()

            if not update_data:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("No fields to update")
                return UpdateProjectResponse()

            success = database_functions.update_project_in_db(
                session=self.session,
                project_id=project_id,
                **update_data
            )

            if success:
                updated_project = database_functions.get_project_from_db(self.session, project_id)
                return UpdateProjectResponse(
                    id=str(updated_project.id),
                    title=updated_project.title,
                    description=updated_project.description,
                    uploaded_by=str(updated_project.uploaded_by),
                    created_at=updated_project.created_at.isoformat() if updated_project.created_at else "",
                    updated_at=updated_project.updated_at.isoformat() if updated_project.updated_at else "",
                )
            else:
                context.set_code(StatusCode.INTERNAL)
                context.set_details("Failed to update project")
                return UpdateProjectResponse()

        except Exception as e:
            print(f"Error updating project: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to update project: {str(e)}")
            return UpdateProjectResponse()


    def DeleteProject(self, request, context):
        try:
            try:
                project_id = uuid.UUID(request.id)
            except ValueError:
                context.set_code(StatusCode.INVALID_ARGUMENT)
                context.set_details("Invalid project ID format")
                return DeleteProjectResponse()

            existing_project = database_functions.get_project_from_db(self.session, project_id)
            if not existing_project:
                context.set_code(StatusCode.NOT_FOUND)
                context.set_details("project not found")
                return DeleteProjectResponse()

            success = database_functions.delete_project_from_db(self.session, project_id)
            if success:
                return DeleteProjectResponse(
                    id=request.id,
                    message="deleted",
                )

        except Exception as e:
            print(f"Error deleting project_: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to delete project: {str(e)}")
            return DeleteProjectResponse()

    def ListProjects(self, request, context):
        try:
            limit = request.limit if request.limit > 0 else 10
            offset = request.offset if request.offset >= 0 else 0

            projects_list = database_functions.get_all_projects(
                session=self.session,
                limit=limit,
                offset=offset,
            )
            bucket_name="projects"

            project_responses = []
            for project in projects_list:
                file_bytes = b""
                filename = ""
                if project.file_url:
                    filename = project.file_url.split("/")[-1]
                    try:
                        resp = s3_storage.s3.get_object(Bucket=bucket_name, Key=filename)
                        file_bytes = resp['Body'].read()
                    except Exception as e:
                        print(f"Failed to fetch file from MinIO for news {project.id}: {e}")
                        file_bytes = b""
                        filename = ""

                project_responses.append(
                    GetProjectResponse(
                        id=str(project.id),
                        title=project.title,
                        description=project.description,
                        uploaded_by=str(project.uploaded_by),
                        created_at=project.created_at.isoformat() if project.created_at else "",
                        updated_at=project.updated_at.isoformat() if project.updated_at else "",
                        file=file_bytes,
                        filename=filename
                    )
                )

            return ListProjectsResponse(items=project_responses)

        except Exception as e:
            print(f"Error listing news: {e}")
            context.set_code(StatusCode.INTERNAL)
            context.set_details(f"Failed to list news: {str(e)}")
            return ListProjectsResponse()







def serve():
    s3_storage.ensure_bucket("news-files")
    s3_storage.ensure_bucket("docs")
    s3_storage.ensure_bucket("projects")

    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    add_ContentServiceServicer_to_server(ContentServicer(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
