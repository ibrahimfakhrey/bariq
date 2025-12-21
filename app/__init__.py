"""
Bariq Al-Yusr Application Factory
"""
import os
from flask import Flask, jsonify
from app.config import config
from app.extensions import db, migrate, jwt, cors, limiter


def create_app(config_name=None):
    """Create and configure the Flask application"""

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Initialize extensions
    register_extensions(app)

    # Register blueprints
    register_blueprints(app)

    # Register error handlers
    register_error_handlers(app)

    # Register CLI commands
    register_cli_commands(app)

    return app


def register_extensions(app):
    """Register Flask extensions"""
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired',
            'error_code': 'AUTH_002'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Invalid token',
            'error_code': 'AUTH_001'
        }), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Authorization token is missing',
            'error_code': 'AUTH_001'
        }), 401


def register_blueprints(app):
    """Register Flask blueprints"""
    from app.api.v1 import api_v1_bp
    app.register_blueprint(api_v1_bp, url_prefix='/api/v1')


def register_error_handlers(app):
    """Register error handlers"""

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'success': False,
            'message': 'Bad request',
            'error_code': 'VAL_001'
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Resource not found',
            'error_code': 'NOT_FOUND'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error_code': 'SYS_001'
        }), 500


def register_cli_commands(app):
    """Register CLI commands"""

    @app.cli.command('init-db')
    def init_db():
        """Initialize the database"""
        db.create_all()
        print('Database initialized!')

    @app.cli.command('seed-db')
    def seed_db():
        """Seed the database with initial data"""
        from scripts.seed_data import seed_all
        seed_all()
        print('Database seeded!')
