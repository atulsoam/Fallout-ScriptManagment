from flask import request, jsonify
from werkzeug.security import generate_password_hash
import datetime
from app import mongo
from app.services.auth_service import require_roles_from_admin_controls
from app.routes import script_routes

def update_admin_controls_list(field, cuid, action):
    update_query = {"$addToSet" if action == "add" else "$pull": {field: cuid}}
    mongo.db.AdminControlls.update_one({}, update_query, upsert=True)

@script_routes.route('/admin/create-user', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def create_user():
    try:
        data = request.get_json()
        cuid = data.get('cuid')
        password = data.get('password')
        isAdmin = data.get('isAdmin', False)
        email = data.get('email')
        username = data.get('username')
        createdBy = data.get('createdBy')

        if not cuid or not password:
            return jsonify({'error': 'CUID and password are required'}), 400

        if mongo.db.ScriptManagmentUsers.find_one({'_id': cuid}):
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

        mongo.db.ScriptManagmentUsers.insert_one(user)
        if isAdmin:
            update_admin_controls_list("adminList", cuid, "add")

        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/users', methods=['GET'])
@require_roles_from_admin_controls(['admin'])
def list_users():
    try:
        users = list(mongo.db.ScriptManagmentUsers.find({}, {"_id": 0}))
        return jsonify(users), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/add-approver', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def add_approver():
    try:
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        record = mongo.db.ScriptManagmentUsers.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("approverList", cuid, "add")
        mongo.db.ScriptManagmentUsers.update_one({"cuid": cuid}, {"$set": {"isApprover": True}})
        return jsonify({"message": "Approver added successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/add-admin', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def add_admin():
    try:
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        record = mongo.db.ScriptManagmentUsers.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("adminList", cuid, "add")
        mongo.db.ScriptManagmentUsers.update_one({"cuid": cuid}, {"$set": {"isAdmin": True}})
        return jsonify({"message": "Admin added successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/remove-approver', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def remove_approver():
    try:
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        record = mongo.db.ScriptManagmentUsers.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("approverList", cuid, "remove")
        mongo.db.ScriptManagmentUsers.update_one({"cuid": cuid}, {"$set": {"isApprover": False}})
        return jsonify({"message": "Approver removed successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/remove-admin', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def remove_admin():
    try:
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        record = mongo.db.ScriptManagmentUsers.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please enter a valid CUID"}), 404

        update_admin_controls_list("adminList", cuid, "remove")
        mongo.db.ScriptManagmentUsers.update_one({"cuid": cuid}, {"$set": {"isAdmin": False}})
        return jsonify({"message": "Admin removed successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/update-user/<cuid>', methods=['PUT'])
@require_roles_from_admin_controls(['admin'])
def update_user(cuid):
    try:
        updates = request.get_json()
        record = mongo.db.ScriptManagmentUsers.find_one({'cuid': cuid})
        if not record:
            return jsonify({"error": "Please use a valid CUID"}), 404

        result = mongo.db.ScriptManagmentUsers.update_one({'cuid': cuid}, {'$set': updates})
        if result.modified_count:
            return jsonify({"message": "User updated"}), 200
        return jsonify({"message": "No changes"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/delete-user', methods=['POST'])
@require_roles_from_admin_controls(['admin'])
def delete_user():
    try:
        cuid = request.get_json().get("cuid")
        if not cuid:
            return jsonify({"error": "Missing cuid"}), 400

        mongo.db.ScriptManagmentUsers.delete_one({"cuid": cuid})
        update_admin_controls_list("adminList", cuid, "remove")
        update_admin_controls_list("approverList", cuid, "remove")
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@script_routes.route('/admin/is-admin/<cuid>', methods=['GET'])
def is_user_admin(cuid):
    try:
        user = mongo.db.ScriptManagmentUsers.find_one({'cuid': cuid})
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
