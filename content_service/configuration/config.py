from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import BaseModel, PostgresDsn
import logging
from typing import Literal
from pydantic import BaseModel, Field, PostgresDsn, AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class LoggingConfig(BaseModel):
    level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "DEBUG"
    format: str = "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s"
    datefmt: str = "%Y-%m-%d %H:%M:%S"

class DatabaseConfig(BaseModel):
    url: PostgresDsn
    echo: bool = False
    echo_pool: bool = False
    pool_size: int = 50
    max_overflow: int = 10


class MinioConfig(BaseModel):
    endpoint: str
    access_key: str
    secret_key: str
    secure: bool
    region: str
    public_url: str
    max_file_size: int

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
        env_nested_delimiter="__",
        env_prefix="APP_CONFIG__",
    )

    db: DatabaseConfig
    minio: MinioConfig
    logging: LoggingConfig = LoggingConfig()




settings = Settings()