import logging
from configuration.config import settings

def setup_logger():
    logging.basicConfig(
        level=settings.logging.level,
        format=settings.logging.format,
        datefmt=settings.logging.datefmt,
    )
    logger = logging.getLogger("auth_service")
    return logger


logger = setup_logger()
