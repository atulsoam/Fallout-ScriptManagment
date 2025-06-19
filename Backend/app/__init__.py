from flask import Flask
from flask_pymongo import PyMongo
from flask_session import Session
from flask_cors import CORS

mongo = PyMongo()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    CORS(app, supports_credentials=True)  # Enable CORS for frontend

    Session(app)
    mongo.init_app(app)

    from app.routes import script_routes, auth,ScriptUploader  # <-- add this line

    app.register_blueprint(script_routes)


    return app
