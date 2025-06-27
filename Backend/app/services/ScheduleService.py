from apscheduler.triggers.cron import CronTrigger
import datetime
from functools import wraps
from app import mongo, scheduler
from app.services.script_executor import run_script as executeScript

def track_job_run(exec_func):
    @wraps(exec_func)
    def wrapper(script_name, job_id, *args, **kwargs):
        start = datetime.datetime.now()
        try:
            result = exec_func(script_name, job_id, *args, **kwargs)
            success = True
        except Exception as e:
            print(f"Error running job {job_id}: {e}")
            success = False
            result = None
        end = datetime.datetime.now()
        duration = (end - start).total_seconds()
        print(job_id,"JobID")
        job_doc = mongo.db.ScheduledJobs.find_one({"_id": job_id})
        if job_doc:
            run_count = job_doc.get("runCount", 0) + 1
            try:
                next_run_time = scheduler.get_job(job_id).next_run_time
            except Exception:
                next_run_time = None

            update_doc = {
                "lastRun": end,
                "lastDuration": duration,
                "runCount": run_count,
                "updatedAt": datetime.datetime.now()
            }
            if next_run_time:
                update_doc["nextRun"] = next_run_time

            mongo.db.ScheduledJobs.update_one({"_id": job_id}, {"$set": update_doc})

        if success:
            return result
        else:
            raise RuntimeError(f"Job {job_id} failed during execution")
    return wrapper

def exec_func(script_name,job_id, exec_id,):
    script_doc = mongo.db.AllScript.find_one({"name": script_name})
    if not script_doc:
        print(f"Error: Script {script_name} not found in DB.")
        return

    script_code = script_doc.get("code")
    if not script_code:
        print(f"Error: No code found for script {script_name}")
        return


    # Insert running script status
    mongo.db.RunningScript.insert_one({
        "_id": exec_id,
        "script": script_name,
        "status": "running",
        "statusField": "status",
        "collectionName": script_name,
        "scriptType": script_doc.get("scriptType", "NA"),
        "ExecutedFrom":"Scheduler",
        "user": "SystemScheduler",  # Or pass the Cuid if available
        "startTime": datetime.datetime.now(),
        "scriptSubType": script_doc.get("scriptSubType", "NA"),
        "createdAt": str(datetime.datetime.now().date()),
        "statusList": {
            "Fixed": 0,
            "Not Fixed": 0,
            "processedAccounts": 0,
            "Total": 0
        }
    })

    print(f"Starting script '{script_name}' with exec_id '{exec_id}'")

    # Launch the script async runner
    executeScript(script_name, script_code, exec_id, mongo.db.RunningScript)

  
def schedule_script(
    script_name,
    exec_id ,
    day,            # e.g. "mon", "wed", "*" for everyday
    time_str,       # e.g. "10:15"
    job_id=None,
    cuid=None,
    metadata=None,
    enabled=True,

):
    # print(day,"day2")
    if not job_id:
        timestamp = int(datetime.datetime.now().timestamp())
        job_id = f"{script_name}_{timestamp}"

    try:
        hour, minute = map(int, time_str.split(":"))
        if not (0 <= hour < 24 and 0 <= minute < 60):
            raise ValueError("Invalid hour or minute")
    except Exception as e:
        raise ValueError(f"Invalid time_str format, expected HH:MM. Error: {e}")

    day_of_week = day if isinstance(day, str) else ",".join(day)

    cron_trigger = CronTrigger(day_of_week=day_of_week, hour=hour, minute=minute)

    # Wrap exec_func with tracking decorator
    tracked_func = track_job_run(exec_func)
    if enabled:
        scheduler.add_job(
            func=tracked_func,
            trigger=cron_trigger,
            id=job_id,
            args=[script_name, job_id,exec_id],
            replace_existing=True
        )

    if day == "*":
        days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    elif isinstance(day, list):
        days = day
    else:
        days = [day]

    job_doc = {
        "_id": job_id,
        "scriptName": script_name,
        "Cuid": cuid,
        "frequency": "weekly" if day != "*" else "daily",
        "time": time_str,
        "daysOfWeek": days,
        "enabled": enabled,
        "createdAt": datetime.datetime.now(),
        "updatedAt": datetime.datetime.now(),
        "runCount": 0,
        "metadata": metadata or {},
        "exec_id": exec_id
    }


    mongo.db.ScheduledJobs.update_one({"_id": job_id}, {"$set": job_doc}, upsert=True)

    return job_id

def DisableScript(job_id, enable):
    print(job_id,enable)
    try:
        if not enable:
            # Disable job in scheduler and DB
            scheduler.remove_job(job_id)
            job_doc = {
                "enabled": False,
                "updatedAt": datetime.datetime.now(),
            }
            mongo.db.ScheduledJobs.update_one({"_id": job_id}, {"$set": job_doc}, upsert=True)
        else:
            # Re-enable job by rescheduling
            job = mongo.db.ScheduledJobs.find_one({"_id": job_id})
            if not job:
                print(f"No job found with job_id: {job_id}")
                return False

            # Extract data from DB to re-schedule the script
            schedule_script(
                script_name=job["scriptName"],
                exec_id=job["exec_id"],
                day=job["daysOfWeek"] if job["daysOfWeek"] != ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] else "*",
                time_str=job["time"],
                job_id=job["_id"],
                cuid=job.get("Cuid"),
                metadata=job.get("metadata"),
                enabled=True
            )

            # Update the 'enabled' status in DB
            mongo.db.ScheduledJobs.update_one(
                {"_id": job_id},
                {"$set": {"enabled": True, "updatedAt": datetime.datetime.now()}},
                upsert=True
            )

        return True

    except Exception as e:
        print(f"Error DisableScript job {job_id}: {e}")
        return False




def unschedule_script(job_id):
    try:
        scheduler.remove_job(job_id)
        
        mongo.db.ScheduledJobs.delete_one({"_id": job_id})
        return True
    except Exception as e:
        print(f"Error unscheduling job {job_id}: {e}")
        return False
    


def load_existing_schedules():
    jobs = mongo.db.ScheduledJobs.find({"enabled": True})
    for job in jobs:
        try:
            schedule_script(
                script_name=job["scriptName"],
                exec_id=job["exec_id"],
                day=job["daysOfWeek"] if job["daysOfWeek"] != ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] else "*",
                time_str=job["time"],
                job_id=job["_id"],
                cuid=job.get("Cuid"),
                metadata=job.get("metadata"),
                enabled=True
            )
        except Exception as e:
            print(f"Failed to load job {job['_id']}: {e}")
