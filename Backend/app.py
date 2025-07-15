from app import create_app, socketio
from flasgger import Swagger
from app.services.ScheduleService import load_existing_schedules


app = create_app()
Swagger(app)  # Add this line to enable Swagger UI
load_existing_schedules()  # Load existing schedules at startup
if __name__ == "__main__":

    socketio.run(app, host="0.0.0.0", port=5000)
