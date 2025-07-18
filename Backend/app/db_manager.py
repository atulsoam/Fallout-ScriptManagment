from flask import current_app
from app import mongo
from config import Config

def get_collection(name):
    return current_app.config[name]

def get_script_db():
    return current_app.config["SCRIPT_DB"]

def get_analytics_db():
    return current_app.config.get("ANALYTICS_DB",mongo.cx[Config.ANALYTICS_DB])
