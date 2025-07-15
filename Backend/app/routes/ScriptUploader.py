from flask import request, jsonify,session # type: ignore
from app.routes import script_routes
from app import mongo,FrontendURL
import datetime
from bson import ObjectId
from app.services.UniversalService import send_email_notification,GetUserDetaials,GetInternalCCList
from app.services.EmailBody import FrameEmailBody
from app.services.auth_service import require_roles_from_admin_controls

@script_routes.route('/upload', methods=['POST'])
def upload_script():
    """
    Upload a new script or update an existing one.
    ---
    tags:
      - ScriptUploader
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "MyScript.py"
            code:
              type: string
              example: "print('Hello')"
            uploadedBy:
              type: string
              example: "user123"
            approver:
              type: string
              example: "approver123"
            description:
              type: string
              example: "This script does X"
            scriptType:
              type: string
              example: "System"
            scriptSubType:
              type: string
              example: "Utility"
            tags:
              type: array
              items:
                type: string
    responses:
      201:
        description: Script uploaded or updated
        schema:
          type: object
          properties:
            message:
              type: string
            script_id:
              type: string
      400:
        description: Missing required fields
    """
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
      
    currentUser = GetUserDetaials(data["uploadedBy"])
    approveruser = GetUserDetaials(data["approver"])
    CCList = GetInternalCCList()
    framedBody = FrameEmailBody(
    script_title=name,
    script_author=currentUser["username"] if currentUser and currentUser.get("username") else data["uploadedBy"],
    submission_date=str(datetime.datetime.now().date()),
    script_description=data.get("description", ""),
    action_required=True,
    info_link=f"{FrontendURL}/adminRequests",
    recipient_name=approveruser["username"] if approveruser and approveruser.get("username") else data["approver"],
    msg=f"""{currentUser.get("username","")} has uploaded a new script and wants your approval""",
)
        
    send_email_notification(
            receiverlist=[approveruser["email"] if approveruser and approveruser.get("email") else data["approver"]],
            CCList=CCList.append(currentUser["email"] if currentUser and currentUser.get("email") else data["uploadedBy"]),
            subject=f"Script {name} Uploaded for Approval",
            body=framedBody,
        )
    return jsonify({"message": message, "script_id": script_id}), 201


@script_routes.route('/approve/<script_id>', methods=['POST'])
@require_roles_from_admin_controls(['admin', 'approver'])
def approve_script(script_id):
    """
    Approve a script by ID.
    ---
    tags:
      - ScriptUploader
    parameters:
      - in: path
        name: script_id
        type: string
        required: true
        description: Script ID to approve
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "approver123"
    responses:
      200:
        description: Script approved successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Approver is required
      404:
        description: Script not found
    """
    data = request.get_json()
    approver = data.get("cuid")
    
    if not approver:
        return jsonify({"error": "Approver is required"}), 400

    all_scripts_col = mongo.db.AllScript
    script = all_scripts_col.find_one({"_id": script_id})

    if not script:
        return jsonify({"error": "Script not found"}), 404

    # if script["approver"] != approver:
    #     return jsonify({"error": "You are not authorized to approve this script"}), 403

    all_scripts_col.update_one(
        {"_id": script_id},
        {"$set": {"isApproved": True,"isEnabled": True, "status": "Approved", "approvedAt": str(datetime.datetime.now())}}
    )
    currentUser = GetUserDetaials(script["uploadedBy"])
    approveruser = GetUserDetaials(approver)
    CCList = GetInternalCCList()
    framedBody = FrameEmailBody(
        script_title=script["name"],
        script_author=currentUser["username"] if currentUser and currentUser.get("username") else script["uploadedBy"],
        submission_date=script["uploadedAt"],
        script_description=script.get("description", ""),
        action_required=False,
        info_link=f"{FrontendURL}/upload",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else script["uploadedBy"],
        Information=f"""Your script '{script['name']}' has been Approved by {approveruser['username'] if approveruser and approveruser.get('username') else approver}.""",
        msg=f"""An action has been taken on your script: {script['name']}""",
    )
        
    send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else script["uploadedBy"]],
            CCList=CCList,
            subject=f"Script {script["name"]} Approved",
            body=framedBody,
        )


    return jsonify({"message": "Script approved successfully"}), 200

@script_routes.route('/reject/<script_id>', methods=['POST'])
@require_roles_from_admin_controls(['admin', 'approver'])
def reject_script(script_id):
    """
    Reject a script by ID.
    ---
    tags:
      - ScriptUploader
    parameters:
      - in: path
        name: script_id
        type: string
        required: true
        description: Script ID to reject
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "approver123"
            reason:
              type: string
              example: "Reason for rejection"
    responses:
      200:
        description: Script rejected successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Approver and rejection reason are required
      404:
        description: Script not found
    """
    data = request.get_json()
    approver = data.get("cuid")
    reason = data.get("reason", "").strip()

    if not approver or not reason:
        return jsonify({"error": "Approver and rejection reason are required"}), 400

    all_scripts_col = mongo.db.AllScript
    script = all_scripts_col.find_one({"_id": script_id})

    if not script:
        return jsonify({"error": "Script not found"}), 404

    # if script["approver"] != approver:
    #     return jsonify({"error": "You are not authorized to reject this script"}), 403

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

    currentUser = GetUserDetaials(script["uploadedBy"])
    approveruser = GetUserDetaials(approver)
    CCList = GetInternalCCList()
    framedBody = FrameEmailBody(
        script_title=script["name"],
        script_author=currentUser["username"] if currentUser and currentUser.get("username") else script["uploadedBy"],
        submission_date=script["uploadedAt"],
        script_description=script.get("description", ""),
        action_required=False,
        info_link=f"{FrontendURL}/upload",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else script["uploadedBy"],
        Information=f"""Your script '{script['name']}' has been Rejected by {approveruser['username'] if approveruser and approveruser.get('username') else approver}.
        Reason for rejection: {reason}
        """,
        msg=f"""An action has been taken on your script: {script['name']}""",
    )
        
    send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else script["uploadedBy"]],
            CCList=CCList,
            subject=f"Script {script["name"]} Rejected",
            body=framedBody,
        )

    return jsonify({"message": "Script rejected successfully"}), 200

@script_routes.route("/scripts", methods=["GET"])
def get_scripts():
    """
    Get all approved and enabled scripts.
    ---
    tags:
      - ScriptUploader
    responses:
      200:
        description: List of scripts
        schema:
          type: array
          items:
            type: object
    """
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
            "code": 1,
            "approver":1,
            "isApproved":1,
            "isEnabled":1,
            "status":1,
            "rejectionReason":1,
            "tags":1
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
            "code": script.get("code", "Not found"),
            "approver":script.get("approver","NA"),
            "isApproved":script.get("isApproved",False),
            "isEnabled":script.get("isEnabled",False),
            "rejectionReason":script.get("rejectionReason","NA"),
            "status":script.get("status","Pending"),
            "tags":script.get("tags",[])

        })

    return jsonify(output), 200



@script_routes.route("/AllScripts", methods=["GET"])
def get_Allscripts():
    """
    Get all scripts (admin view).
    ---
    tags:
      - ScriptUploader
    responses:
      200:
        description: List of all scripts
        schema:
          type: array
          items:
            type: object
    """
    scripts = mongo.db.AllScript.find(
        {},
        {
            "_id": 1,
            "name": 1,
            "uploadedBy": 1,
            "uploadedAt": 1,
            "description": 1,
            "scriptType": 1,
            "scriptSubType": 1,
            "code": 1,
            "approver":1,
            "isApproved":1,
            "isEnabled":1,
            "status":1,
            "rejectionReason":1
        
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
            "code": script.get("code", "Not found"),
            "approver":script.get("approver","NA"),
            "isApproved":script.get("isApproved",False),
            "isEnabled":script.get("isEnabled",False),
            "rejectionReason":script.get("rejectionReason","NA"),
            "status":script.get("status","Pending")

        })

    return jsonify(output), 200


@script_routes.route('/updateScripts/<script_id>', methods=['PUT'])
def update_script(script_id):
    """
    Update script metadata or enable/disable.
    ---
    tags:
      - ScriptUploader
    parameters:
      - in: path
        name: script_id
        type: string
        required: true
        description: Script ID to update
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            description:
              type: string
              example: "Updated description"
            scriptType:
              type: string
              example: "System"
            scriptSubType:
              type: string
              example: "Utility"
            isEnabled:
              type: boolean
              example: true
    responses:
      200:
        description: Script updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: No valid fields to update
      403:
        description: Only approved scripts can be enabled or disabled
      404:
        description: Script not found
    """
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
    """
    Delete a script by ID.
    ---
    tags:
      - ScriptUploader
    parameters:
      - in: path
        name: script_id
        type: string
        required: true
        description: Script ID to delete
    responses:
      200:
        description: Script deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Script not found
    """
    all_scripts_col = mongo.db.AllScript

    result = all_scripts_col.delete_one({"_id": str(script_id)})

    if result.deleted_count == 0:
        return jsonify({"error": "Script not found"}), 404

    return jsonify({"message": "Script deleted successfully"}), 200

@script_routes.route("/getscriptcatogery", methods=["GET"])
def scriptCatogeries():
    """
    Get all script categories and subcategories.
    ---
    tags:
      - ScriptUploader
    responses:
      200:
        description: Script categories and subcategories
        schema:
          type: object
    """
    AllInfo = list(mongo.db.categorySubCategory.find())[0]
    del AllInfo["_id"]
    return jsonify(AllInfo)


@script_routes.route("/addScriptType", methods=["POST"])
def AddScriptType():
    """
    Add a new script type.
    ---
    tags:
      - ScriptUploader
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            scriptType:
              type: string
              example: "NewType"
    responses:
      200:
        description: Script type added successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Script type already exists
    """
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
    """
    Add a new script sub type.
    ---
    tags:
      - ScriptUploader
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            scriptSubType:
              type: string
              example: "NewSubType"
    responses:
      200:
        description: Script sub type added successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Script sub type already exists
    """
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

