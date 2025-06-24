from flask import Blueprint

# Shared blueprint used across route modules
script_routes = Blueprint('script_routes', __name__)

# Import route modules to register routes
from . import script_history
