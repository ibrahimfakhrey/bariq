"""
Bariq Al-Yusr Application Factory
"""
import os
from flask import Flask, jsonify, send_from_directory
from app.config import config
from app.extensions import db, migrate, jwt, cors, limiter


def create_app(config_name=None):
    """Create and configure the Flask application"""

    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    # Get the frontend build directory
    frontend_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'dist')
    static_folder = os.path.join(frontend_folder, 'static')

    app = Flask(
        __name__,
        static_folder=static_folder,
        static_url_path='/static'
    )
    app.config.from_object(config[config_name])
    app.config['FRONTEND_FOLDER'] = frontend_folder

    # Initialize extensions
    register_extensions(app)

    # Register blueprints
    register_blueprints(app)

    # Register frontend routes (for serving React build)
    register_frontend_routes(app)

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

    # JWT identity serialization - allows dict identities
    import json

    @jwt.user_identity_loader
    def user_identity_lookup(identity):
        """Convert identity dict to JSON string for JWT subject"""
        if isinstance(identity, dict):
            return json.dumps(identity)
        return identity

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        """Convert JWT subject back to dict for get_jwt_identity()"""
        identity = jwt_data["sub"]
        if isinstance(identity, str):
            try:
                return json.loads(identity)
            except json.JSONDecodeError:
                return identity
        return identity


def register_blueprints(app):
    """Register Flask blueprints"""
    from app.api.v1 import api_v1_bp
    app.register_blueprint(api_v1_bp, url_prefix='/api/v1')


def register_frontend_routes(app):
    """Register routes to serve React frontend in production"""

    @app.route('/')
    def serve_index():
        """Serve the React app's index.html"""
        frontend_folder = app.config.get('FRONTEND_FOLDER')
        if frontend_folder and os.path.exists(os.path.join(frontend_folder, 'index.html')):
            return send_from_directory(frontend_folder, 'index.html')
        return jsonify({'message': 'Bariq Al-Yusr API', 'version': '1.0.0'})

    @app.route('/<path:path>')
    def serve_static_or_index(path):
        """Serve static files or fall back to index.html for client-side routing"""
        frontend_folder = app.config.get('FRONTEND_FOLDER')

        # Skip API routes
        if path.startswith('api/'):
            return jsonify({'success': False, 'message': 'Not found'}), 404

        if frontend_folder:
            # Try to serve the requested file
            file_path = os.path.join(frontend_folder, path)
            if os.path.isfile(file_path):
                return send_from_directory(frontend_folder, path)

            # Fall back to index.html for client-side routing
            if os.path.exists(os.path.join(frontend_folder, 'index.html')):
                return send_from_directory(frontend_folder, 'index.html')

        return jsonify({'success': False, 'message': 'Not found'}), 404


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
