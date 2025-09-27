import uuid
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from database import database_functions

def create_vacancy(session: Session, position: str, description: str, salary: str, is_active: bool):
    """Создание вакансии"""
    result = database_functions.add_vacancy_to_db(
        session=session,
        position=position,
        description=description,
        salary=salary,
        is_active=is_active
    )
    return result

def get_vacancy(session: Session, vacancy_id: UUID):
    """Получение вакансии"""
    result = database_functions.get_vacancy_by_id(session=session, vacancy_id=vacancy_id)
    return result

def update_vacancy(session: Session, vacancy_id: UUID, **kwargs):
    """Обновление вакансии"""
    result = database_functions.update_vacancy_in_db(session=session, vacancy_id=vacancy_id, **kwargs)
    return result

def delete_vacancy(session: Session, vacancy_id: UUID):
    """Удаление вакансии"""
    result = database_functions.delete_vacancy_from_db(session=session, vacancy_id=vacancy_id)
    return result

def get_all_vacancies(session: Session, limit: int = 10, offset: int = 0):
    """Получение списка вакансий"""
    result = database_functions.get_all_vacancies_from_db(
        session=session,
        limit=limit,
        offset=offset,
    )
    return result

def get_active_vacancies(session: Session, limit: int = 10, offset: int = 0):
    """Получение списка вакансий"""
    result = database_functions.get_active_vacancies_from_db(
        session=session,
        limit=limit,
        offset=offset,
    )
    return result

def get_count_vacancies(session: Session) -> int:
    return database_functions.get_total_vacancies(session=session)