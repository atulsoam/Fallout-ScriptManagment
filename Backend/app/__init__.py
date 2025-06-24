from flask import Flask
from flask_pymongo import PyMongo
from flask_session import Session
from flask_cors import CORS
from flask_socketio import SocketIO
from flask_socketio import SocketIO

socketio = SocketIO( async_mode="threading", cors_allowed_origins="*")
mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    CORS(app, supports_credentials=True)
    Session(app)
    mongo.init_app(app)

    from app.routes import script_routes, auth, ScriptUploader, script_exec

    app.register_blueprint(script_routes)
    socketio.init_app(app)

    return app
