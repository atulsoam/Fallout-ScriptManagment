from functools import wraps
from flask import request, jsonify
from app import mongo
import logging
# logging.basicConfig(level=logging.DEBUG)
from app.db_manager import get_collection


def require_roles_from_admin_controls(allowed_roles=["admin", "approver"]):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            cuid = None
            ADMIN_CONTROLLS = get_collection("ADMIN_CONTROLLS")

            # Try JSON body if content type is application/json
            if request.is_json:
                data = request.get_json()
                cuid = data.get("requestedBy")

            # If not found, check query params
            if not cuid:
                cuid = request.args.get("cuid") or request.args.get("approver")

            # If still not found, check headers
            if not cuid:
                cuid = (
                    request.headers.get("X-CUID")
                    or request.headers.get("X-Approver")
                    or request.headers.get("X-Requested-By")
                )
                print(cuid, "in header")


            # DEBUG prints moved here
            # print(f"Request headers: {request.headers}")
            # print(f"Request args: {request.args}")
            # print(f"Request json: {request.get_json(silent=True)}")
            # print(f"Detected cuid: {cuid}")

            if not cuid:
                return jsonify({"error": "CUID is required"}), 400


            # Fetch control lists from DB
            controls = ADMIN_CONTROLLS.find_one({})
            if not controls:
                return jsonify({"error": "AdminControlls not configured"}), 500

            is_admin = cuid in controls.get("adminList", [])
            is_approver = cuid in controls.get("approverList", [])

            if "admin" in allowed_roles and is_admin:
                return f(*args, **kwargs)
            elif "approver" in allowed_roles and is_approver:
                return f(*args, **kwargs)

            return jsonify({"error": "Permission denied"}), 403
        return wrapper
    return decorator
