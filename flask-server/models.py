from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

#profs
class User(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    password = db.Column(db.String(128))  
    session_id = db.Column(db.String(256))
    events = db.relationship('Event', backref='teacher', cascade="all,delete")

# Modèle de données pour un cours/événement
class Event(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    codeQR = db.Column(db.LargeBinary, nullable=True)
    slides = db.relationship('Slide', backref='event', cascade="all,delete")
    quizzes = db.relationship('Quiz', backref='event', cascade="all,delete")

# Modèle de données pour une diapositive
class Slide(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=True)
    description = db.Column(db.String(2000), nullable=True)
    image = db.Column(db.LargeBinary(length=(2**32)-1), nullable=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    date_creation = db.Column(db.DateTime, default = datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'type' : 'slide',
            'date_creation': self.date_creation.isoformat(),
        }


# Modèle de données pour un quiz
class Quiz(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(200), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    date_creation = db.Column(db.DateTime, default = datetime.utcnow)
    answers = db.relationship('QuizAnswer', backref='quiz', cascade="all,delete")
    
    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'type' : 'quiz',
            'date_creation' : self.date_creation.isoformat(),
        }

# Modèle de données pour une réponse de quiz
class QuizAnswer(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    answer = db.Column(db.String(200), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False, default=False)
    counter = db.Column(db.Integer,default=0)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)

# Modèle de données pour etudiant
class Student(UserMixin, db.Model):

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(256))

