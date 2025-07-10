from flask import Blueprint, request, jsonify, current_app
from app import mongo
from app.services.ScriptDashBoardservice import get_dashboard_counts
import datetime
from app.routes import script_routes
from bson import ObjectId



@script_routes.route('/dashboard', methods=['GET'])
def Dashboard():
    """
    Get dashboard summary counts.
    ---
    tags:
      - Dashboard
    parameters:
      - in: query
        name: days
        type: integer
        required: false
        description: Number of days to include (default 10)
      - in: query
        name: top_n
        type: integer
        required: false
        description: Number of top scripts to return (default 5)
    responses:
      200:
        description: Dashboard summary data
        schema:
          type: object
    """
    # Get query parameters with default values
    days = request.args.get('days', default=10, type=int)
    top_n = request.args.get('top_n', default=5, type=int)

    # Call your function with parameters
    summary = get_dashboard_counts(days=days, top_n=top_n)

    return jsonify(summary)

    

