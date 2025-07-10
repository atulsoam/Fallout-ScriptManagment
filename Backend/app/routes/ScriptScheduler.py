from flask import Blueprint, request, jsonify, current_app
from app import mongo,socketio
import datetime
from app.routes import script_routes
from bson import ObjectId
from app.services.ScheduleService import schedule_script,load_existing_schedules,unschedule_script,DisableScript,exec_func


def serialize_job(job):
    return {
        "job_id": str(job.get("_id")),
        "scriptName": job.get("scriptName"),
        "Cuid": job.get("Cuid"),
        "frequency": job.get("frequency"),
        "time": job.get("time"),
        "daysOfWeek": job.get("daysOfWeek", []),
        "enabled": job.get("enabled", False),
        "status": job.get("status", False),
        "isApproved": job.get("isApproved", False),
        "runCount": job.get("runCount", 0),
        "lastDuration": job.get("lastDuration", 0.0),
        "lastRun": job.get("lastRun").isoformat() if job.get("lastRun") else None,
        "nextRun": job.get("nextRun").isoformat() if job.get("nextRun") else None,
        "createdAt": job.get("createdAt").isoformat() if job.get("createdAt") else None,
        "updatedAt": job.get("updatedAt").isoformat() if job.get("updatedAt") else None,
        "metadata": job.get("metadata", {}),
        "exec_id": job.get("exec_id"),
        "rejectedReason":job.get("rejectedReason","")
    }


@script_routes.route('/schedule', methods=['POST'])
def schedule():
    """
    Schedule a new script or update an existing schedule.
    ---
    tags:
      - Scheduler
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
            day:
              type: string
              example: "mon"
            time:
              type: string
              example: "10:15"
            Cuid:
              type: string
              example: "user123"
            metadata:
              type: object
              example: {}
            enabled:
              type: boolean
              example: true
            job_id:
              type: string
              example: "60d..."
    responses:
      200:
        description: Job scheduled
        schema:
          type: object
          properties:
            message:
              type: string
            job_id:
              type: string
      400:
        description: Missing required fields
      500:
        description: Server error
    """
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

    

    try:
        new_job_id = schedule_script(
            script_name=script_name,
            day=day,
            time_str=time_str,
            job_id=job_id,
            cuid=cuid,
            metadata=metadata,
            enabled=enabled,

        )
    except Exception as e:
        print(str(e),"/schedule")
        return jsonify({"error": str(e)}), 500

    return jsonify({"message": "Job scheduled", "job_id": new_job_id})

# Unschedule a job by id
@script_routes.route('/unschedule/<job_id>', methods=['DELETE'])
def unschedule(job_id):
    """
    Unschedule a job by its ID.
    ---
    tags:
      - Scheduler
    parameters:
      - in: path
        name: job_id
        type: string
        required: true
        description: Job ID to unschedule
    responses:
      200:
        description: Job unscheduled
        schema:
          type: object
          properties:
            message:
              type: string
      500:
        description: Failed to unschedule job
    """
    success = unschedule_script(job_id)
    if success:
        return jsonify({"message": f"Job {job_id} unscheduled"})
    else:
        return jsonify({"error": f"Failed to unschedule job {job_id}"}), 500

@script_routes.route('/disable/<job_id>', methods=['PATCH'])
def DisableEnable_Script(job_id):
    """
    Enable or disable a scheduled job.
    ---
    tags:
      - Scheduler
    parameters:
      - in: path
        name: job_id
        type: string
        required: true
        description: Job ID to enable/disable
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            enable:
              type: boolean
              example: false
    responses:
      200:
        description: Job updated
        schema:
          type: object
          properties:
            message:
              type: string
      500:
        description: Failed to update job
    """
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
    """
    List all scheduled jobs.
    ---
    tags:
      - Scheduler
    responses:
      200:
        description: List of scheduled jobs
        schema:
          type: array
          items:
            type: object
    """
    jobs_cursor = mongo.db.ScheduledJobs.find()
    jobs = [serialize_job(job) for job in jobs_cursor]
    return jsonify(jobs)

# Get details for a specific job
@script_routes.route('/jobs/<job_id>', methods=['GET'])
def get_job(job_id):
    """
    Get details for a specific scheduled job.
    ---
    tags:
      - Scheduler
    parameters:
      - in: path
        name: job_id
        type: string
        required: true
        description: Job ID
    responses:
      200:
        description: Job details
        schema:
          type: object
      404:
        description: Job not found
    """
    job = mongo.db.ScheduledJobs.find_one({"_id": job_id})
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(serialize_job(job))
