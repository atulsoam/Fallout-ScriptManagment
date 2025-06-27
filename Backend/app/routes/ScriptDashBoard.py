from flask import Blueprint, request, jsonify, current_app
from app import mongo
from app.services.ScriptDashBoardservice import get_dashboard_counts
import datetime
from app.routes import script_routes
from bson import ObjectId



@script_routes.route('/dashboard', methods=['GET'])
def Dashboard():
    # Get query parameters with default values
    days = request.args.get('days', default=10, type=int)
    top_n = request.args.get('top_n', default=5, type=int)

    # Call your function with parameters
    summary = get_dashboard_counts(days=days, top_n=top_n)

    return jsonify(summary)

    

