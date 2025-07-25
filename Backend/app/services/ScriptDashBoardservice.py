from app import mongo
import datetime
from datetime import timedelta
from collections import Counter, defaultdict
from app.db_manager import get_collection

# Collections



def get_dashboard_counts(days=10, top_n=5):
    all_script = get_collection("SCRIPTS_COLLECTION")
    running_script = get_collection("SCRIPTS_EXECUTION_COLLECTION")
    scheduled_job = get_collection("SCHEDULES_COLLECTION") 
    category_sub_category =   get_collection("CATEGORY_SUB_CATEGORY_COLLECTION")
    all_scripts = list(all_script.find({}))
    running_scripts = list(running_script.find({}))
    scheduled_jobs = list(scheduled_job.find({"isApproved":True,"enabled":True}))

    now = datetime.datetime.now()
    start_date = now - timedelta(days=days)

    summary = {}

    # --- Total Scripts ---
    summary["TotalScripts"] = len(all_scripts)

    # --- Script Types and SubTypes ---
    type_counter = Counter()
    subtype_counter = Counter()
    for script in all_scripts:
        type_counter[script.get("scriptType", "Unknown")] += 1
        subtype_counter[script.get("scriptSubType", "Unknown")] += 1

    summary["ScriptTypes"] = dict(type_counter)
    summary["ScriptSubTypes"] = dict(subtype_counter)

    # --- Scheduled Jobs Enabled/Disabled ---
    enabled = sum(1 for job in scheduled_jobs if job.get("enabled", False))
    disabled = len(scheduled_jobs) - enabled
    summary["ScheduledJobs"] = {
        "Total": len(scheduled_jobs),
        "Enabled": enabled,
        "Disabled": disabled
    }

    # --- ExecutedFrom (all executions) ---
    executed_from_counter = Counter()
    duration_data = defaultdict(list)

    for run in running_scripts:
        executed_from_counter[run.get("ExecutedFrom", "Unknown")] += 1
        try:
            duration = float(run.get("Duration", 0))
            script_name = run.get("script")
            if script_name:
                duration_data[script_name].append(duration)
        except Exception:
            pass

    # --- Execution Status and Issues in the given time range ---
    recent_runs = [
        run for run in running_scripts
        if get_run_start_time(run) and get_run_start_time(run) >= start_date
    ]

    status_counter = Counter()
    total_fixed = 0
    total_not_fixed = 0

    for run in recent_runs:
        status_counter[run.get("status", "Unknown")] += 1
        status_list = run.get("statusList", {})
        total_fixed += int(status_list.get("Fixed", 0))
        total_not_fixed += int(status_list.get("Not Fixed", 0))

    # --- Average Duration per Script ---
    avg_duration_per_script = {
        script: round(sum(durations) / len(durations), 2)
        for script, durations in duration_data.items() if durations
    }

    summary["ExecutionStatuses"] = dict(status_counter)
    summary["ResultSummary"] = {
        "Fixed": total_fixed,
        "Not Fixed": total_not_fixed,
        "Total": total_fixed + total_not_fixed
    }
    summary["ExecutedFrom"] = dict(executed_from_counter)
    summary["AverageScriptDuration"] = avg_duration_per_script
    summary["DailyExecutionTrend"] = get_daily_execution_trend(running_scripts, days=days)
    summary["TopExecutedScripts"] = get_most_executed_scripts(running_scripts, top_n=top_n)
    summary["ScriptHealthSummary"] = get_script_health_summary(running_scripts, start_date)
    summary["ScheduledJobsByScript"] = get_scheduled_jobs_summary(scheduled_jobs)
    summary["ScriptMetadataSummary"] = get_script_metadata_summary(all_scripts)
    summary["ScheduledJobInsights"] = get_scheduled_job_insights(scheduled_jobs)


    return summary


def get_run_start_time(run):
    start_time = run.get("startTime")
    if not start_time:
        return None

    if isinstance(start_time, datetime.datetime):
        return start_time
    elif isinstance(start_time, dict) and "$date" in start_time:
        try:
            ts_long = int(start_time["$date"].get("$numberLong", 0))
            return datetime.datetime.fromtimestamp(ts_long / 1000.0)
        except Exception:
            return None
    return None


def get_daily_execution_trend(running_scripts, days=10):
    trend = defaultdict(int)
    now = datetime.datetime.now()
    start_day = now - timedelta(days=days)

    for run in running_scripts:
        ts = get_run_start_time(run)
        if ts and ts >= start_day:
            day = ts.strftime('%Y-%m-%d')
            trend[day] += 1

    return dict(sorted(trend.items()))


def get_most_executed_scripts(running_scripts, top_n=5):
    counter = Counter(run.get("script", "Unknown") for run in running_scripts)
    return dict(counter.most_common(top_n))


def get_script_health_summary(running_scripts, start_date):
    health = defaultdict(lambda: {"Completed": 0, "Failed": 0, "Terminated": 0})

    for run in running_scripts:
        script = run.get("script")
        status = run.get("status", "Unknown")
        ts = get_run_start_time(run)
        if ts and ts >= start_date:
            if status in ["Completed", "Failed", "Terminated"]:
                health[script][status] += 1

    return dict(health)


def get_scheduled_jobs_summary(scheduled_jobs):
    job_summary = defaultdict(lambda: {
        "enabled": 0,
        "disabled": 0,
        "totalRunCount": 0,
        "avgLastDuration": 0,
        "count": 0,
        "frequency": Counter(),
        "daysOfWeek": set(),
        "priorities": Counter(),
        "nextRunTimes": []
    })

    for job in scheduled_jobs:
        script = job.get("scriptName", "Unknown")
        job_data = job_summary[script]
        job_data["count"] += 1

        if job.get("enabled", False):
            job_data["enabled"] += 1
        else:
            job_data["disabled"] += 1

        # runCount can be nested int or int directly
        run_count = job.get("runCount")
        if isinstance(run_count, dict) and "$numberInt" in run_count:
            run_count = int(run_count["$numberInt"])
        elif isinstance(run_count, int):
            pass
        else:
            run_count = 0
        job_data["totalRunCount"] += run_count

        last_duration = job.get("lastDuration")
        if last_duration is None:
            last_duration = 0
        job_data["avgLastDuration"] += last_duration  # accumulate for average

        freq = job.get("frequency")
        if freq:
            job_data["frequency"][freq] += 1

        days_list = job.get("daysOfWeek", [])
        for d in days_list:
            job_data["daysOfWeek"].add(d)

        priority = job.get("metadata", {}).get("priority")
        if priority:
            job_data["priorities"][priority] += 1

        next_run = job.get("nextRun")
        dt = None
        if isinstance(next_run, datetime.datetime):
            dt = next_run
        elif isinstance(next_run, dict) and "$date" in next_run:
            try:
                ts_long = int(next_run["$date"].get("$numberLong", 0))
                dt = datetime.datetime.fromtimestamp(ts_long / 1000.0)
            except Exception:
                dt = None

        if dt:
            job_data["nextRunTimes"].append(dt)

    # Calculate averages and finalize formatting
    for script, data in job_summary.items():
        if data["count"] > 0:
            data["avgLastDuration"] = round(data["avgLastDuration"] / data["count"], 4)

        data["daysOfWeek"] = sorted(list(data["daysOfWeek"]))
        data["frequency"] = dict(data["frequency"])
        data["priorities"] = dict(data["priorities"])

        if data["nextRunTimes"]:
            data["nextRunTime"] = min(data["nextRunTimes"]).strftime('%Y-%m-%d %H:%M:%S')
        else:
            data["nextRunTime"] = None

        del data["nextRunTimes"]

    return dict(job_summary)

def get_script_metadata_summary(all_scripts):
    by_approval = Counter(s["isApproved"] for s in all_scripts)
    by_enable = Counter(s["isEnabled"] for s in all_scripts)
    by_uploader = Counter(s["uploadedBy"] for s in all_scripts)
    by_approver = Counter(s["approver"] for s in all_scripts if s.get("approver"))
    by_tag = Counter(tag.get("modifiedBy") for s in all_scripts for tag in s.get("tags", []) if isinstance(tag, dict))
    return {
        "ByApproval": dict(by_approval),
        "ByEnable": dict(by_enable),
        "ByUploader": dict(by_uploader.most_common(5)),
        "ByApprover": dict(by_approver.most_common(5)),
        "ByTag": dict(by_tag)
    }

def get_scheduled_job_insights(scheduled_jobs):
    total = len(scheduled_jobs)
    rejected = [j for j in scheduled_jobs if j.get("status") == "Rejected"]
    freq_reject = Counter(j.get("rejectedReason", "").split("\n")[0] for j in rejected)
    priority_counts = Counter(j.get("metadata", {}).get("priority", "unknown") for j in scheduled_jobs)
    run_counts_by_priority = defaultdict(list)
    next_run_by_priority = defaultdict(list)
    for j in scheduled_jobs:
        p = j.get("metadata", {}).get("priority", "unknown")
        rc = j.get("runCount", {}).get("$numberInt") if isinstance(j.get("runCount"), dict) else j.get("runCount", 0)
        run_counts_by_priority[p].append(int(rc or 0))
        if j.get("nextRun"):
            dt = j["nextRun"]["$date"]["$numberLong"] if isinstance(j["nextRun"], dict) else None
            if dt:
                next_run_by_priority[p].append(datetime.datetime.fromtimestamp(int(dt)/1000.0))
    avg_run = {p: sum(rcs)/len(rcs) for p, rcs in run_counts_by_priority.items()}
    next_min = {p: min(times).strftime("%Y-%m-%d %H:%M") for p, times in next_run_by_priority.items() if times}
    return {
        "TotalJobs": total,
        "RejectedJobs": len(rejected),
        "CommonRejectionReasons": dict(freq_reject.most_common(3)),
        "PriorityCounts": dict(priority_counts),
        "AvgRunCountByPriority": avg_run,
        "NextRunByPriority": next_min
    }
