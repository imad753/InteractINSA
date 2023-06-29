import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from './logo.png';
function ModifyQuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams(); 
  const [question, setQuestion] = useState('');
  const [propositions, setPropositions] = useState(['', '']);
  const [reponsesExactes, setReponsesExactes] =  useState([]);

  function supprimerProposition(propositionIndex) {
    const updatedPropositions = [...propositions];
    updatedPropositions.splice(propositionIndex, 1);
    setPropositions(updatedPropositions);

    const updatedReponsesExactes = reponsesExactes.filter((reponseIndex) => reponseIndex !== propositionIndex);
    setReponsesExactes(updatedReponsesExactes);
  }

  useEffect(() => {
    fetch(`/api/quiz/${quizId}`,{ 
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        setQuestion(data.question);
        const propositions = data.answers.map((answer) => answer.text);
        const correctAnswers = data.answers.map((answer, index) => answer.correct ? index : -1)
                                          .filter(index => index !== -1);  // Filtrer les indices non valides

        setPropositions(propositions);
        setReponsesExactes(correctAnswers);
      })
      .catch((error) => {
        console.error('Erreur:', error);
      });
  }, [quizId]);

  // Utiliser useEffect pour vérifier la session de l'utilisateur à chaque fois que la page se charge
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
  }, []);  // Passer un tableau vide comme deuxième argument à useEffect pour ne l'exécuter qu'une fois au chargement de la page

  function handleGoBack() {
    navigate(-1); 
  }
  function ajouterProposition() {
    const updatedPropositions = [...propositions, ''];
    setPropositions(updatedPropositions);
  }

  function handleChangeQuestion(event) {
    setQuestion(event.target.value);
  }

  function handleChangeProposition(event, propositionIndex) {
    const updatedPropositions = [...propositions];
    updatedPropositions[propositionIndex] = event.target.value;
    setPropositions(updatedPropositions);
  }

  function handleToggleReponseExacte(propositionIndex) {
    const isReponseExacte = reponsesExactes.includes(propositionIndex);
    let updatedReponsesExactes = [];

    if (isReponseExacte) {
      updatedReponsesExactes = reponsesExactes.filter((reponseIndex) => reponseIndex !== propositionIndex);
    } else {
      updatedReponsesExactes = [...reponsesExactes, propositionIndex];
    }

    setReponsesExactes(updatedReponsesExactes);
  }

  function handleAnnuler() {
    setQuestion('');
    setPropositions(['', '']);
    setReponsesExactes([]);
  }

  function handleSauvegarder() {
    const isAnyPropositionEmpty = propositions.some(proposition => proposition === '');

    if (question === '' || propositions.length < 2 || reponsesExactes.length === 0 || isAnyPropositionEmpty) {
      let message = 'Veuillez saisir une question, au moins 2 propositions et sélectionner la/les réponse(s) exacte(s).';
      
      if (isAnyPropositionEmpty) {
        message = 'Veuillez remplir toutes les propositions.';
      }
      
      toast.error(message);
    } else {
      // Convertir les réponses exactes en un tableau de booléens correspondant aux propositions
      const correctAnswers = propositions.map((_, index) => reponsesExactes.includes(index));

      fetch(`/api/quiz/${quizId}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          propositions,
          correctAnswers
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          toast.success('Quiz sauvegardé avec succès !');
          navigate(`/Create/${window.location.pathname.split('/')[2]}`)
        } else {
          toast.error('Échec de la sauvegarde du quiz');
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
        toast.error('Une erreur est survenue lors de la sauvegarde du quiz');
      });
    }
  }

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
    <div style={{height: '-50px'}}></div> 
    <br></br>
    <br></br>
    <br></br>
    <br></br>
    <br></br>
    <br></br>
    <div className="containeQ">
     <div className='quizz-content'>

      <div className="form-group">
        <label htmlFor="questionInput"style={{ color: 'black' }}>Entrez votre question :</label>
        <br></br>
        <input style={{marginLeft:'500px'}}
          type="text"
          id="questionInput"
          placeholder="Par exemple: Sous Unix on dit généralement que :"
          value={question}
          onChange={handleChangeQuestion}
        />
      </div>
      <br></br>


      <div className="form-group">
        <label htmlFor="propositionsInput"style={{ color: 'black' }}>Entrez les différentes propositions :</label>
        <br></br>
        <div id="propositionsContainer">
          {propositions.map((proposition, propositionIndex) => (
            <div className="proposition-label" key={propositionIndex}>
              <input
                type="checkbox"
                name={`proposition${propositionIndex}`}
                value={propositionIndex}
                checked={reponsesExactes.includes(propositionIndex)}
                onChange={() => handleToggleReponseExacte(propositionIndex)}
                style={{marginLeft:250}}
              />
              <input
                type="text"
                className="proposition"
                placeholder="Nouvelle proposition"
                value={proposition}
                onChange={(event) => handleChangeProposition(event, propositionIndex)}
                style={{marginLeft:-230}}
              />
              <span className="delete-icon" onClick={() => supprimerProposition(propositionIndex)}>
              <i className="bi bi-trash-fill"></i>
                &#x1F5D1;
              </span>
            </div>
          ))}
            <br></br>
          <div className="form-group" style={{ textAlign: 'center' }}>
            <button onClick={ajouterProposition}>Ajouter une autre proposition</button>
          </div>
        </div>
      </div>

      <div className="button-group" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button style={{ marginRight: '20px',marginLeft:'500px' }} onClick={handleAnnuler}>Annuler</button>
          <button onClick={handleSauvegarder} style={{marginRight: 500}}>Sauvegarder</button>
         
       
      </div>

    </div>

    <ToastContainer />
  </div>
  </div>
 
);
}

export default ModifyQuizPage;
