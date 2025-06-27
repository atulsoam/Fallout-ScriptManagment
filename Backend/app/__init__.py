from flask import Flask
from flask_pymongo import PyMongo
from flask_session import Session
from flask_cors import CORS
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler # type: ignore

socketio = SocketIO(async_mode="threading", cors_allowed_origins="*")
mongo = PyMongo()
scheduler = BackgroundScheduler()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')

    CORS(app, supports_credentials=True)
    Session(app)
    mongo.init_app(app)
    socketio.init_app(app)
    scheduler.start()  # Start scheduler once app is initialized

    from app.routes import script_routes, auth, ScriptUploader, script_exec,ScriptScheduler,ScriptDashBoard,AdminRoutes
    app.register_blueprint(script_routes)

    return app
