import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CSS/Msg.css';

const socket = socketIOClient('http://172.20.10.2:5000');
const insultes = ['stupide', 'fuck', 'merde', 'connard', 'deteste', 'foudre', 'batard', 'ass', 'pute','abruti','chier','niquer','enculer','cul','bite','teub','bouffon'];

function filtrerMessage(message) {
 // Conversion du message en minuscules pour la correspondance insensible à la casse
 message = message.toLowerCase();

 // Suppression de la ponctuation
 message = message.replace(/[^\w\s]/g, '');

 // Vérification des mots inappropriés
 const pattern = new RegExp(`\\b(${insultes.join('|')})\\b`);
 const matches = message.match(pattern);
 if (matches) {
 return false;
 }

 return true;
}

function Student() {
 const navigate = useNavigate();
 const { courseID, studentId } = useParams();
 const [quizData, setQuizData] = useState(null);
 const [message, setMessage] = useState('');
 const [answerSent, setAnswerSent] = useState(false);
 const navigateRef = useRef(navigate);

 useEffect(() => {
 socket.on('display_quiz_S', (data) => {
 setQuizData(data);
 setAnswerSent(false);
 });

 socket.on('close_S', () => {
 setQuizData(null);
 });

 return () => {
 socket.off('display_quiz_S');
 socket.off('close_S');
 };
 }, []);

 useEffect(() => {
 fetch('/api/student', {
 method: 'PUT',
 headers: {
 'Content-Type': 'application/json',
 },
 })
 .then((response) => response.json())
 .then((data) => {
    if(data.success){
        navigateRef.current(`/${courseID}/Student/${data.id}`);
    }else{
        navigateRef.current(`/${courseID}/Student/${data.id}`);
    }
 })
 .catch((error) => {
 console.error('Error:', error);
 });
 }, [courseID]);

 const handleSubmit = async (e) => {
 e.preventDefault();
 const trimmedMessage = message.trim();
 if (trimmedMessage === '') {
 return;
 }
 if (!filtrerMessage(trimmedMessage)) {
 toast.error('Le message contient des insultes. Veuillez réessayer avec un autre message.');
 return;
 }
 socket.emit('message', trimmedMessage);
 setMessage('');
 };

 const handleAnswerClick = (answer) => {
 if (!answerSent) {
 socket.emit('reponse', answer);
 setAnswerSent(true);
 }
 };

 return (
 <div>
 {quizData ? (
 <div>
<h1 style={{ textAlign: 'center' }}>{quizData.question}</h1>

 {quizData.answers.map((answer, index) => (
 <div class='cards'>
 <button class ='card red' key={index}onClick={() => handleAnswerClick(answer.text)}disabled={answerSent}> <p class="tip">{answer.text}</p> </button>
 <br></br>
 <br></br>
 </div>
 ))}
 </div>
 ) : (
<div style={{ 
  backgroundImage: 'linear-gradient(144deg, #ff0000, #000000 50%, #3b3b3b)',
  width: '75%',
  height: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight:'bold',
  borderRadius: '20px',
  margin: 'auto',
  marginTop: '50px', // Ajout de cette ligne
}}>
  <p>Regarder la présentation</p>
</div>


      
 )}
 <form
 onSubmit={handleSubmit}
 style={{
 position: 'absolute',
 top: '60%',
 left: '50%',
 transform: 'translate(-50%, 50%)',
 }}
 >
 <div className="subscribe">
 <p>Any comment !</p>
 <input
 type="text"
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 placeholder="Écrivez un message à votre professeur"
 />
 <div className="submit-btn" onClick={handleSubmit}>
 SUBMIT
 </div>
 </div>
 </form>
 <ToastContainer />
 </div>
 );
}

export default Student;