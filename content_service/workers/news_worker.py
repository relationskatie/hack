import uuid
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from database import database_functions

from models.models import News


def create_news(session: Session, title: str, content: str, uploaded_by: UUID, file_url: str) -> Optional[News]:
    """Создание новости"""
    result = database_functions.add_news_to_db(session=session, title=title, content=content, uploaded_by=uploaded_by, file_url=file_url)
    return result

def get_news(session: Session, id: UUID) -> Optional[dict]:
    """Получение новости"""
    result = database_functions.get_news_by_id(session=session, news_id=id)
    return result

def get_all_news(session: Session, limit: int = 10, offset: int = 0) -> List[dict]:
    """Получение списка новостей"""
    result = database_functions.get_all_news_from_db(session=session, limit=limit, offset=offset)
    return result

def update_news(session: Session, news_id: UUID, title: Optional[str] = None,
                content: Optional[str] = None, uploaded_by: Optional[UUID] = None) -> bool:
    """Обновление новости"""
    result = database_functions.update_news_in_db(
        session=session,
        news_id=news_id,
        title=title,
        content=content,
        uploaded_by=uploaded_by
    )
    return result

def delete_news(session: Session, news_id: UUID) -> bool:
    """Удаление новости"""
    result = database_functions.delete_news_from_db(session=session, news_id=news_id)
    return result

def get_count_news(session: Session) -> int:
    return database_functions.get_total_news(session=session)