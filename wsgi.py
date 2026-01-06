"""
WSGI Entry Point with WebSocket Support
"""
from app import create_app
from app.extensions import socketio

app = create_app()

if __name__ == '__main__':
    # Run with SocketIO support using threading mode
    socketio.run(
        app,
        debug=True,
        host='0.0.0.0',
        port=5001,
        use_reloader=False,
        log_output=True,
        allow_unsafe_werkzeug=True
    )
