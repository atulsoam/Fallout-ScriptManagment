from flask import request, jsonify,current_app
from werkzeug.security import generate_password_hash
import datetime
from app import mongo,FRONTEND_URL
from app.services.auth_service import require_roles_from_admin_controls
from app.routes import script_routes
from app.services.ScheduleService import schedule_script
from app.services.UniversalService import GetUserDetaials, GetInternalCCList, send_email_notification, GetAllApproversOrAdmin
from app.services.EmailBody import FrameEmailBody
from app.db_manager import get_collection, get_analytics_db

def update_admin_controls_list(field, cuid, action):
    ADMIN_CONTROLLS = get_collection("ADMIN_CONTROLLS")
    update_query = {"$addToSet" if action == "add" else "$pull": {field: cuid}}
    ADMIN_CONTROLLS.update_one({}, update_query, upsert=True)

@script_routes.route('/approvers', methods=['GET'])
def get_approvers():
    """
    Get the list of approvers.
    ---
    tags:
      - Admin
    responses:
      200:
        description: List of approvers
        schema:
          type: array
          items:
            type: string
      404:
        description: No approver list found
    """
    ADMIN_CONTROLLS = get_collection("ADMIN_CONTROLLS")
    document = ADMIN_CONTROLLS.find_one()
    
    if document and 'approverList' in document:
        return jsonify(document['approverList']), 200
    else:
        return jsonify({"error": "No approver list found"}), 404


@script_routes.route('/admin/create-user', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def create_user():
    """
    Create a new user (admin only).
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "user123"
            password:
              type: string
              example: "password123"
            isAdmin:
              type: boolean
              example: false
            email:
              type: string
              example: "user@example.com"
            username:
              type: string
              example: "User Name"
            createdBy:
              type: string
              example: "admin123"
    responses:
      201:
        description: User created successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: CUID and password are required
      409:
        description: User already exists
      500:
        description: Server error
    """
    try:
        data = request.get_json()
        cuid = data.get('cuid')
        password = data.get('password')
        isAdmin = data.get('isAdmin', False)
        email = data.get('email')
        username = data.get('username')
        createdBy = data.get('createdBy')
        USERS_COLLECTION = get_collection("USERS_COLLECTION")
        if not cuid or not password:
            return jsonify({'error': 'CUID and password are required'}), 400

        if USERS_COLLECTION.find_one({'_id': cuid}):
            return jsonify({'error': 'User already exists'}), 409

        hashed_password = generate_password_hash(password)
        user = {
            '_id': cuid,
            'cuid': cuid,
            'password': hashed_password,
            'isAdmin': isAdmin,
            'email': email,
            'username': username,
            'createdAt': str(datetime.datetime.now()),
            'createdBy': createdBy
        }

        USERS_COLLECTION.insert_one(user)
        if isAdmin:
            update_admin_controls_list("adminList", cuid, "add")
        currentUser = GetUserDetaials(cuid)
        AdminUsers = GetAllApproversOrAdmin(isApprover=False,isAdmin=True)
        CCList = GetInternalCCList()
        framedBody = FrameEmailBody(
        action_required=False,
        info_link=f"{FRONTEND_URL}/login",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else username,
        Information=f"""You can now log in with cred.
        Cuid : {cuid}
          password : {password}""",
          msg = f"""{currentUser["username"]}, your account has been created successfully."""

        )
        send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"]],
            CCList=CCList,
            subject=f"Your account has been created in Script Management",
            body=framedBody,
        )
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/users', methods=['GET'])
@require_roles_from_admin_controls(['admin'])
def list_users():
    """
    List all users (admin only).
    ---
    tags:
      - Admin
    responses:
      200:
        description: List of users
        schema:
          type: array
          items:
            type: object
      500:
        description: Server error
    """
    try:
        USERS_COLLECTION = get_collection("USERS_COLLECTION")
        users = list(USERS_COLLECTION.find({}, {"_id": 0}))

        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/add-approver', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def add_approver():
    """
    Add a user as an approver.
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "user123"
    responses:
      200:
        description: Approver added successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Missing cuid
      404:
        description: Please enter a valid CUID
      500:
        description: Server error
    """
    try:
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400
        USERS_COLLECTION = get_collection("USERS_COLLECTION")
        record = USERS_COLLECTION.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("approverList", cuid, "add")
        USERS_COLLECTION.update_one({"cuid": cuid}, {"$set": {"isApprover": True}})
        currentUser = GetUserDetaials(cuid)
        AdminUsers = GetAllApproversOrAdmin(isApprover=False,isAdmin=True)
        CCList = GetInternalCCList()
        print("CC List:", CCList)
        framedBody = FrameEmailBody(
        action_required=False,
        info_link=f"{FRONTEND_URL}/login",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else record["username"],
        Information="You have been added as an approver in Script Management",
        )
        send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"] ],
            CCList=CCList,

            subject=f"You have been added as an approver in Script Management",
            body=framedBody,
        )
        return jsonify({"message": "Approver added successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/add-admin', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def add_admin():
    """
    Add a user as an admin.
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "user123"
    responses:
      200:
        description: Admin added successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Missing cuid
      404:
        description: Please enter a valid CUID
      500:
        description: Server error
    """
    try:
        USERS_COLLECTION = get_collection("USERS_COLLECTION")
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        record = USERS_COLLECTION.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("adminList", cuid, "add")
        USERS_COLLECTION.update_one({"cuid": cuid}, {"$set": {"isAdmin": True}})
        currentUser = GetUserDetaials(cuid)
        AdminUsers = GetAllApproversOrAdmin(isApprover=False,isAdmin=True)
        CCList = GetInternalCCList()
        framedBody = FrameEmailBody(
        action_required=False,
        info_link=f"{FRONTEND_URL}/login",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else record["username"],
        Information="You have been added as an admin in Script Management",
        )
        send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"] ],
            CCList=CCList,

            subject=f"You have been added as an admin in Script Management",
            body=framedBody,
        )
        return jsonify({"message": "Admin added successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/remove-approver', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def remove_approver():
    """
    Remove a user from approvers.
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "user123"
    responses:
      200:
        description: Approver removed successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Missing cuid
      404:
        description: Please enter a valid CUID
      500:
        description: Server error
    """
    try:
        USERS_COLLECTION  = get_collection("USERS_COLLECTION")
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        record = USERS_COLLECTION.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("approverList", cuid, "remove")
        USERS_COLLECTION.update_one({"cuid": cuid}, {"$set": {"isApprover": False}})
        currentUser = GetUserDetaials(cuid)
        AdminUsers = GetAllApproversOrAdmin(isApprover=False,isAdmin=True)
        CCList = GetInternalCCList()
        framedBody = FrameEmailBody(
        action_required=False,
        info_link=f"{FRONTEND_URL}/login",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else record["username"],
        Information="You have been removed as an approver in Script Management",
        )
        send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"] ],
            CCList=CCList,

            subject=f"You have been removed as an approver in Script Management",
            body=framedBody,
        )
        return jsonify({"message": "Approver removed successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/remove-admin', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def remove_admin():
    """
    Remove a user from admins.
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "user123"
    responses:
      200:
        description: Admin removed successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Missing cuid
      404:
        description: Please enter a valid CUID
      500:
        description: Server error
    """
    try:
        USERS_COLLECTION  = get_collection("USERS_COLLECTION")
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        record = USERS_COLLECTION.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("adminList", cuid, "remove")
        USERS_COLLECTION.update_one({"cuid": cuid}, {"$set": {"isAdmin": False}})
        currentUser = GetUserDetaials(cuid)
        AdminUsers = GetAllApproversOrAdmin(isApprover=False,isAdmin=True)
        CCList = GetInternalCCList()
        framedBody = FrameEmailBody(
        action_required=False,
        info_link=f"{FRONTEND_URL}/login",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else record["username"],
        Information="You have been removed as an admin in Script Management",
        )
        send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"] ],
            CCList=CCList,

            subject=f"You have been removed as an admin in Script Management",
            body=framedBody,
        )
        return jsonify({"message": "Admin removed successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/update-user/<cuid>', methods=['PUT'])
@require_roles_from_admin_controls(['admin'])
def update_user(cuid):
    """
    Update user details.
    ---
    tags:
      - Admin
    parameters:
      - in: path
        name: cuid
        type: string
        required: true
        description: CUID of the user to update
      - in: body
        name: body
        required: true
        schema:
          type: object
    responses:
      200:
        description: User updated or no changes
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Please use a valid CUID
      500:
        description: Server error
    """
    try:
        USERS_COLLECTION  = get_collection("USERS_COLLECTION")

        updates = request.get_json()
        record = USERS_COLLECTION.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please use a valid CUID"}), 404

        result = USERS_COLLECTION.update_one({'cuid': cuid}, {'$set': updates})
        if result.modified_count:
            return jsonify({"message": "User updated"}), 200
        return jsonify({"message": "No changes"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/delete-user', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def delete_user():
    """
    Delete a user.
    ---
    tags:
      - Admin
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            cuid:
              type: string
              example: "user123"
    responses:
      200:
        description: User deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Missing cuid
      500:
        description: Server error
    """
    try:
        USERS_COLLECTION  = get_collection("USERS_COLLECTION")
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        USERS_COLLECTION.delete_one({"cuid": cuid})
        update_admin_controls_list("adminList", cuid, "remove")
        update_admin_controls_list("approverList", cuid, "remove")
        currentUser = GetUserDetaials(cuid)
        AdminUsers = GetAllApproversOrAdmin(isApprover=False,isAdmin=True)
        CCList = GetInternalCCList()
        framedBody = FrameEmailBody(
        action_required=False,
        info_link=f"{FRONTEND_URL}/login",
        recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else cuid,
        Information="You have been deleted from Script Management",
        )
        send_email_notification(
            receiverlist=[currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"] ],
            CCList=CCList,

            subject=f"You have been deleted from Script Management",
            body=framedBody,
        )
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/is-admin/<cuid>', methods=['GET'])
def is_user_admin(cuid):
    """
    Check if a user is admin or approver.
    ---
    tags:
      - Admin
    parameters:
      - in: path
        name: cuid
        type: string
        required: true
        description: CUID of the user
    responses:
      200:
        description: User admin/approver status
        schema:
          type: object
          properties:
            cuid:
              type: string
            username:
              type: string
            email:
              type: string
            isAdmin:
              type: boolean
            isApprover:
              type: boolean
      404:
        description: User not found
      500:
        description: Server error
    """
    try:
        USERS_COLLECTION  = get_collection("USERS_COLLECTION")
        user = USERS_COLLECTION.find_one({'cuid': cuid})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "cuid": user.get("cuid"),
            "username": user.get("username"),
            "email": user.get("email"),
            "isAdmin": user.get("isAdmin", False),
            "isApprover": user.get("isApprover", False)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@script_routes.route('/admin/approve/<job_id>', methods=['PATCH'])
@require_roles_from_admin_controls(['admin', 'approver'])
def approveSchedule_script(job_id):
    """
    Approve a scheduled job.
    ---
    tags:
      - Admin
    parameters:
      - in: path
        name: job_id
        type: string
        required: true
        description: Job ID to approve
    responses:
      200:
        description: Job approved and scheduled
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Job not found
      500:
        description: Scheduling failed
    """
    SCHEDULES_COLLECTION = get_collection("SCHEDULES_COLLECTION")
    job = SCHEDULES_COLLECTION.find_one({"_id": job_id})
    if not job:
        return jsonify({"error": "Job not found"}), 404

    SCHEDULES_COLLECTION.update_one(
        {"_id": job_id},
        {"$set": {"isApproved": True,"status":"Approved", "updatedAt": datetime.datetime.now()}}
    )

    if job.get("enabled", False):
        try:
            schedule_script(
                script_name=job["scriptName"],
                day=job["daysOfWeek"] if job["daysOfWeek"] != ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] else "*",
                time_str=job["time"],
                job_id=job["_id"],
                cuid=job.get("Cuid"),
                metadata=job.get("metadata"),
                enabled=True
            )
            
        except Exception as e:
            return jsonify({"error": f"Approved but scheduling failed: {e}"}), 500
    currentUser = GetUserDetaials(job["Cuid"])
    # approverusers = GetAllApproversOrAdmin(isApprover=True,isAdmin=False)
    CCList = GetInternalCCList()
    finalCClist = CCList.append(currentUser["email"] if currentUser and currentUser.get("email") else job["Cuid"])
    framedBody = FrameEmailBody(
    script_title=job["scriptName"],
    script_author=currentUser["username"] if currentUser and currentUser.get("username") else currentUser["cuid"],
    submission_date=str(datetime.datetime.now().date()),
    action_required=False,
    info_link=f"{FRONTEND_URL}/SchedulerPage",
    recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else job["Cuid"],
    Information="Your script has been approved and scheduled.",
    msg=f"""An action has been taken on your script: {job['scriptName']}""",
)
        
    send_email_notification(
            receiverlist= [currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"]],
            CCList= finalCClist,
            subject=f"Script {job['scriptName']} approved and scheduled",
            body=framedBody,
        )
    return jsonify({"message": f"Job {job_id} approved and scheduled"}), 200


@script_routes.route('/admin/reject/<job_id>', methods=['PATCH'])
@require_roles_from_admin_controls(['admin', 'approver'])
def rejectSchedule_script(job_id):
    """
    Reject a scheduled job.
    ---
    tags:
      - Admin
    parameters:
      - in: path
        name: job_id
        type: string
        required: true
        description: Job ID to reject
      - in: body
        name: body
        required: true
        schema:
          type: object
          properties:
            rejectReason:
              type: string
              example: "Reason for rejection"
    responses:
      200:
        description: Job rejected and disabled
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Job not found
      500:
        description: Server error
    """
    SCHEDULES_COLLECTION = get_collection("SCHEDULES_COLLECTION")
    updates = request.get_json()
    rejectReason = updates.get("rejectReason","Na")
    job = SCHEDULES_COLLECTION.find_one({"_id": job_id})
    if not job:
        return jsonify({"error": "Job not found"}), 404

    SCHEDULES_COLLECTION.update_one(
        {"_id": job_id},
        {"$set": {
            "isApproved": False,
            "status": "Rejected",
            "rejectedReason":rejectReason,
            "enabled": False,
            "updatedAt": datetime.datetime.now()
        }}
    )

    try:
        from app import scheduler
        scheduler.remove_job(job_id)
        
    except Exception:
        pass  # In case it wasn't scheduled yet
    currentUser = GetUserDetaials(job["Cuid"])
    # approverusers = GetAllApproversOrAdmin(isApprover=True,isAdmin=False)
    CCList = GetInternalCCList()

    framedBody = FrameEmailBody(
    script_title=job["scriptName"],
    script_author=currentUser["username"] if currentUser and currentUser.get("username") else currentUser["cuid"],
    
    submission_date=str(job.get("createdAt", datetime.datetime.now().date())),
    action_required=False,
    info_link=f"{FRONTEND_URL}/SchedulerPage",
    recipient_name=currentUser["username"] if currentUser and currentUser.get("username") else job["Cuid"],
    Information= f"Your script has been rejected. Reason: {rejectReason}",
    msg=f"""An action has been taken on your script: {job['scriptName']}""",
)
        
    send_email_notification(
            receiverlist= [currentUser["email"] if currentUser and currentUser.get("email") else currentUser["cuid"]],
            CCList=CCList,
            subject=f"Script {job['scriptName']} rejected",
            body=framedBody,
        )
    return jsonify({"message": f"Job {job_id} rejected and disabled"}), 200


@script_routes.route('/admin/pending-approvals/all-scripts', methods=['GET'])
@require_roles_from_admin_controls(['admin', 'approver'])
def get_pending_approvals_from_all_scripts():
    """
    Get all pending script approvals.
    ---
    tags:
      - Admin
    responses:
      200:
        description: List of pending scripts
        schema:
          type: object
          properties:
            pendingScripts:
              type: array
              items:
                type: object
      500:
        description: Server error
    """
    SCRIPTS_COLLECTION = get_collection("SCRIPTS_COLLECTION")
    try:
        pending_scripts = list(SCRIPTS_COLLECTION.find(
            {
                "$and": [
                    {"isApproved": False},
                    {"status": "Pending"}
                ]
            },
        ))
        return jsonify({"pendingScripts": pending_scripts}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@script_routes.route('/admin/pending-approvals/scheduled-scripts', methods=['GET'])
@require_roles_from_admin_controls(['admin', 'approver'])
def get_pending_approvals_from_scheduled_scripts():
    """
    Get all pending scheduled script approvals.
    ---
    tags:
      - Admin
    responses:
      200:
        description: List of pending scheduled scripts
        schema:
          type: object
          properties:
            pendingScheduled:
              type: array
              items:
                type: object
      500:
        description: Server error
    """
    SCHEDULES_COLLECTION = get_collection("SCHEDULES_COLLECTION")
    try:
        pending_scheduled = list(SCHEDULES_COLLECTION.find(
            {
                "$and": [
                    {"isApproved": False},
                    {"status": "Pending"}
                ]
            },
        ))
        return jsonify({"pendingScheduled": pending_scheduled}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@script_routes.route('/admin/pending-approvals', methods=['GET'])
@require_roles_from_admin_controls(['admin', 'approver'])
def get_pending_approvals_for_all():
    """
    Get counts of all pending approvals (scripts and scheduled jobs).
    ---
    tags:
      - Admin
    responses:
      200:
        description: Pending approvals count
        schema:
          type: object
          properties:
            scheduledCount:
              type: integer
            scriptCount:
              type: integer
            totalPending:
              type: integer
      500:
        description: Server error
    """
    SCHEDULES_COLLECTION = get_collection("SCHEDULES_COLLECTION")
    SCRIPTS_COLLECTION = get_collection("SCRIPTS_COLLECTION")
    try:
        # Get count of unapproved, pending ScheduledJobs
        scheduled_count = SCHEDULES_COLLECTION.count_documents({
            "isApproved": False,
            "status": "Pending"
        })

        # Get count of unapproved, pending AllScript items
        script_count = SCRIPTS_COLLECTION.count_documents({
            "isApproved": False,
            "status": "Pending"
        })

        return jsonify({
            "scheduledCount": scheduled_count,
            "scriptCount": script_count,
            "totalPending": scheduled_count + script_count
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@script_routes.route('/admin/email-history', methods=['GET'])
@require_roles_from_admin_controls(['admin', 'approver'])
def get_email_history():
    """
    Get paginated and filtered email history.
    ---
    tags:
      - Admin
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: limit
        in: query
        type: integer
        default: 10
      - name: status
        in: query
        type: string
      - name: receiver
        in: query
        type: string
      - name: subject
        in: query
        type: string
      - name: fromDate
        in: query
        type: string
        format: date-time
      - name: toDate
        in: query
        type: string
        format: date-time
    responses:
      200:
        description: Paginated email records
      500:
        description: Server error
    """
    EMAIL_RECORD = get_collection("EMAIL_RECORD")
    EMAIL_CONFIG = get_collection("EMAIL_CONFIG")
    try:
        # Pagination params
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        skip = (page - 1) * limit

        # Filters
        status = request.args.get('status')
        receiver = request.args.get('receiver')
        subject = request.args.get('subject')
        from_date = request.args.get('fromDate')
        to_date = request.args.get('toDate')

        query = {}

        if status:
            query['Status'] = status
        if receiver:
            query['ReceiverList'] = {"$regex": receiver, "$options": "i"}
        if subject:
            query['Subject'] = {"$regex": subject, "$options": "i"}
        if from_date or to_date:
            query['createdAt'] = {}
            if from_date:
                query['createdAt']['$gte'] = datetime.datetime.fromisoformat(from_date)
            if to_date:
                query['createdAt']['$lte'] = datetime.datetime.fromisoformat(to_date)

        total_count = EMAIL_RECORD.count_documents(query)
        cursor = EMAIL_RECORD.find(query).sort("createdAt", -1).skip(skip).limit(limit)

        emails = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['createdAt'] = doc['createdAt'].isoformat() if isinstance(doc['createdAt'], datetime.datetime) else doc['createdAt']
            emails.append(doc)

        return jsonify({
            "data": emails,
            "page": page,
            "limit": limit,
            "total": total_count
        }), 200

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

@script_routes.route('/admin/email-stats', methods=['GET'])
@require_roles_from_admin_controls(['admin', 'approver'])
def get_email_stats():
    """
    Get summarized stats for email delivery (success/failure).
    """
    EMAIL_RECORD = get_collection("EMAIL_RECORD")
    EMAIL_CONFIG = get_collection("EMAIL_CONFIG")
    try:
        total_sent = EMAIL_RECORD.count_documents({"Status": "Sent"})
        total_failed = EMAIL_RECORD.count_documents({"Status": "Failed"})
        total_pending = EMAIL_RECORD.count_documents({"Status": "Pending"})
        total_all = EMAIL_RECORD.count_documents({})

        latest_emails = list(
                EMAIL_RECORD.find(
                    {},  # query
                    {"Subject": 1, "Status": 1, "createdAt": 1}
                )
                .sort("createdAt", -1)
                .limit(5)
            )


        return jsonify({
            "total": total_all,
            "sent": total_sent,
            "failed": total_failed,
            "pending": total_pending,
            "latest": latest_emails
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@script_routes.route('/admin/send-email', methods=['POST'])
@require_roles_from_admin_controls(['admin'])  # Restrict to admins only
def send_email_to_user():
    """
    Admin-triggered email sender
    ---
    tags:
      - Admin
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            receiverList:
              type: array
              items:
                type: string
            ccList:
              type: array
              items:
                type: string
            recipientName:
              type: string
            subject:
              type: string
            msg:
              type: string
            infoLink:
              type: string
            information:
              type: string
            attachments:
              type: array
              items:
                type: object
                properties:
                  filename:
                    type: string
                  content:
                    type: string
    responses:
      200:
        description: Email sent
      400:
        description: Bad request
      500:
        description: Server error
    """
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ['receiverList', 'recipientName', 'subject', 'msg']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Optional fields
        cc_list = data.get('ccList', [])
        info_link = data.get('infoLink', '')
        information = data.get('information', 'View Details')
        attachments = data.get('attachments', [])

        # Build email body
        email_body = FrameEmailBody(
            recipient_name=data['recipientName'],
            msg=data['msg'],
            info_link=info_link,
            Information=information,
            action_required=False
        )

        # Send the email
        send_email_notification(
            receiverlist=data['receiverList'],
            CCList=cc_list,
            subject=data['subject'],
            body=email_body,
            attachments=attachments
        )

        return jsonify({"message": "Email sent successfully"}), 200

    except Exception as e:
        print("Error in /admin/send-email:", e)
        return jsonify({"error": str(e)}), 500



@script_routes.route('/admin/email-configs', methods=['GET'])
@require_roles_from_admin_controls(['admin', 'approver'])
def get_email_configs():
    try:
        EMAIL_CONFIG = get_collection("EMAIL_CONFIG")
        config_doc = EMAIL_CONFIG.find_one()
        if not config_doc:
            # Initialize default config if not found
            EMAIL_CONFIG.insert_one({ "configs": {} })
            return jsonify({}), 200

        return jsonify(config_doc.get("configs", {})), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@script_routes.route('/admin/email-configs', methods=['POST'])
@require_roles_from_admin_controls(['admin', 'approver'])
def update_email_configs():
    """
    Overwrites the entire config document with new data.
    Expects JSON body: { "internalTeam": ["user1@example.com", ...], ... }
    """
    try:
        EMAIL_CONFIG = get_collection("EMAIL_CONFIG")
        new_configs = request.json
        if not isinstance(new_configs, dict):
            return jsonify({"error": "Invalid format. Expected a dictionary of lists."}), 400

        EMAIL_CONFIG.update_one({}, { "$set": { "configs": new_configs } }, upsert=True)
        return jsonify({ "message": "Configurations updated successfully." }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
