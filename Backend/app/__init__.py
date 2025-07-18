# app/__init__.py

from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_socketio import SocketIO
from apscheduler.schedulers.background import BackgroundScheduler
from config import Config

mongo = PyMongo()
socketio = SocketIO(async_mode="threading", cors_allowed_origins="*")
scheduler = BackgroundScheduler()
FRONTEND_URL = "http://localhost:5173/"

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS and initialize extensions
    CORS(app, supports_credentials=True)
    mongo.init_app(app)
    socketio.init_app(app)
    scheduler.start()

    # --- Database Initialization ---
    analytics_db = mongo.cx[Config.ANALYTICS_DB]
    script_db = mongo.cx[Config.SCRIPT_DB]

    # --- Collections Setup (under SCRIPT_DB) ---
    app.config["ANALYTICS_DB"] = analytics_db
    app.config["SCRIPT_DB"] = script_db

    app.config["USERS_COLLECTION"] = script_db[Config.USERS_COLLECTION]
    app.config["LOGS_COLLECTION"] = script_db[Config.LOGS_COLLECTION]
    app.config["SCRIPTS_COLLECTION"] = script_db[Config.SCRIPTS_COLLECTION]
    app.config["SCHEDULES_COLLECTION"] = script_db[Config.SCHEDULES_COLLECTION]
    app.config["SCRIPTS_EXECUTION_COLLECTION"] = script_db[Config.SCRIPTS_EXECUTION_COLLECTION]
    app.config["ADMIN_CONTROLLS"] = script_db[Config.ADMIN_CONTROLLS]
    app.config["CATEGORY_SUB_CATEGORY"] = script_db[Config.CATEGORY_SUB_CATEGORY]
    app.config["EMAIL_RECORD"] = script_db[Config.EMAIL_RECORD]
    app.config["EMAIL_CONFIG"] = script_db[Config.EMAIL_CONFIG]
    app.config["CATEGORY_SUB_CATEGORY_COLLECTION"] = script_db[Config.CATEGORY_SUB_CATEGORY]

    app.config["FRONTEND_URL"] = Config.FRONTEND_URL

    # --- Register Blueprints ---
    from app.routes import script_routes,    auth, ScriptUploader, script_exec, ScriptScheduler, ScriptDashBoard, AdminRoutes
    app.register_blueprint(script_routes)

    return app
