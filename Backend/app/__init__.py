from flask import Flask
from flask_pymongo import PyMongo # type: ignore
from flask_cors import CORS # type: ignore
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler # type: ignore
from config import Config

socketio = SocketIO(async_mode="threading", cors_allowed_origins="*")
mongo = PyMongo()
scheduler = BackgroundScheduler()

ANALYTICS_DB = None
SCRIPT_DB = None

USERS_COLLECTION = None
LOGS_COLLECTION = None
SCRIPTS_COLLECTION = None
SCHEDULES_COLLECTION = None
SCRIPTS_EXECUTION_COLLECTION = None
ADMIN_CONTROLLS = None
CATEGORY_SUB_CATEGORY = None
EMAIL_RECORD = None
EMAIL_CONFIG = None
FRONTEND_URL = None


def create_app():
    global ANALYTICS_DB, SCRIPT_DB
    global USERS_COLLECTION, LOGS_COLLECTION, SCRIPTS_COLLECTION, SCHEDULES_COLLECTION,SCRIPTS_EXECUTION_COLLECTION, ADMIN_CONTROLLS, CATEGORY_SUB_CATEGORY, EMAIL_RECORD, EMAIL_CONFIG, FRONTEND_URL

    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True)
    mongo.init_app(app)

    # Get both databases
    ANALYTICS_DB = mongo.cx[Config.ANALYTICS_DB]
    SCRIPT_DB = mongo.cx[Config.SCRIPT_DB]

    USERS_COLLECTION = SCRIPT_DB[Config.USERS_COLLECTION]
    LOGS_COLLECTION = SCRIPT_DB[Config.LOGS_COLLECTION]
    SCRIPTS_COLLECTION = SCRIPT_DB[Config.SCRIPTS_COLLECTION]
    SCHEDULES_COLLECTION = SCRIPT_DB[Config.SCHEDULES_COLLECTION]
    SCRIPTS_EXECUTION_COLLECTION = SCRIPT_DB[Config.SCRIPTS_EXECUTION_COLLECTION]
    ADMIN_CONTROLLS = SCRIPT_DB[Config.ADMIN_CONTROLLS]
    CATEGORY_SUB_CATEGORY = SCRIPT_DB[Config.CATEGORY_SUB_CATEGORY]
    EMAIL_RECORD = SCRIPT_DB[Config.EMAIL_RECORD]
    EMAIL_CONFIG = SCRIPT_DB[Config.EMAIL_CONFIG]
    FRONTEND_URL = Config.FRONTEND_URL
        

    socketio.init_app(app)
    scheduler.start()

    from app.routes import script_routes, auth, ScriptUploader, script_exec, ScriptScheduler, ScriptDashBoard, AdminRoutes
    app.register_blueprint(script_routes)

    return app
