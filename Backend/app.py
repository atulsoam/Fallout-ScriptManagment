from app import create_app, socketio
# import eventlet
# import eventlet.wsgi

app = create_app()

if __name__ == "__main__":
    # Only use eventlet here, don't monkey_patch
    socketio.run(app, host="0.0.0.0", port=5000)
