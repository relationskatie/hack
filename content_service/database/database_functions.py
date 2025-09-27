from sqlalchemy.orm import Session
from sqlalchemy import  select, desc, insert, update, delete, asc, desc
from models.models import News, Vacancy, Document,ContactPhone, Contact, ContactEmail, ContactAddress, Project
from datetime import datetime, timezone
import uuid
from typing import Optional, List
from sqlalchemy import func
from configuration.logger import logger


def add_news_to_db(title: str, content: str, uploaded_by: uuid.UUID, file_url:str,  session: Session) -> uuid.UUID:
    """Добавление новости"""
    news_id = uuid.uuid4()
    news = News(
        id=news_id,
        title=title,
        content=content,
        uploaded_by=uploaded_by,
        file_url=file_url,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    session.add(news)
    session.commit()
    return news_id


def get_news_by_id(session: Session, news_id: uuid.UUID) -> Optional[News]:
    """Получение новости"""
    try:
        stmt = select(News).where(News.id == news_id)
        result = session.execute(stmt)
        return result.scalar_one_or_none()
    except Exception as e:
        session.rollback()
        raise e


def get_all_news_from_db(session: Session, limit: int = 10, offset: int = 0,
                         order_by: str = "created_at", descending: bool = True) -> List[News]:
    """Получение всех новостей"""
    try:
        # Выбор поля для сортировки
        order_column = {
            "created_at": News.created_at,
            "updated_at": News.updated_at,
            "title": News.title
        }.get(order_by, News.created_at)

        order_direction = desc(order_column) if descending else asc(order_column)

        stmt = select(News).order_by(order_direction).offset(offset).limit(limit)
        result = session.execute(stmt)
        return list(result.scalars().all())
    except Exception as e:
        session.rollback()
        raise e


def update_news_in_db(session: Session, news_id: uuid.UUID, **kwargs) -> bool:
    """Обновление новости"""
    try:
        allowed_fields = {'title', 'content', 'uploaded_by'}
        update_data = {k: v for k, v in kwargs.items() if k in allowed_fields}

        if not update_data:
            return False

        update_data['updated_at'] = datetime.now(timezone.utc)

        stmt = update(News).where(News.id == news_id).values(**update_data)
        result = session.execute(stmt)
        session.commit()

        return result.rowcount > 0
    except Exception as e:
        session.rollback()
        raise e


def delete_news_from_db(session: Session, news_id: uuid.UUID) -> bool:
    """Удаление новости"""
    try:
        stmt = delete(News).where(News.id == news_id)
        result = session.execute(stmt)
        session.commit()
        return result.rowcount > 0
    except Exception as e:
        session.rollback()
        raise e


# ================
# VACANCY DATABASE FUNCTIONS
# ================

def add_vacancy_to_db(session: Session, position: str, description: str, salary: str, is_active: bool = True) -> str:
    """Добавление вакансии"""
    try:
        vacancy_id = uuid.uuid4()
        vacancy = Vacancy(
            id=vacancy_id,
            position=position,
            description=description,
            salary=salary,
            is_active=is_active,
            published_at=datetime.now(timezone.utc)
        )

        session.add(vacancy)
        session.commit()
        return str(vacancy_id)

    except Exception as e:
        session.rollback()
        print(f"Error adding vacancy to DB: {e}")
        raise e


def get_vacancy_by_id(session: Session, vacancy_id: uuid.UUID) -> Optional[Vacancy]:
    """Получение вакансии"""
    try:
        stmt = select(Vacancy).where(Vacancy.id == vacancy_id)
        result = session.execute(stmt)
        return result.scalar_one_or_none()

    except Exception as e:
        print(f"Error getting vacancy from DB: {e}")
        return None


def get_all_vacancies_from_db(session: Session, limit: int = 10, offset: int = 0) -> List[Vacancy]:
    """Получение всех вакансий"""
    try:
        stmt = select(Vacancy)

        stmt = stmt.order_by(desc(Vacancy.published_at)).offset(offset).limit(limit)
        result = session.execute(stmt)
        return list(result.scalars().all())

    except Exception as e:
        print(f"Error getting all vacancies from DB: {e}")
        return []

def get_active_vacancies_from_db(session: Session, limit: int = 10, offset: int = 0) -> List[Vacancy]:
    """Получение всех вакансий"""
    try:
        stmt = select(Vacancy)

        stmt = stmt.where(Vacancy.is_active == True)

        stmt = stmt.order_by(desc(Vacancy.published_at)).offset(offset).limit(limit)
        result = session.execute(stmt)
        return list(result.scalars().all())

    except Exception as e:
        print(f"Error getting all vacancies from DB: {e}")
        return []


def update_vacancy_in_db(session: Session, vacancy_id: uuid.UUID, **kwargs) -> bool:
    """Обновление вакансии"""
    try:

        allowed_fields = {'position', 'description', 'salary', 'is_active'}
        update_data = {k: v for k, v in kwargs.items() if k in allowed_fields}

        if not update_data:
            return False

        stmt = update(Vacancy).where(Vacancy.id == vacancy_id).values(**update_data)
        result = session.execute(stmt)
        session.commit()

        return result.rowcount > 0

    except Exception as e:
        session.rollback()
        print(f"Error updating vacancy in DB: {e}")
        return False


def delete_vacancy_from_db(session: Session, vacancy_id: uuid.UUID) -> bool:
    """Удаление вакансии"""
    try:
        stmt = delete(Vacancy).where(Vacancy.id == vacancy_id)
        result = session.execute(stmt)
        session.commit()

        return result.rowcount > 0

    except Exception as e:
        session.rollback()
        print(f"Error deleting vacancy from DB: {e}")
        return False


def get_total_vacancies(session):
    count = session.query(func.count()).select_from(Vacancy).scalar()
    logger.debug(f"Total vacancies: {count}")
    return count

def get_total_news(session):
    count = session.query(func.count()).select_from(News).scalar()
    logger.debug(f"Total news: {count}")
    return count


def create_document_to_db(session, title, description, uploaded_by, file_url, filename=None):
    news_id = uuid.uuid4()
    doc = Document(
        id=news_id,
        title=title,
        description=description,
        uploaded_by=uploaded_by,
        filename=filename,
        file_url=file_url
    )
    session.add(doc)
    session.commit()
    session.refresh(doc)
    return doc


def get_document_from_db(session, doc_id):
    return session.query(Document).filter(Document.id == doc_id).first()


def get_all_documents_from_db(session, limit: int = 10, offset: int = 0) -> List[Document]:
    try:
        stmt = select(Document)

        stmt = stmt.order_by(desc(Document.created_at)).offset(offset).limit(limit)
        result = session.execute(stmt)
        return list(result.scalars().all())

    except Exception as e:
        print(f"Error getting all vacancies from DB: {e}")
        return []


def delete_document_from_db(session, doc_id) -> bool:
    doc = session.query(Document).filter(Document.id == doc_id).first()
    if doc:
        session.delete(doc)
        session.commit()
        return True
    return False

def create_contact_to_db(session: Session, contact_id: uuid.UUID, title: str, phones, emails, addresses):
    contact = Contact(id=contact_id, title=title)
    session.add(contact)
    session.flush()

    # Добавляем телефоны, email, адреса
    for phone in phones:
        session.add(ContactPhone(contact_id=contact_id, phone=phone))
    for email in emails:
        session.add(ContactEmail(contact_id=contact_id, email=email))
    for address in addresses:
        session.add(ContactAddress(contact_id=contact_id, address=address))

    session.commit()
    return contact

def get_contact_by_id(session: Session, contact_id: uuid.UUID):
    return session.query(Contact).filter(Contact.id == contact_id).first()

def get_all_contacts_from_db(session: Session, limit: int = 10, offset: int = 0) -> List[Contact]:
    """Получение всех контактов"""
    try:
        stmt = select(Contact).offset(offset).limit(limit)
        result = session.execute(stmt)
        return list(result.scalars().all())

    except Exception as e:
        print(f"Error getting all contacts from DB: {e}")
        return []


def update_contact_by_id(session: Session, contact_id: uuid.UUID, **kwargs) -> bool:
    """
    Обновляет контакт по UUID.
    kwargs могут содержать:
        - title: str
        - phones: List[str]
        - emails: List[str]
        - addresses: List[str]
    """
    contact = session.get(Contact, contact_id)
    if not contact:
        return False

    # Обновляем title
    if 'title' in kwargs and kwargs['title'] is not None:
        contact.title = kwargs['title']

    # Перезаписываем телефоны
    if 'phones' in kwargs and kwargs['phones'] is not None:
        contact.phones.clear()
        for phone in kwargs['phones']:
            contact.phones.append(ContactPhone(phone=phone))

    # Перезаписываем emails
    if 'emails' in kwargs and kwargs['emails'] is not None:
        contact.emails.clear()
        for email in kwargs['emails']:
            contact.emails.append(ContactEmail(email=email))

    # Перезаписываем addresses
    if 'addresses' in kwargs and kwargs['addresses'] is not None:
        contact.addresses.clear()
        for addr in kwargs['addresses']:
            contact.addresses.append(ContactAddress(address=addr))

    session.commit()
    return True


def delete_contact_by_id(session: Session, contact_id: uuid.UUID) -> bool:
    """Удаление контакта"""
    try:
        stmt = delete(Contact).where(Contact.id == contact_id)
        result = session.execute(stmt)
        session.commit()

        return result.rowcount > 0

    except Exception as e:
        session.rollback()
        print(f"Error deleting vacancy from DB: {e}")
        return False


def add_project_to_db(title: str, description: str, uploaded_by: uuid.UUID, file_url:str, filename: str, session: Session) -> uuid.UUID:
    """Добавление новости"""
    project_id = uuid.uuid4()
    project = Project(
        id=project_id,
        title=title,
        description=description,
        uploaded_by=uploaded_by,
        file_url=file_url,
        filename=filename,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    session.add(project)
    session.commit()
    return project_id


def get_project_from_db(session: Session, project_id: uuid.UUID) -> Optional[Project]:
    """Получение Проекта"""
    try:
        stmt = select(Project).where(Project.id == project_id)
        result = session.execute(stmt)
        return result.scalar_one_or_none()
    except Exception as e:
        session.rollback()
        raise e

def update_project_in_db(session: Session, project_id: uuid.UUID, **kwargs) -> bool:
    """Обновление новости"""
    try:
        allowed_fields = {'title', 'description', 'uploaded_by'}
        update_data = {k: v for k, v in kwargs.items() if k in allowed_fields}

        if not update_data:
            return False

        update_data['updated_at'] = datetime.now(timezone.utc)

        stmt = update(Project).where(Project.id == project_id).values(**update_data)
        result = session.execute(stmt)
        session.commit()

        return result.rowcount > 0
    except Exception as e:
        session.rollback()
        raise e


def delete_project_from_db(session: Session, project_id: uuid.UUID) -> bool:
    """Удаление Проекта"""
    try:
        stmt = delete(Project).where(Project.id == project_id)
        result = session.execute(stmt)
        session.commit()
        return result.rowcount > 0
    except Exception as e:
        session.rollback()
        raise e


def get_all_projects(session: Session, limit: int = 10, offset: int = 0,
                         order_by: str = "created_at", descending: bool = True) -> List[Project]:
    """Получение всех проектов"""
    try:
        # Выбор поля для сортировки
        order_column = {
            "created_at": Project.created_at,
            "updated_at": Project.updated_at,
            "title": Project.title
        }.get(order_by, Project.created_at)

        order_direction = desc(order_column) if descending else asc(order_column)

        stmt = select(Project).order_by(order_direction).offset(offset).limit(limit)
        result = session.execute(stmt)
        return list(result.scalars().all())
    except Exception as e:
        session.rollback()
        raise e