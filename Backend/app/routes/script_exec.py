from flask import Blueprint, request, jsonify, current_app
from app import mongo,socketio
from app.services.script_executor import run_script as executeScript,stop_script,get_running_scripts
import datetime
from app.routes import script_routes
from bson import ObjectId
from app.db_manager import get_collection

@script_routes.route('/run-script', methods=['POST'])
def run_script():
    """
    Start a script by name.
    ---
    tags:
      - Scripts
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            scriptName:
              type: string
              example: "MyScript"
            Cuid:
              type: string
              example: "user123"
    responses:
      200:
        description: Script started
        schema:
          type: object
          properties:
            message:
              type: string
            execId:
              type: string
      400:
        description: Missing scriptName
      404:
        description: Script not found
    """
    data = request.json
    script_name = data.get("scriptName")
    loggedInUser = data.get("Cuid", "System")
    SCRIPTS_COLLECTION = get_collection("SCRIPTS_COLLECTION")
    SCRIPTS_EXECUTION_COLLECTION = get_collection("SCRIPTS_EXECUTION_COLLECTION")
    if not script_name:
        return jsonify({"error": "Missing scriptName"}), 400

    script_doc = SCRIPTS_COLLECTION.find_one({"name": script_name})
    if not script_doc:
        return jsonify({"error": "Script not found"}), 404

    script_code = script_doc.get("code")

    exec_id = str(ObjectId())

    SCRIPTS_EXECUTION_COLLECTION.insert_one({
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

    executeScript(script_name, script_code, exec_id, SCRIPTS_EXECUTION_COLLECTION)

    return jsonify({"message": "Script started", "execId": exec_id}), 200


@script_routes.route('/running-scripts', methods=['GET'])
def list_running_scripts():
    """
    List all running scripts.
    ---
    tags:
      - Scripts
    responses:
      200:
        description: List of running scripts
        schema:
          type: array
          items:
            type: object
    """
    running = get_running_scripts()
    return jsonify(running), 200

@script_routes.route('/stop', methods=['POST'])
def stop_script_route():
    """
    Stop a running script.
    ---
    tags:
      - Scripts
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            execId:
              type: string
              example: "60d..."
    responses:
      200:
        description: Script terminated
      400:
        description: Missing execId
      404:
        description: Script not found or already stopped
    """
    exec_id = request.json.get("execId")
    if not exec_id:
        return jsonify({"error": "Missing execId"}), 400
    success = stop_script(exec_id)
    if success:
        return jsonify({"message": f"Script {exec_id} terminated"}), 200
    return jsonify({"error": "Script not found or already stopped"}), 404

@script_routes.route('/logs', methods=['POST'])
def FetchLogs():
    """
    Fetch logs for a script execution.
    ---
    tags:
      - Scripts
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            execId:
              type: string
              example: "60d..."
    responses:
      200:
        description: Logs returned
        schema:
          type: object
          properties:
            logs:
              type: array
              items:
                type: string
      400:
        description: Missing execId
    """
    LOGS_COLLECTION = get_collection("LOGS_COLLECTION")
    exec_id = request.json.get("execId")
    if not exec_id:
        return jsonify({"error": "Missing execId"}), 400

    logs_cursor = LOGS_COLLECTION.find({"exec_id": exec_id}).sort("timestamp", 1)
    logs = []

    for doc in logs_cursor:
        logs.extend([line["text"] for line in doc.get("lines", [])])

    return jsonify({"logs": logs}), 200

@script_routes.route('/test-socket')
def test_socket():
    """
    Test socket emission.
    ---
    tags:
      - Scripts
    responses:
      200:
        description: Socket message emitted
        schema:
          type: object
          properties:
            message:
              type: string
    """
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
    """
    Run code from the code editor.
    ---
    tags:
      - Scripts
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "MyScript"
            code:
              type: string
              example: "print('Hello')"
            Cuid:
              type: string
              example: "user123"
    responses:
      200:
        description: Script started
        schema:
          type: object
          properties:
            message:
              type: string
            execId:
              type: string
      400:
        description: Missing scriptName
    """
    data = request.json
    script_name = data.get("name")
    loggedInUser = data.get("Cuid", "System")
    SCRIPTS_COLLECTION = get_collection("SCRIPTS_COLLECTION")
    SCRIPTS_EXECUTION_COLLECTION = get_collection("SCRIPTS_EXECUTION_COLLECTION")
    if not script_name:
        return jsonify({"error": "Missing scriptName"}), 400

    script_doc = SCRIPTS_COLLECTION.find_one({"name": script_name})
    # if not script_doc:
    #     return jsonify({"error": "Script not found"}), 404

    script_code = data.get("code")

    exec_id = str(ObjectId())

    SCRIPTS_EXECUTION_COLLECTION.insert_one({
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

    executeScript(script_name, script_code, exec_id, SCRIPTS_EXECUTION_COLLECTION)

    return jsonify({"message": "Script started", "execId": exec_id}), 200


