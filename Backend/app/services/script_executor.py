import re
import subprocess, tempfile, threading, os, traceback
import datetime
import sys
from app import mongo,socketio 
from app.db_manager import get_collection,get_analytics_db
from flask import current_app
import queue

# In-memory tracking
running_processes = {}

def update_running_script_status(docid, script_name, status,executions_collection,StatusDb, error_message=None):
    # StatusDb = get_analytics_db()
    collection = StatusDb[script_name]
    all_statuses = collection.distinct("status")
    status_list = {}

    for status_val in all_statuses:
        count = collection.count_documents({"status": status_val, "ScriptidentificationId": str(docid)})
        status_list[status_val] = count

    # Default values
    status_list.setdefault("Not Fixed", 0)
    status_list.setdefault("Fixed", 0)

    processed_doc = collection.find_one({
        "otherDetail": "processedAccounts",
        "ScriptidentificationId": str(docid)
    })
    status_list["processedAccounts"] = processed_doc.get("totalProcessedAccounts", 0) if processed_doc else 0

    status_list["Total"] = collection.count_documents({
        "ScriptidentificationId": str(docid),
        "otherDetail": {"$ne": "processedAccounts"}
    })

    if error_message:
        status_list["error"] = f"Got error in running script {error_message}"
    print(status_list,"statusList")
    executions_collection.update_one(
        {"_id": str(docid)},
        {"$set": {
            "status": status,
            "endTime": datetime.datetime.now(),
            "statusList": status_list
        }}
    )
    print(f"Updates are done",docid,script_name,status,error_message)

def run_script(script_name, script_code, exec_id, executions_collection):
    LOGS_COLLECTION = get_collection("LOGS_COLLECTION")
    ANALYTICS_DB  = get_analytics_db()
    def execute():
        start_time = datetime.datetime.now()  
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.py', mode='w') as temp_file:
                # script_code_Updted= re.sub(r'print\((.*?)\)', r'print(\1, flush=True)', script_code)
                temp_file.write(script_code + f"\n\nmain('{exec_id}')\n")  # Inject main(exec_id)

                # temp_file.write(script_code)
                temp_path = temp_file.name
            env = os.environ.copy()
            env["PYTHONUNBUFFERED"] = "1"
            proc = subprocess.Popen(
                [sys.executable,"-u", temp_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,  # line-buffered
                universal_newlines=True
            )

            running_processes[exec_id] = {
                "process": proc,
                "scriptName": script_name,
                "StartedAt":str(datetime.datetime.now())
            }
            runningItems = get_running_scripts()
            if runningItems:
                socketio.emit('runningJobs', runningItems)


            def stream_output(stream, stream_name):
                buffer = []
                batch_size = 500
                db_queue = queue.Queue()

                def db_worker():
                    while True:
                        batch = db_queue.get()
                        if batch is None:
                            break
                        LOGS_COLLECTION.insert_one(batch)
                        db_queue.task_done()

                db_thread = threading.Thread(target=db_worker, daemon=True)
                db_thread.start()

                try:
                    for line in iter(stream.readline, ''):
                        clean_line = line.strip()
                        if not clean_line:
                            continue

                        timestamp = str(datetime.datetime.now())
                        line_obj = {
                            "text": clean_line,
                            "timestamp": timestamp,
                            "stream_name": stream_name
                        }

                        # Emit throttled, e.g., sleep 5ms between emits if needed
                        socketio.emit('log_update', {
                            "exec_id": exec_id,
                            "script_name": script_name,
                            "line": line_obj
                        })

                        buffer.append(line_obj)

                        if len(buffer) >= batch_size:
                            db_queue.put({
                                "exec_id": exec_id,
                                "script_name": script_name,
                                "lines": buffer.copy(),
                                "stream_name": stream_name
                            })
                            buffer.clear()
                finally:
                    if buffer:
                        db_queue.put({
                            "exec_id": exec_id,
                            "script_name": script_name,
                            "lines": buffer,
                            "stream_name": stream_name
                        })

                    db_queue.put(None)  # Signal DB thread to finish
                    db_thread.join()
                    stream.close()



            stdout_thread = threading.Thread(target=stream_output, args=(proc.stdout, "stdout"))
            stderr_thread = threading.Thread(target=stream_output, args=(proc.stderr, "stderr"))
            stdout_thread.start()
            stderr_thread.start()

            proc.wait()
            stdout_thread.join()
            stderr_thread.join()

            status = "Completed" if proc.returncode == 0 else "Terminated"
            end_time = datetime.datetime.now()  
            duration = (end_time - start_time).total_seconds()
            executions_collection.update_one(
            {"_id": str(exec_id)},
            {"$set": {
                "Duration": str(duration)
            }}
            )
            update_running_script_status(exec_id, script_name, status,executions_collection,ANALYTICS_DB)                    
            socketio.emit("ScriptCompletion",{"exec_id":exec_id,"script_name":script_name,"duration":duration})

        except Exception as e:
            error_logs = traceback.format_exc().splitlines()
            for line in error_logs:
                LOGS_COLLECTION.insert_one({
                    "exec_id": exec_id,
                    "script_name": script_name,
                    "line": line,
                    "timestamp": datetime.datetime.now(),
                })
            update_running_script_status(exec_id, script_name, "Terminated",executions_collection,ANALYTICS_DB, str(e))

        finally:
            running_processes.pop(exec_id, None)
            try:
                os.remove(temp_path)
            except Exception:
                pass



    thread = threading.Thread(target=execute)
    thread.start()




def stop_script(exec_id):
    info = running_processes.get(exec_id)
    SCRIPTS_EXECUTION_COLLECTION = get_collection("SCRIPTS_EXECUTION_COLLECTION")
    LOGS_COLLECTION = get_collection("LOGS_COLLECTION")
    ANALYTICS_DB = get_analytics_db()
    if not info:
        return False

    proc = info.get("process")
    script_name = info.get("scriptName", "Unknown")

    if proc and proc.poll() is None:
        try:
            proc.terminate()
        except Exception as e:
            print(f"Error terminating script {exec_id}: {e}")
        
        # Mark script as terminated
        update_running_script_status(exec_id, script_name, "Terminated",SCRIPTS_EXECUTION_COLLECTION,ANALYTICS_DB,"Script Terminated Manually")


        # Log termination message as separate log entry
        LOGS_COLLECTION.insert_one({
            "exec_id": exec_id,
            "script_name": script_name,
            "line": "[Script manually terminated]",
            "timestamp": datetime.datetime.now()
        })

        # Clean up from memory
        running_processes.pop(exec_id, None)
        return True

    return False



def get_running_scripts():
    running = []
    for exec_id, info in running_processes.items():
        proc = info["process"]
        status = "running" if proc.poll() is None else f"completed ({proc.returncode})"
        print(f"{exec_id}: {info.get('scriptName')} - {status}")
        if proc.poll() is None:
            running.append({
                "execId": exec_id,
                "scriptName": info.get("scriptName", "Unknown"),
                "StartedAt":info.get("StartedAt",datetime.datetime.now())
            })
    return running


