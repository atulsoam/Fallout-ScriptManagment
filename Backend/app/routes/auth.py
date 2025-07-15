from flask import request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from app.routes import script_routes
from app import mongo,USERS_COLLECTION

@script_routes.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    cuid = data.get('cuid')
    password = data.get('password')
    isAdmin = data.get('isAdmin', False)

    if not cuid or not password:
        return jsonify({'error': 'CUID and password are required'}), 400

    existing_user = USERS_COLLECTION.find_one({'_id': cuid})
    if existing_user:
        return jsonify({'error': 'User already exists'}), 409

    hashed_password = generate_password_hash(password)
    user = {
        '_id': cuid,
        'cuid': cuid,
        'password': hashed_password,
        'isAdmin': isAdmin
    }

    USERS_COLLECTION.insert_one(user)
    return jsonify({'message': 'User created successfully'}), 201


@script_routes.route('/login', methods=['POST'])
def login():
    """
    Log in a user.
    ---
    tags:
      - Auth
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
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            message:
              type: string
            user:
              type: object
      401:
        description: Invalid CUID or password
    """
    data = request.get_json()
    cuid = data.get('cuid')
    password = data.get('password')

    user = USERS_COLLECTION.find_one({'_id': cuid})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({'error': 'Invalid CUID or password'}), 401

    session['user'] = {
        'cuid': user['cuid'],
        'isAdmin': user.get('isAdmin', False),
        "username":user.get("username",""),
        "email":user.get("email",""),
        "isApprover":user.get("isApprover",False)

    }

    return jsonify({
        'message': 'Login successful',
        'user': session['user']
    }), 200

@script_routes.route('/logout', methods=['POST'])
def logout():
    """
    Log out the current user.
    ---
    tags:
      - Auth
    responses:
      200:
        description: Logged out successfully
        schema:
          type: object
          properties:
            message:
              type: string
    """
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'}), 200
