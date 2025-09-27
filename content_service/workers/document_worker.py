import uuid
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from database import database_functions

from models.models import Document

def create_document(session: Session, title: str, description: str, uploaded_by: str,filename: str, file_url: str):
    """Создание документа"""
    result = database_functions.create_document_to_db(session=session, title=title, description=description, uploaded_by=uploaded_by, filename=filename, file_url=file_url)
    return result

def get_document(session: Session, doc_id: UUID):
    """Получение документа"""
    result = database_functions.get_document_from_db(session=session, doc_id=doc_id)
    return result

def delete_document(session: Session, doc_id: UUID):
    """Удаление файла"""
    result = database_functions.delete_document_from_db(session=session, doc_id=doc_id)
    return result

def get_all_documents(session: Session, limit: Optional[int], offset: Optional[int]):
    """Получение всех"""
    result = database_functions.get_all_documents_from_db(session=session, limit=limit, offset=offset)
    return result