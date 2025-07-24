import cv2
import base64
import numpy as np
from flask import Flask, Response, request, redirect, render_template, session,jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import pymongo
from pymongo import MongoClient
from ultralytics import YOLO
import eventlet
import time
import os
import secrets
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash,  check_password_hash




# Load YOLOv8 model
model = YOLO('./best.pt')


app = Flask(__name__)
load_dotenv()  

app.secret_key = os.getenv("SECRET_KEY")


CORS(app, resources={r"/*": {"origins": "http://0.0.0.0:5001"}})
socketio = SocketIO(app, cors_allowed_origins="http://0.0.0.0:5001")


app.secret_key = secrets.token_hex(16)


# ...add your own database here...
# client = pymongo.MongoClient("mongodb://localhost:27017/")
# client = pymongo.MongoClient("mongodb+srv://Scott:lion@smartafs-cluster.3r0.mob.net/")
db = client["SmartAFS"]
users_collection = db["users"]
collection = db["alerts"]

cap = cv2.VideoCapture('./video/cr2.mp4')
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Class label mapping
label_map = {0: "Accident", 1: "Fire", 2: "Smoke"}  

# Function to process and stream frames
def generate_frames():
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Perform YOLOv8 inference
        results = model(frame)
        annotated_frame = results[0].plot()

        # Process detections
        for box in results[0].boxes:
            class_id = int(box.cls[0])  # Get class ID
            detection_type = label_map.get(class_id, "Unknown")  # Map to label

            print(f"\U0001F6A8 {detection_type} DETECTED! Sending notification...")

            # Convert frame to base64
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_base64 = base64.b64encode(buffer).decode()

            # Create alert document
            alert = {
                "type": detection_type,
                "image": frame_base64,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }

            # Save to MongoDB and retrieve inserted _id
            result = collection.insert_one(alert)

            # Convert MongoDB ObjectId to string before emitting
            alert["_id"] = str(result.inserted_id)

            # Send alert to frontend
            socketio.emit("alert", alert)

            eventlet.sleep(0)

        # Encode frame for live streaming
        _, jpeg_frame = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = jpeg_frame.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n\r\n')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form.get("email").strip()
        username = request.form.get("username").strip()
        password = request.form.get("password").strip()
        confirm_password = request.form.get("confirm_password").strip()

      
        if not all([email, username, password, confirm_password]):
            return render_template("signup.html", error="All fields are required")

     
        if password != confirm_password:
            return render_template("signup.html", error="Passwords do not match")

     
        if users_collection.find_one({"email": email}):
            return render_template("signup.html", error="Email already registered")

     
        hashed_password = generate_password_hash(password)
        users_collection.insert_one({
            "email": email,
            "username": username,
            "password": hashed_password
        })

      
        session['user'] = username
        return redirect('/dashboard')

   
    return render_template("signup.html")



@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect('/signin')  
    return render_template("dashboard.html", user=session['user'])




@app.route('/')
def index():
    if 'user' in session:
        return redirect('/dashboard')  
    return redirect('/signin')  



@app.route('/signin', methods=['GET', 'POST'])
def signin():
    if 'user' in session:  
        return redirect('/dashboard')
    
    if request.method == 'POST':
        username = request.form.get("username")
        password = request.form.get("password")

        user = users_collection.find_one({"username": username})
        if not user or not check_password_hash(user["password"], password):
            return render_template("signin.html", error="Invalid credentials")

        session['user'] = username
        return redirect('/dashboard')

    return render_template("signin.html")



@app.route('/signup', methods=['GET', 'POST'])
def signup_view(): 
    return render_template("signup.html")


@app.route('/logout')
def logout():
    session.clear()  
    return render_template('logout.html')  




@app.route('/alerts')
def alerts_page():
    if 'user' not in session:
        return redirect('/signin')
    return render_template("alerts.html")

@app.route('/get_alerts')
def get_alerts():
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    alerts = list(collection.find({}, {"_id": 0}))
    return jsonify(alerts)


@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')  



if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5500, debug=True)
