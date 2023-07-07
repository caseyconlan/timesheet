from flask import Flask, jsonify, request
from models import db, User, Timesheet
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import jwt_required, get_jwt_identity, JWTManager
from flask import Flask, jsonify, request, make_response
from flask_migrate import Migrate
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
from sqlalchemy import create_engine
import numpy as np
from datetime import timedelta
from datetime import datetime
from flask_cors import CORS
import traceback
from itsdangerous import URLSafeTimedSerializer
from flask_mail import Mail, Message

app = Flask(__name__)
CORS(app)
migrate = Migrate(app, db)
mail = Mail(app)

# Configure your Flask app and database connection here
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///timesheet.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_TOKEN_LOCATION'] = ['headers', 'query_string']
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config['JWT_SECRET_KEY'] = 'your-secret-key'  # replace with your secret key
db.init_app(app)
jwt = JWTManager(app)

app.config['MAIL_SERVER'] = 'your-mail-server'
app.config['MAIL_PORT'] = 'your-mail-port'
app.config['MAIL_USERNAME'] = 'your-mail-username'
app.config['MAIL_PASSWORD'] = 'your-mail-password'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True

# Create database tables
with app.app_context():
    db.create_all()

# Login route
@app.route('/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        return jsonify(message='Login successful'), 200
    else:
        return jsonify(message='Invalid username or password'), 401

# New user route
@app.route('/users', methods=['POST'])
def create_new_user():
    print(request.json)
    first_name = request.json.get('first_name')
    last_name = request.json.get('last_name')
    email = request.json.get('email')
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or len(username) < 5:
        return jsonify(message='Username is required and should be at least 5 characters long'), 400
    if not password or len(password) < 8:
        return jsonify(message='Password is required and should be at least 8 characters long'), 400

    user = User.query.filter_by(username=username).first()

    if user:
        return jsonify(message='Username already exists'), 400

    new_user = User(first_name=first_name, last_name=last_name, email=email, username=username)
    new_user.set_password(password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify(message='New user created'), 201

class ForgotPasswordResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username') 

        user = User.query.filter_by(username=username).first() 
        if user:
            # Ideally, you'd want to send an email with a reset password link 
            # This is just a placeholder action
            return {'message': 'Password reset link has been sent to your email'}
        else:
            return {'message': 'Email not found'}, 404

class UpdatePasswordResource(Resource):
    def patch(self):
        data = request.get_json()
        username = data.get('username')
        new_password = data.get('new_password')

        user = User.query.filter_by(username=username).first()
        if user:
            user.set_password(new_password)
            db.session.add(user)
            db.session.commit()
            return {'message': 'Password updated successfully'}
        else:
            return {'message': 'Username not found'}, 404


class DeleteAccountResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            db.session.delete(user)
            db.session.commit()
            return '', 204  # Return 204 No Content without a response body
        else:
            return {'message': 'Invalid username or password'}, 404

# Get all timesheets
@app.route('/timesheets', methods=['GET'])
def get_all_timesheets():
    timesheets = Timesheet.query.all()
    return jsonify([timesheet.to_dict() for timesheet in timesheets])

@app.route('/timesheets', methods=['POST'])
def post_timesheet():
    date_str = request.json.get('date')
    project_number = request.json.get('project_number')
    project_name = request.json.get('project_name')
    start_time_str = request.json.get('start_time')
    end_time_str = request.json.get('end_time')
    notes = request.json.get('notes')
    user_id = request.json.get('user_id')

    # convert date and times to appropriate objects
    date = datetime.strptime(date_str, '%Y-%m-%d').date()
    start_time = datetime.strptime(start_time_str, '%H:%M').time()
    end_time = datetime.strptime(end_time_str, '%H:%M').time()

    # calculate duration
    duration = datetime.combine(date.min, end_time) - datetime.combine(date.min, start_time)

    timesheet = Timesheet(date=date, project_number=project_number, project_name=project_name,
                          start_time=start_time, end_time=end_time, duration=duration, notes=notes, user_id=user_id)

    db.session.add(timesheet)
    db.session.commit()

    return jsonify(timesheet.to_dict()), 201

@app.route('/timesheets/<int:id>', methods=['DELETE'])
def delete_timesheet(id):
    timesheet = Timesheet.query.get(id)

    if timesheet:
        db.session.delete(timesheet)
        db.session.commit()
        return jsonify(message='Timesheet deleted'), 200
    else:
        return jsonify(message='Timesheet not found'), 404

# Welcome route
@app.route('/')
def welcome():
    return jsonify(message='Welcome to the Timesheet App')

# assuming your SQLite DB is named 'timesheet.db' and it's in the same directory as your app.py
engine = create_engine('sqlite:///timesheet.db', echo=True)

def process_heatmap_data(timesheets):
    projects = sorted(set(timesheet.project_name for timesheet in timesheets))
    dates = sorted(set(timesheet.date for timesheet in timesheets))

    # Initialize the heatmap matrix
    heatmap = [[0] * len(projects) for _ in dates]

    for date_index, date in enumerate(dates):
        for project_index, project in enumerate(projects):
            # Calculate the total duration for each project on a specific date
            total_duration = sum(
                timesheet.duration.total_seconds() // 60  # Convert duration to minutes
                for timesheet in timesheets
                if timesheet.date == date and timesheet.project_name == project
            )
            heatmap[date_index][project_index] = total_duration

    return {
        "projects": projects,
        "dates": dates,
        "heatmap": heatmap,
    }

@app.route('/heatmap')
def generate_heatmap():
    start_date = request.args.get('startDate')
    end_date = request.args.get('endDate')

    # Query timesheets with optional date filters
    query = Timesheet.query
    if start_date and end_date:
        query = query.filter(Timesheet.date.between(start_date, end_date))
    timesheets = query.all()

    heatmap_data = process_heatmap_data(timesheets)
    return jsonify(heatmap_data)


if __name__ == '__main__':
    app.run(port=5555, debug=True)
