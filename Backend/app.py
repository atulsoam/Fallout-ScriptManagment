from app import create_app, socketio
from app.services.ScheduleService import load_existing_schedules


app = create_app()
load_existing_schedules()
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
