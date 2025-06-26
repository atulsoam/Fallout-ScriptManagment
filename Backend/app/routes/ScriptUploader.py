from flask import request, jsonify,session
from app.routes import script_routes
from app import mongo
import datetime
from bson import ObjectId


@script_routes.route('/upload', methods=['POST'])
def upload_script():
    if not request.is_json:
        return jsonify({"error": "Expected JSON data"}), 400

    data = request.get_json()

    required_fields = ["name", "code", "uploadedBy"]
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Extract and normalize fields
    name = data["name"].rsplit('.', 1)[0]  # Strip .py if present
    script_doc = {
        "name": name,
        "code": data["code"],
        "uploadedBy": data["uploadedBy"],
        "description": data.get("description", ""),
        "scriptType": data.get("scriptType", "System"),
        "scriptSubType": data.get("scriptSubType", "System"),
        "tags": data.get("tags", []),  # Optional future-proofing
        "uploadedAt": str(datetime.datetime.now())
    }

    all_scripts_col = mongo.db.AllScript

    existing = all_scripts_col.find_one({"name": name})
    if existing:
        all_scripts_col.update_one({"name": name}, {"$set": script_doc})
        script_id = str(existing["_id"])
        message = "Script updated successfully"
    else:
        _id = ObjectId()
        script_doc["_id"] = str(_id)
        result = all_scripts_col.insert_one(script_doc)
        script_id = str(_id)
        message = "Script uploaded successfully"

    return jsonify({"message": message, "script_id": script_id}), 201


@script_routes.route("/scripts", methods=["GET"])
def get_scripts():
    scripts = mongo.db.AllScript.find({}, {
        "_id": 1,
        "name": 1,
        "uploadedBy": 1,
        "uploadedAt": 1,
        "description": 1,
        "scriptType": 1,
        "scriptSubType": 1,
        "code":1
    })

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
            "code":script.get("code", "Not found")
        })

    return jsonify(output), 200



# Update script metadata by ID
@script_routes.route('/updateScripts/<script_id>', methods=['PUT'])
def update_script(script_id):
    if not request.is_json:
        return jsonify({"error": "Expected JSON data"}), 400

    data = request.get_json()

    # Fields allowed to update (metadata only)
    allowed_fields = ["description", "scriptType", "scriptSubType"]
    update_fields = {k: v for k, v in data.items() if k in allowed_fields}

    if not update_fields:
        return jsonify({"error": "No valid fields to update"}), 400

    all_scripts_col = mongo.db.AllScript

    result = all_scripts_col.update_one(
        {"_id": str(script_id)},
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

