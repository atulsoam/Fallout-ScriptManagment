from flask import Blueprint

script_routes = Blueprint('script_routes', __name__)

from . import script_history
