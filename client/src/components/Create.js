import { useState,useEffect } from 'react';
import { useNavigate} from 'react-router-dom'; 
import './CSS/App.css'
import Modal from 'react-modal';
import { io } from "socket.io-client";
import logo from './logo.png';
import {toast} from 'react-toastify'

const socket = io('http://172.20.10.2:5000');

export default function CreateCoursePage() {

  const CustomToast = ({ closeToast }) => (
    <div>
      <p style={{color: 'black'}}>Le champ doit obligatoirement contenir une valeur.</p>
      <button onClick={closeToast}>Fermer</button>
    </div>
  )
  
  const navigate = useNavigate()
  const [courseName, setCourseName] = useState('');
  const [courseData, setCourseData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [activeSlide, setActiveSlide] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctionClicked, setCorrectionClicked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [answerDictionary, setAnswerDictionary] = useState({});
  

 const handleCourseNameChange = (event) => {
      setCourseName(event.target.value);
 };

 const handlediapo = (event) => {
  event.preventDefault();
  navigate(`Create-diapo`);
 }
 const handlequiz = (event) => {
  event.preventDefault();
  navigate(`Create-quiz`);
 }

 const handleRename = (event) => {
  if (!courseName) {
    toast(<CustomToast />);
    return;
  }
  event.preventDefault();
  fetch(`/api/events/${window.location.pathname.split('/')[2]}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({title: courseName})
  })
  .then(response => response.json())
  .then(data => {
    console.log(data)
    setCourseData(prevCourseData => {
      return {...prevCourseData, courseName: courseName}
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

const handleModifier = (itemId, itemType) => {
  if(itemType==="slide"){
    navigate(`Modifie-diapo/${itemId}`);
  }else if(itemType === "quiz"){
    navigate(`Modifie-quiz/${itemId}`);
  }
 }


 const handleSupprimer = (itemId, itemType) => {
  fetch(`/api/${itemType}/${itemId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  .then(response => {
    if(response.ok) {
      setCourseData(prevData => {
        return {
          ...prevData,
          slidesAndQuizzes: prevData.slidesAndQuizzes.filter(item => item.id !== itemId)
        };
      });
    }
    else {
      throw new Error('Erreur lors de la suppression');
    }
  })
  .catch((error) => {
    console.error('Erreur:', error);
  });
};

const handleCorrectionClick = () => {
    fetch(`/api/activeSlide/answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ answers: answerDictionary })
    })
      .then(response => response.json())
      .then(data => {
        // Traiter la réponse du serveur si nécessaire
        console.log(data);
      })
      .catch((error) => {
        console.error('Erreur:', error);
      });
  setCorrectionClicked(true);
};

const handleAfficher = (itemId, itemType) => {
  const itemIndex = courseData.slidesAndQuizzes.findIndex(item => item.id === itemId);
  if(itemIndex !== -1) {
    setCurrentIndex(itemIndex);
  }
  if(itemType === "slide") {
    fetch(`/api/slide/${itemId}`, {
      method: 'GET',
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      setActiveSlide(data);
      setShowModal(true);
    })
    .catch((error) => {
      console.error('Erreur:', error);
    });
  } else if(itemType === "quiz") {
    fetch(`/api/quiz/${itemId}`, {
      method: 'GET',
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      setActiveQuiz(data);
      setShowModal(true);
      socket.emit('display_quiz', data);
              // Mise à jour du dictionnaire des réponses
              const initialAnswers = data.answers.reduce((dict, answer) => {
                dict[answer.text] = 0;
                return dict;
              }, {});
              setAnswerDictionary(prevDictionary => {
                return {...prevDictionary, ...initialAnswers};
              });            
    })
    .catch((error) => {
      console.error('Erreur:', error);
    });
  }
};
useEffect(() => {
  console.log(answerDictionary);
}, [answerDictionary]);
const incrementAnswerCount = (cle) => {
  setAnswerDictionary(prevDictionary => {
    const updatedDictionary = {...prevDictionary};
    updatedDictionary[cle] += 0.5;
    return updatedDictionary;
  });
};


const handleCloseModal = () => {
  setShowModal(false);
  setActiveSlide(null);
  setActiveQuiz(null);
  setCorrectionClicked(false);
  socket.emit('close');
};

const handleSuivantModal = () => {
  const nextIndex = currentIndex + 1;
 
  if (nextIndex < courseData.slidesAndQuizzes.length) {
  const nextItem = courseData.slidesAndQuizzes[nextIndex];
  setCurrentIndex(nextIndex);
  handleCloseModal();
  handleAfficher(nextItem.id, nextItem.type);
  } else {
  // No more slides or quizzes, close the modal
  handleCloseModal();
  }
 };
 
 const handlePrecedentModal = () => {
  const PreviousIndex = currentIndex - 1;
 
  if (PreviousIndex !=-1) {
  const PreviousItem = courseData.slidesAndQuizzes[PreviousIndex];
  setCurrentIndex(PreviousIndex);
  handleCloseModal();
  handleAfficher(PreviousItem.id, PreviousItem.type);
  } else {
  // No more slides or quizzes, close the modal
  handleCloseModal();
  }
 };

 ////
 useEffect(() => {
  fetch('/protected', { 
    method: 'GET',
    credentials: 'include',
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('L\'utilisateur est connecté');
    } else {
      console.log('L\'utilisateur n\'est pas connecté');
      navigate('/');  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    }
  })
  .catch((error) => {
    console.error('Erreur:', error);
  });
}, []);
//////////
 ////
 useEffect(() => {
  fetch(`/get_data/${window.location.pathname.split('/')[2]}`, { 
    method: 'GET',
    credentials: 'include',
  })
  .then(response => response.json())
  .then(data => {
    setCourseData(data);  // Enregistrer les données du cours
  })
  .catch((error) => {
    console.error('Erreur:', error);
  });
}, []);
function handleGoBack() {
  navigate('/Home'); 
}

useEffect(() => {
  // Écouter les messages des étudiants
  socket.on('message_S', (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  });
  socket.on('reponse_S', (reponse) => {
    incrementAnswerCount(reponse);
  });
  return () => {
    socket.off('message_S');
    socket.off('response_S');
  };
}, []);

useEffect(() => {
  if(messages.length==11){
    setMessages(prevMessages => prevMessages.slice(1));
  }
}, [messages]);


return (
 <div className='grey-background'>
       <img src={logo} style={{
        height: '400px',
        width: '400px',
        position: 'absolute',
        top: -170,
        left: '50%',
        transform: 'translateX(-50%)'
      }} alt="logo" />
    <button className ='creatediapo' onClick={() => handleGoBack()} style={{marginLeft: 10,marginTop:20}}>Retour</button>
    <br></br>
    <br></br>
    <br></br>
    <br></br>
    <h1 style={{textAlign: 'center'}}>{courseData.courseName}</h1>

  <img className='qr-code-image' src={`data:image/png;base64,${courseData.qrcode}`} alt="QR Code" />

  <div className="form-container" >


  
  <label style={{color:'black',marginLeft:-450,height:90}}>
   <h5>Changer le nom du cours:</h5>

   <input  type="text"
    placeholder="Par exemple : Cours d'administration Linux"
    value={courseName}
    onChange={handleCourseNameChange} 
    style={{marginTop:40,marginLeft:20}}
   />
    <button onClick={handleRename} >Renommer</button>
      
  </label>
 
     

  </div>


<br></br>
 <ul>
 <li>
 <button onClick={handlediapo}>Créer un diapo</button>
 </li>
 <br></br>
 <li>
 <button onClick={handlequiz}>Créer un quiz</button>
 </li>
 </ul>
 <br></br>


 <div style={{color:'black',marginLeft:10}}>
 <h2 >Les éléments de votre cours : </h2>

 </div>
 <ul>
 {courseData.slidesAndQuizzes?.map(item => (
 <li key={item.id}>
 <span style={{fontWeight:'bold', color:'green'}}> {item.type} </span>
 <span style={{fontWeight:'bold' , color: 'royalblue'}}> : {item.title || item.question}</span>
 <div>
 <button onClick={() => handleModifier(item.id, item.type)} style={{ marginLeft: '20px' }}>Modifier</button>
 <button onClick={() => handleSupprimer(item.id, item.type)} style={{ marginLeft: '20px' }}>Supprimer</button>
 <button onClick={() => handleAfficher(item.id, item.type)} style={{ marginLeft: '20px' }}>Afficher</button>
 </div>
 <br></br>
 </li>
 ))}
 </ul>
 <Modal
 isOpen={showModal}
 onRequestClose={handleCloseModal}
 contentLabel="Item Modal"
 style={{
 overlay: {
 backgroundColor: 'rgba(0, 0, 0, 0.5)',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 },
 content: {
 width: '90%',
 height: '80%',
 background: '#f8f8f8',
 border: '1px solid #000000',
 padding: '20px',
 position: 'relative',
 top: 'auto',
 left: 'auto',
 right: 'auto',
 bottom: 'auto',
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 textAlign: 'center',
 },
 }}
>
 {activeSlide && (
 <div className="modal-content">
 <div className="slide">
 {activeSlide.image ? (
  <div className="slide-image">
    <img src={`data:image/jpeg;base64,${activeSlide.image}`} alt="Slide Image" />
  </div>
) : null}
 <div className="slide-content">
 <div>
 {activeSlide.title ? <h3>{activeSlide.title}</h3> : null}
{activeSlide.paragraph ? <p>{activeSlide.paragraph}</p> : null}
 </div>
 </div>
 </div>
 
 <button onClick={handlePrecedentModal}>
 Precedent
 </button>
 <br></br>
 <button onClick={handleSuivantModal}>
 Suivant
 </button>
 
 <button onClick={handleCloseModal} class="Btn">
 <div class="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
 <div class="textA">Fermer</div>
 </button> 
 </div>
 )}
 {activeQuiz && (
 <div>
 <div style={{ background: '#C0C0C0', padding: '10px', borderRadius: '10px', marginBottom: '10px', width: '800px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
 <p
  style={{
    color: '#fff',
    fontSize: '27px', // Même taille de texte que les propositions
    textAlign: 'center',
    width: '100%', // Utilise 90% de la largeur de l'écran, comme les propositions
    maxHeight: '120px', // Même hauteur maximale que les propositions
    overflow: 'auto', // Permet à la question de défiler si elle est trop longue
    padding: '00px', // Même padding que les propositions
    marginBottom: '8px', // Même marge inférieure que les propositions
  }}
>
  {activeQuiz.question}
</p>

 </div>
 {activeQuiz.answers.map((answer, index) => (
 <div
 key={index}
 className={`proposition${answer.correct && correctionClicked ? ' reponse-exacte' : ''}`}
 style={{
   padding: '00px', // Réduit le padding
   borderRadius: '10px',
   marginBottom: '8px', // Réduit l'espace entre les propositions
   width: '87%', // Utilise 90% de la largeur de l'écran
   maxHeight: '120px',
   overflow: 'auto',
   fontSize: '14px' // Réduit la taille du texte
 }}
>
 <p>{answer.text}</p>
  {correctionClicked && (
      <p>{answerDictionary[answer.text]}</p>
    )}
 </div>

 ))}
  <button onClick={handleCorrectionClick} className={`${correctionClicked ? ' correction-clicked' : ''}`}>
 <div></div>
 <div>Correction</div>
 </button>
 <br></br>
 <br></br>
 <button onClick={handlePrecedentModal}>
 Precedent
 </button>
 <br></br>
 <br></br>
 <button onClick={handleSuivantModal}>
 Suivant
 </button>
 <button onClick={handleCloseModal} class="Btn">
 <div class="sign"><svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg></div>
 <div class="textA">Fermer</div>
 </button> 
 </div>
)}

</Modal>
<section className="message-board">
 <div className="message-board-content">
 {messages.map((msg, index) => (
 <div key={index} className="message">
 {msg}
 </div>
 ))}
 </div>
</section>

 </div>
);
}