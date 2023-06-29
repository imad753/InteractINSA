from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from models import db, User, Slide, Quiz, QuizAnswer, Event, Student
import uuid
import qrcode
from io import BytesIO
import base64
from sqlalchemy.exc import SQLAlchemyError
from flask_socketio import SocketIO, emit
from dotenv import load_dotenv
import os

load_dotenv()

server_ip = os.getenv('SERVER_IP')


app = Flask(__name__)
CORS(app,supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:imad1234@127.0.0.1/myapp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'imad1234'
socketio = SocketIO(app,cors_allowed_origins="*")

db.init_app(app)



#################################
# Recuperer les données pour la #
# connexion                     #
#################################

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

   
    user = User.query.filter_by(username=username).first()

    if user and user.password == password:
       
        session_id = str(uuid.uuid4())
        
        
        user.session_id = session_id
        db.session.commit()
        
        
        response = make_response(jsonify({'success': True, 'message': 'Bien connecté'}))
        response.set_cookie('session_id', session_id)
        
        return response
    else:
        return jsonify({'success': False, 'message': 'Échec de la connexion'})
    
#################################
# Gestion de l'inscription      #
#################################

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    # vérifier que l'username n'est pas déjà utilisé
    user = User.query.filter_by(username=username).first()
    if user:
        # renvoyer une erreur si l'username est déjà utilisé
        return jsonify({'success': False, 'error': 'Le nom d\'utilisateur est déjà utilisé.'})

    # créer un nouvel utilisateur et l'ajouter à la base de données
    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'success': True})


##################################
# Verfication de la session d'un #
# utilisateur                    #
##################################

@app.route('/protected', methods=['GET'])
def protected_route():
    # Récupérer l'identifiant de session du cookie
    session_id = request.cookies.get('session_id')
    if session_id==None:
        return jsonify({'success': False, 'message': 'Accès non autorisé'}), 401
    # Vérifier si l'identifiant de session existe dans la base de données
    user = User.query.filter_by(session_id=session_id).first()

    # Si l'utilisateur existe, alors il est connecté
    if user:
        return jsonify({'success': True, 'message': 'Accès autorisé'})
    else:
        return jsonify({'success': False, 'message': 'Accès non autorisé'}), 401


######################################
# Deconnexion et detruire la session #
# de l'utiliasteur                   #
######################################

@app.route('/logout', methods=['GET'])
def logout():
    # Récupérer l'identifiant de session du cookie
    session_id = request.cookies.get('session_id')

    # Vérifier si l'identifiant de session existe dans la base de données
    user = User.query.filter_by(session_id=session_id).first()

    # Si l'utilisateur existe, alors il est connecté
    if user:
        # Supprimer l'ID de session de l'utilisateur de la base de données
        user.session_id = None
        db.session.commit()

        # Supprimer le cookie du navigateur
        response = make_response(jsonify({'success': True, 'message': 'Déconnexion réussie'}))
        response.delete_cookie('session_id')
        
        return response
    else:
        return jsonify({'success': False, 'message': 'Aucun utilisateur connecté'}), 401

###################################
# Stocker les données d'une slide #          
###################################

@app.route('/Create/<int:event_id>/Create-slide', methods=['GET', 'PUT'])
def add_slide(event_id):
    if request.method == 'PUT':
        title = request.form['title']
        description = request.form['paragraph']
        
        # Traiter l'image
        if len(request.files)==0:
            byte_image=None
        else:
            image = request.files['image']
            
            # Lire le contenu du fichier et le convertir en bytes
            byte_image = image.read()

        slide = Slide(title=title, description=description, image=byte_image, event_id=event_id)  # Utilisez les bytes de l'image en tant que valeur de l'image
        db.session.add(slide)
        db.session.commit()
        
        response = make_response(jsonify({'success': True}))

        return response
    
@app.route('/api/slide/<int:slideId>', methods=['GET', 'PUT'])
def slide_details(slideId):
    slide = Slide.query.get(slideId)
    if slide is None:
        return jsonify({'error': 'Slide not found'}), 404

    if request.method == 'GET':
        # Si vous stockez l'image en tant que bytes, convertissez les bytes en string pour pouvoir les renvoyer en JSON.
        if slide.image is not None:
            image_data = base64.b64encode(slide.image).decode()
        else:
            image_data = None

        return jsonify({
            'title': slide.title,
            'paragraph': slide.description,
            'image': image_data,
        })

    elif request.method == 'PUT':
        title = request.form.get('title')
        paragraph = request.form.get('paragraph')
        image_file = request.files.get('image')

        # Vérifiez si chaque champ a été fourni et mettez à jour le champ correspondant sur la diapositive
        if title is not None:
            slide.title = title
        if paragraph is not None:
            slide.description = paragraph
        if image_file is not None:
            slide.image = image_file.read()
        else:
            slide.image=None

        db.session.commit()
        
        return jsonify({'success': True})


@app.route('/api/quiz/<int:quizId>', methods=['GET', 'PUT'])
def quiz_details(quizId):
    quiz = Quiz.query.get(quizId)
    if quiz is None:
        return jsonify({'error': 'Quiz not found'}), 404

    if request.method == 'GET':
        answers = []
        for answer in quiz.answers:
            answers.append({
                'text': answer.answer,
                'correct': answer.is_correct,
            })
        return jsonify({
            'id': quiz.id,
            'question': quiz.question,
            'answers': answers,
        })
    elif request.method == 'PUT':
        data = request.get_json()
        if 'question' in data:
            quiz.question = data['question']
        
        if 'propositions' in data and 'correctAnswers' in data:
            propositions = data['propositions']
            correctAnswers = data['correctAnswers']

            # Supprimer les anciennes réponses
            for answer in quiz.answers:
                db.session.delete(answer)

            # Ajouter les nouvelles réponses
            for index, proposition in enumerate(propositions):
                new_answer = QuizAnswer(answer=proposition, is_correct=correctAnswers[index])
                new_answer.quiz = quiz
                db.session.add(new_answer)

        try:
            db.session.commit()
            return jsonify({'success': True}), 200
        except SQLAlchemyError as e:
            db.session.rollback()
            return jsonify({'error': 'An error occurred while updating quiz'}), 500


###################################
# Stocker les données d'un quiz   #          
###################################

@app.route('/Create/<int:event_id>/Create-quiz', methods=['PUT'])
def add_quiz(event_id):
    data = request.get_json()

    question = data.get('question')
    propositions = data.get('propositions')
    correctAnswers = data.get('correctAnswers')

    # Créer une instance du modèle Quiz avec les données de la requête
    quiz = Quiz(question=question, event_id=event_id)

    # Ajouter le quiz dans la base de données
    db.session.add(quiz)
    db.session.flush()  # Utilisez flush() pour obtenir l'id du quiz avant de commiter la transaction

    # Créer une instance de QuizAnswer pour chaque proposition
    for i, proposition in enumerate(propositions):
         new_answer = QuizAnswer(answer=proposition, is_correct=correctAnswers[i], quiz_id=quiz.id)
         db.session.add(new_answer)
    db.session.commit()

    # Enregistrer les modifications dans la base de données
    return jsonify({'success': True}), 200


###################################
# #          
###################################
@app.route('/get_event', methods=['GET'])
def get_events():
    session_id = request.cookies.get('session_id')
    user = User.query.filter_by(session_id=session_id).first()
    if user:
        teacher_id = user.id
        events = Event.query.filter_by(teacher_id=teacher_id).all()
        
        event_list = []
        for event in events:
            event_data = {
                'id': event.id,
                'title': event.title,
            }
            event_list.append(event_data)

        return jsonify(event_list)
    
#################################
# Créer un evenement par defaut #
# avec le nom par defaut        #
#################################

@app.route('/api/events', methods=['POST'])
def create_event():
    data = request.get_json()
    title = data['title']
    
    session_id = request.cookies.get('session_id')
    user = User.query.filter_by(session_id=session_id).first()

    if user:
        teacher_id = user.id

        event = Event(title=title, teacher_id=teacher_id)
        db.session.add(event)
        db.session.commit()

        lien = "http://172.20.10.2:3000/"+str(event.id)+"/student"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(lien)
        qr.make(fit=True)
        img = qr.make_image(fill='black', back_color='white')

        img_stream = BytesIO()
        img.save(img_stream)
        img_byte_array = img_stream.getvalue()

        event.codeQR = img_byte_array
        db.session.commit()

        return jsonify({'success': True, 'message': 'Event created successfully', 'eventId': event.id})

@app.route('/api/events/<int:id>', methods=['PUT'])
def update_event(id):
    data = request.get_json()
    title = data['title']
    event = Event.query.get(id)
    if event is None:
        return jsonify({'message': 'Event not found'}), 404
    event.title = title
    db.session.commit()
    return jsonify({'message': 'Event updated successfully'})

#####################################
# Retourner tous les données créées #
# d'un evenement                    #
#####################################
@app.route('/get_data/<int:eventid>', methods=['GET'])
def get_data(eventid):
    event = Event.query.get(eventid)

    if event is None:
        return jsonify({'message': 'Event not found'}), 404

    slides = Slide.query.filter_by(event_id = eventid).all()
    quizzes = Quiz.query.filter_by(event_id = eventid).all()

    slides_data = [slide.to_dict() for slide in slides]
    quizzes_data = [quiz.to_dict() for quiz in quizzes]

    slides_and_quizzes = slides_data + quizzes_data

    slides_and_quizzes.sort(key=lambda x : x['date_creation'])

    data = {
        'courseName': event.title, 
        'qrcode': base64.b64encode(event.codeQR).decode('utf-8'),
        'slidesAndQuizzes': slides_and_quizzes,
    }

    return jsonify(data), 200


#################################
# Supprimer un evenement        #
#################################  
@app.route('/delete_event/<int:eventid>', methods=['DELETE'])
def delete_event(eventid):
    event = Event.query.get(eventid)

    if event is None:
        return jsonify({'message': 'Event not found'}), 404

    db.session.delete(event)
    db.session.commit()

    return jsonify({'success': True}), 200



#################################
# Suppression des slides et des #
# quizs d'un evenement          #
#################################

#Supprimer une slide
@app.route('/api/slide/<int:slide_id>', methods=['DELETE'])
def delete_slide(slide_id):
    slide = Slide.query.get(slide_id)
    if slide is None:
        return jsonify({'message': 'Slide not found'}), 404
    db.session.delete(slide)
    db.session.commit()
    return jsonify({'success': True}), 200

#Supprimer un quizz
@app.route('/api/quiz/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    quiz = Quiz.query.get(quiz_id)
    if quiz is None:
        return jsonify({'message': 'Quiz not found'}), 404
    db.session.delete(quiz)
    db.session.commit()
    return jsonify({'success': True}), 200


@app.route('/api/student', methods=['PUT'])
def add_student():
    session_id = request.cookies.get('session_id')
    
    if session_id == None:
        student = Student()
        session_id = str(uuid.uuid4())
        student.session_id = session_id
        db.session.add(student)  # Ajouter l'étudiant à la session de la base de données
        db.session.commit()  # Effectuer le commit pour persister les modifications
        return jsonify({'success': True, 'message': 'Accès non autorisé', 'id': student.id}), 401
    else:
        student = Student.query.filter_by(session_id=session_id).first()
        
        # Si l'utilisateur existe, alors il est connecté
        if student:
            return jsonify({'success': False, 'message': 'Accès autorisé', 'id': student.id})
        else:
            student = Student(session_id=session_id)
            db.session.add(student)  # Ajouter l'étudiant à la session de la base de données
            db.session.commit()  # Effectuer le commit pour persister les modifications
            return jsonify({'success': True, 'message': 'Accès non autorisé', 'id': student.id}), 401


@app.route('/api/activeSlide/answers', methods=['POST'])
def save_answers():
    data = request.get_json()
    answers = data.get('answers', {})
    for answer, count in answers.items():
        quiz_answer = QuizAnswer.query.filter_by(answer=answer).first()
        if quiz_answer:
            quiz_answer.counter += count
        else:
            new_quiz_answer = QuizAnswer(answer=answer, counter=count)
            db.session.add(new_quiz_answer)

    db.session.commit()

    return {'message': 'Answers saved successfully'}

#Reseau
@socketio.on('display_quiz')
def handle_quiz_display(data):
    emit('display_quiz_S', data, broadcast=True)

@socketio.on('close')
def end_quiz():
    emit('close_S', broadcast=True)

@socketio.on('message')
def message(msg):
    emit('message_S',msg, broadcast=True)

@socketio.on('reponse')
def reponse(reponse):
    emit('reponse_S',reponse, broadcast=True)


if __name__ == "__main__":
    app.run(debug = True,host='172.20.10.2')