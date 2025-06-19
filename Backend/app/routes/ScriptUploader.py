from flask import request, jsonify,session
from app.routes import script_routes
from app import mongo
import datetime

@script_routes.route('/upload', methods=['POST'])
def upload_script():
    if not request.is_json:
        return jsonify({"error": "Expected JSON data"}), 400

    data = request.get_json()

    required_fields = ["name", "code", "uploadedBy"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    name = data["name"]
    code = data["code"]
    uploaded_by = data["uploadedBy"]
    description = data.get("description", "")
    script_type = data.get("scriptType", "System")
    script_subtype = data.get("scriptSubType", "System")
    now = str(datetime.datetime.now())
    if name.endswith(".py"):
        name = name[:-3]
    script_doc = {
        "name": name,
        "uploadedAt": now,
        "uploadedBy": uploaded_by,
        "description": description,
        "scriptType": script_type,
        "scriptSubType": script_subtype,
        "code": code
    }

    all_scripts_col = mongo.db.AllScript

    existing = all_scripts_col.find_one({"name": name})
    if existing:
        all_scripts_col.update_one({"name": name}, {"$set": script_doc})
        script_id = str(existing["_id"])
        message = "Script updated successfully"
    else:
        result = all_scripts_col.insert_one(script_doc)
        script_id = str(result.inserted_id)
        message = "Script uploaded successfully"

    return jsonify({"message": message, "script_id": script_id}), 201

@script_routes.route("/scripts", methods=["GET"])
def get_scripts():
    scripts = mongo.db.AllScript.find({}, {"name": 1, "_id": 0})
    return jsonify([script["name"] for script in scripts])

