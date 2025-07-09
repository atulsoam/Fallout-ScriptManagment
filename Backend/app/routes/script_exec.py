from flask import Blueprint, request, jsonify, current_app
from app import mongo,socketio
from app.services.script_executor import run_script as executeScript,stop_script,get_running_scripts
import datetime
from app.routes import script_routes
from bson import ObjectId

@script_routes.route('/run-script', methods=['POST'])
def run_script():
    data = request.json
    script_name = data.get("scriptName")
    loggedInUser = data.get("Cuid", "System")

    if not script_name:
        return jsonify({"error": "Missing scriptName"}), 400

    script_doc = mongo.db.AllScript.find_one({"name": script_name})
    if not script_doc:
        return jsonify({"error": "Script not found"}), 404

    script_code = script_doc.get("code")

    exec_id = str(ObjectId())

    mongo.db.RunningScript.insert_one({
        "_id": exec_id,  # Set _id as a string
        "script": script_name,
        "status": "running",
        "statusField": "status",
        "collectionName": script_name,
        "scriptType": script_doc.get("scriptType", "NA"),
        "user": loggedInUser,
        "ExecutedFrom":"ManualRun",
        "startTime": datetime.datetime.now(),
        "scriptSubType": script_doc.get("scriptSubType", "NA"),
        "createdAt": str(datetime.datetime.now().date()),
        "statusList":{
            "Fixed":0,
            "Not Fixed":0,
            "processedAccounts":0,
            "Total":0
        }
    })

    executeScript(script_name, script_code, exec_id, mongo.db.RunningScript)

    return jsonify({"message": "Script started", "execId": exec_id}), 200


@script_routes.route('/running-scripts', methods=['GET'])
def list_running_scripts():
    running = get_running_scripts()
    return jsonify(running), 200

@script_routes.route('/stop', methods=['POST'])
def stop_script_route():
    exec_id = request.json.get("execId")
    if not exec_id:
        return jsonify({"error": "Missing execId"}), 400
    success = stop_script(exec_id)
    if success:
        return jsonify({"message": f"Script {exec_id} terminated"}), 200
    return jsonify({"error": "Script not found or already stopped"}), 404

@script_routes.route('/logs', methods=['POST'])
def FetchLogs():
    exec_id = request.json.get("execId")
    if not exec_id:
        return jsonify({"error": "Missing execId"}), 400

    logs_cursor = mongo.db.ScriptLogs.find({"exec_id": exec_id}).sort("timestamp", 1)
    logs = []

    for doc in logs_cursor:
        logs.extend([line["text"] for line in doc.get("lines", [])])

    return jsonify({"logs": logs}), 200

@script_routes.route('/test-socket')
def test_socket():
    socketio.emit("log_update", {
        "exec_id": "test123",
        "script_name": "test_script",
        "line": {
            "text": "Hello from server!",
            "timestamp": str(datetime.utcnow())
        }
    })
    return {"message": "Emitted"}


@script_routes.route('/runCode', methods=['POST'])
def run_code():
    data = request.json
    script_name = data.get("name")
    loggedInUser = data.get("Cuid", "System")

    if not script_name:
        return jsonify({"error": "Missing scriptName"}), 400

    script_doc = mongo.db.AllScript.find_one({"name": script_name})
    # if not script_doc:
    #     return jsonify({"error": "Script not found"}), 404

    script_code = data.get("code")

    exec_id = str(ObjectId())

    mongo.db.RunningScript.insert_one({
        "_id": exec_id,  # Set _id as a string
        "script": script_name,
        "status": "running",
        "statusField": "status",
        "collectionName": script_name,
        "scriptType": script_doc.get("scriptType", "CodeEditor"),
        "user": loggedInUser,
        "ExecutedFrom":"CodeEditor",
        "startTime": datetime.datetime.now(),
        "scriptSubType": script_doc.get("scriptSubType", "CodeEditor"),
        "createdAt": str(datetime.datetime.now().date()),
        "statusList":{
            "Fixed":0,
            "Not Fixed":0,
            "processedAccounts":0,
            "Total":0
        }
    })

    executeScript(script_name, script_code, exec_id, mongo.db.RunningScript)

    return jsonify({"message": "Script started", "execId": exec_id}), 200
