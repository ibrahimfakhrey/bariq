"""
Flask Extensions Initialization
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_socketio import SocketIO

# Database
db = SQLAlchemy()

# Migrations
migrate = Migrate()

# JWT Authentication
jwt = JWTManager()

# CORS
cors = CORS()

# Rate Limiting
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per minute"]
)

# WebSocket / Real-time
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode='threading',
    logger=False,
    engineio_logger=False
)
