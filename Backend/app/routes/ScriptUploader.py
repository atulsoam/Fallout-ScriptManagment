from flask import request, jsonify,session
from app.routes import script_routes
from app import mongo
import datetime
from bson import ObjectId
from app.services.UniversalService import send_email_notification
from app.services.auth_service import require_roles_from_admin_controls

@script_routes.route('/upload', methods=['POST'])
def upload_script():
    if not request.is_json:
        return jsonify({"error": "Expected JSON data"}), 400

    data = request.get_json()

    required_fields = ["name", "code", "uploadedBy", "approver"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Normalize name (strip .py if present)
    name = data["name"].rsplit('.', 1)[0]

    script_doc = {
        "name": name,
        "code": data["code"],
        "uploadedBy": data["uploadedBy"],
        "approver": data["approver"],
        "description": data.get("description", ""),
        "scriptType": data.get("scriptType", "System"),
        "scriptSubType": data.get("scriptSubType", "System"),
        "tags": data.get("tags", []),
        "uploadedAt": str(datetime.datetime.now()),
        "isApproved": False,     # Approval flag
        "status": "Pending" ,     # Status: Pending, Approved, Rejected
        "isEnabled": False
    }

    all_scripts_col = mongo.db.AllScript

    existing = all_scripts_col.find_one({"name": name})
    if existing:
        all_scripts_col.update_one({"name": name}, {"$set": script_doc})
        script_id = str(existing["_id"])
        message = "Script updated and set to pending approval"
    else:
        _id = ObjectId()
        script_doc["_id"] = str(_id)
        all_scripts_col.insert_one(script_doc)
        script_id = str(_id)
        message = "Script uploaded and pending approval"

    return jsonify({"message": message, "script_id": script_id}), 201


@script_routes.route('/approve/<script_id>', methods=['POST'])
@require_roles_from_admin_controls(['admin', 'approver'])
def approve_script(script_id):
    data = request.get_json()
    approver = data.get("cuid")
    
    if not approver:
        return jsonify({"error": "Approver is required"}), 400

    all_scripts_col = mongo.db.AllScript
    script = all_scripts_col.find_one({"_id": script_id})

    if not script:
        return jsonify({"error": "Script not found"}), 404

    if script["approver"] != approver:
        return jsonify({"error": "You are not authorized to approve this script"}), 403

    all_scripts_col.update_one(
        {"_id": script_id},
        {"$set": {"isApproved": True,"isEnabled": True, "status": "Approved", "approvedAt": str(datetime.datetime.now())}}
    )
    # send_email_notification(
    # to_email=script["uploadedBy"],
    # subject="Script Approval Update",
    # body=f"Your script '{script['name']}' has been approved."  # or rejected with reason
    # )


    return jsonify({"message": "Script approved successfully"}), 200

@script_routes.route('/reject/<script_id>', methods=['POST'])
@require_roles_from_admin_controls(['admin', 'approver'])
def reject_script(script_id):
    data = request.get_json()
    approver = data.get("cuid")
    reason = data.get("reason", "").strip()

    if not approver or not reason:
        return jsonify({"error": "Approver and rejection reason are required"}), 400

    all_scripts_col = mongo.db.AllScript
    script = all_scripts_col.find_one({"_id": script_id})

    if not script:
        return jsonify({"error": "Script not found"}), 404

    if script["approver"] != approver:
        return jsonify({"error": "You are not authorized to reject this script"}), 403

    all_scripts_col.update_one(
        {"_id": script_id},
        {"$set": {
            "isApproved": False,
            "isEnabled": False,
            "status": "Rejected",
            "rejectionReason": reason,
            "rejectedAt": str(datetime.datetime.now())
        }}
    )

    # Send email notification to uploader
    # send_email_notification(script["uploadedBy"], f"Script '{script['name']}' was rejected", reason)

    return jsonify({"message": "Script rejected successfully"}), 200

@script_routes.route("/scripts", methods=["GET"])
def get_scripts():
    scripts = mongo.db.AllScript.find(
        {"isApproved": True, "isEnabled": True},  # Filter
        {
            "_id": 1,
            "name": 1,
            "uploadedBy": 1,
            "uploadedAt": 1,
            "description": 1,
            "scriptType": 1,
            "scriptSubType": 1,
            "code": 1
        }
    )

    output = []
    for script in scripts:
        output.append({
            "id": str(script["_id"]),
            "name": script["name"],
            "uploadedBy": script.get("uploadedBy", "Unknown"),
            "uploadedAt": script.get("uploadedAt", ""),
            "description": script.get("description", ""),
            "scriptType": script.get("scriptType", "System"),
            "scriptSubType": script.get("scriptSubType", "System"),
            "code": script.get("code", "Not found")
        })

    return jsonify(output), 200


@script_routes.route('/updateScripts/<script_id>', methods=['PUT'])
def update_script(script_id):
    if not request.is_json:
        return jsonify({"error": "Expected JSON data"}), 400

    data = request.get_json()

    # Fields allowed to update (metadata + enable toggle)
    allowed_fields = ["description", "scriptType", "scriptSubType", "isEnabled"]
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    all_scripts_col = mongo.db.AllScript

    # Optional: validate enable/disable only if approved
    if "isEnabled" in update_fields:
        script = all_scripts_col.find_one({"_id": script_id})
        if not script:
            return jsonify({"error": "Script not found"}), 404
        if not script.get("isApproved", False):
            return jsonify({"error": "Only approved scripts can be enabled or disabled"}), 403

    result = all_scripts_col.update_one(
        {"_id": script_id},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Script not found"}), 404

    return jsonify({"message": "Script updated successfully"}), 200

# Delete script by ID
@script_routes.route('/deleteScripts/<script_id>', methods=['DELETE'])
def delete_script(script_id):
    all_scripts_col = mongo.db.AllScript

    result = all_scripts_col.delete_one({"_id": str(script_id)})

    if result.deleted_count == 0:
        return jsonify({"error": "Script not found"}), 404

    return jsonify({"message": "Script deleted successfully"}), 200

@script_routes.route("/getscriptcatogery", methods=["GET"])
def scriptCatogeries():
    AllInfo = list(mongo.db.categorySubCategory.find())[0]
    del AllInfo["_id"]
    return jsonify(AllInfo)


@script_routes.route("/addScriptType", methods=["POST"])
def AddScriptType():
    data = request.json
    scriptType = data["scriptType"]
    AllInfo = list(mongo.db.categorySubCategory.find())[0]
    scriptTypes = AllInfo["scriptType"]
    if scriptType not in scriptTypes:
        scriptTypes.append(scriptType)
        mongo.db.categorySubCategory.update_one({}, {"$set": {"scriptType": scriptTypes}})
        return jsonify({"message": "Script type added successfully"}), 200
    else:
        return jsonify({"error": "Script type already exists"}), 400


@script_routes.route("/addScriptSubType", methods=["POST"])
def AddScriptSubType():
    data = request.json
    scriptSubType = data["scriptSubType"]
    AllInfo = list(mongo.db.categorySubCategory.find())[0]
    scriptSubTypes = AllInfo["scriptSubType"]
    if scriptSubType not in scriptSubTypes:
        scriptSubTypes.append(scriptSubType)
        mongo.db.categorySubCategory.update_one({}, {"$set": {"scriptSubType": scriptSubTypes}})
        return jsonify({"message": "Script sub type added successfully"}), 200
    else:
        return jsonify({"error": "Script sub type already exists"}), 400

