import uuid
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID
from sqlalchemy.orm import Session

from database import database_functions

from models.models import Document

from models.models import ContactPhone


def create_contact(session: Session, contact_id: UUID, title: str):
    result = database_functions.create_contact_to_db(session=session, contact_id=contact_id, title=title)
    return result

def add_phone_to_contact(session: Session, contact_id: UUID, phone: str):
    result = database_functions.add_phone_to_contact_to_db(session=session, contact_id=contact_id, phone=phone)
    return result