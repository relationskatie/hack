from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from configuration.config import settings


class DatabaseHelper:
    def __init__(
        self,
        url: str,
        echo: bool = False,
        pool_size: int = 5,
        max_overflow: int = 10,
    ) -> None:
        self.engine = create_engine(
            "postgresql+psycopg2://content_user:content123pass@postgres_content:5432/content_bd",
            echo=echo,
            pool_size=pool_size,
            max_overflow=max_overflow,
        )
        self.session_factory = sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    def get_session(self) -> Session:
        return self.session_factory()



db_helper = DatabaseHelper(
    url="postgresql+psycopg2://content_user:content123pass@postgres_content:5432/content_bd",
    echo=settings.db.echo,
    pool_size=settings.db.pool_size,
    max_overflow=settings.db.max_overflow,
)


def get_session() -> Session:
    return db_helper.get_session()
