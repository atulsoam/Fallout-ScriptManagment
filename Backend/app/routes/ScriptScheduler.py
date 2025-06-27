from flask import Blueprint, request, jsonify, current_app
from app import mongo,socketio,Session
import datetime
from app.routes import script_routes
from bson import ObjectId
from app.services.ScheduleService import schedule_script,load_existing_schedules,unschedule_script,DisableScript,exec_func
def serialize_job(job):
    return {
        "job_id": str(job["_id"]),
        "scriptName": job.get("scriptName"),
        "Cuid": job.get("Cuid"),
        "frequency": job.get("frequency"),
        "time": job.get("time"),
        "daysOfWeek": job.get("daysOfWeek"),
        "enabled": job.get("enabled"),
        "lastRun": job.get("lastRun").isoformat() if job.get("lastRun") else None,
        "nextRun": job.get("nextRun").isoformat() if job.get("nextRun") else None,
        "lastDuration": job.get("lastDuration"),
        "runCount": job.get("runCount"),
        "metadata": job.get("metadata", {}),
        "createdAt": job.get("createdAt").isoformat() if job.get("createdAt") else None,
        "updatedAt": job.get("updatedAt").isoformat() if job.get("updatedAt") else None,
    }

# Schedule a new script
@script_routes.route('/schedule', methods=['POST'])
def schedule():
    data = request.json

    script_name = data.get("scriptName")
    day = data.get("day")  # e.g., "mon", "wed", or "*"
    # print(day,"day1")
    time_str = data.get("time")  # e.g., "10:15"
    cuid = data.get("Cuid")
    metadata = data.get("metadata", {})
    enabled = data.get("enabled", True)
    job_id = data.get("job_id")  # optional for update

    if not all([script_name, day, time_str, cuid]):
        return jsonify({"error": "Missing required fields: scriptName, day, time, Cuid"}), 400

    exec_id = str(ObjectId())
    

    try:
        new_job_id = schedule_script(
            script_name=script_name,
            day=day,
            time_str=time_str,
            job_id=job_id,
            cuid=cuid,
            metadata=metadata,
            enabled=enabled,
            exec_id= exec_id

        )
    except Exception as e:
        print(str(e),"/schedule")
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Job scheduled", "job_id": new_job_id})

# Unschedule a job by id
@script_routes.route('/unschedule/<job_id>', methods=['DELETE'])
def unschedule(job_id):
    success = unschedule_script(job_id)
    if success:
        return jsonify({"message": f"Job {job_id} unscheduled"})
    else:
        return jsonify({"error": f"Failed to unschedule job {job_id}"}), 500

@script_routes.route('/disable/<job_id>', methods=['PATCH'])
def DisableEnable_Script(job_id):
    data = request.json
    enable = data.get("enable")
    success = DisableScript(job_id,enable)
    if success:
        return jsonify({"message": f"Job {job_id} unscheduled"})
    else:
        return jsonify({"error": f"Failed to unschedule job {job_id}"}), 500
# List all scheduled jobs
@script_routes.route('/jobs', methods=['GET'])
def list_jobs():
    jobs_cursor = mongo.db.ScheduledJobs.find()
    jobs = [serialize_job(job) for job in jobs_cursor]
    return jsonify(jobs)

# Get details for a specific job
@script_routes.route('/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    job = mongo.db.ScheduledJobs.find_one({"_id": job_id})
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(serialize_job(job))
