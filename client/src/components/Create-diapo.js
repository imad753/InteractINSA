import React, { useState,useEffect} from 'react';
import './CSS/App.css';
import { useNavigate } from 'react-router-dom';
import logo from './logo.png';
import {toast} from 'react-toastify'

function CreateSlidePage() {
  
  const CustomToast = ({ closeToast }) => (
    <div>
      <p style={{color: 'black'}}>Veuillez remplir le titre et le paragraphe.</p>
      <button onClick={closeToast}>Fermer</button>
    </div>
  )

  const navigate = useNavigate()
  const [title, setTitle] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [image, setImage] = useState(null);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleParagraphChange = (event) => {
    setParagraph(event.target.value);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  // Utiliser useEffect pour vérifier la session de l'utilisateur à chaque fois que la page se charge
  useEffect(() => {
    fetch('/protected', { 
      method: 'GET',
      credentials: 'include',
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('succés');
      } else {
        console.log('echec');
        navigate('/');  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      }
    })
    .catch((error) => {
      console.error('Erreur:', error);
    });
  }, []);  // Passer un tableau vide comme deuxième argument à useEffect pour ne l'exécuter qu'une fois au chargement de la page

  const supprimerImage = (event) => {
    event.preventDefault();
    setImage(null);
    document.getElementById('image').value = null;
  };

  
  const handleSubmit = (event) => {
    event.preventDefault();
    if(!title || !paragraph){
      toast(<CustomToast />);
      return;
    }
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('paragraph', paragraph);
    formData.append('image', image);  // Ajoutez l'image au formData
  
    fetch(`/Create/${window.location.pathname.split('/')[2]}/Create-slide`, { 
      method: 'PUT',
      credentials: 'include',
      body: formData,  // Utilisez formData comme corps de la requête
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        toast.success('Slide sauvegardé avec succès !');
        navigate(`/Create/${window.location.pathname.split('/')[2]}`);
      } else {
        console.log('Échec de la création de la slide');
      }
    })
    .catch((error) => {
      console.error('Erreur:', error);
    });
  };
  function handleGoBack() {
    navigate(-1); 
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
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" style={{color:'black',marginLeft :-1400}}>Titre :</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Entrez le titre de la diapositive"
            style ={{marginLeft: 10}}
          />
        </div>
        <div>
          <br></br>
          <label htmlFor="paragraph" style={{color:'black',marginLeft :-1310}}>Paragraphe :</label>
          <br />
          <textarea
            id="paragraph"
            value={paragraph}
            onChange={handleParagraphChange}
            placeholder="Entrez le paragraphe souhaité"
            style ={{marginLeft: 10}}
          />
        </div>
        <div>
          <br></br>
          <label htmlFor="image"style={{color:'black',marginLeft :-1390}}>Image :</label>
          <br />
          <input
            type="file"
            id="image"
            accept="image/*"
            style ={{marginLeft: 10}}
            onChange={handleImageChange}
          />
        </div>
        <br></br>
        <br></br>
        <button className='creatediapo' type="button" onClick={(event) => supprimerImage(event)}>Supprimer Image</button>
        <button  className='creatediapo' type="submit"style={{marginLeft:40}}>Créer</button>
      
        
      
      </form>
      

      <div className="preview"style={{marginLeft:10}}>
        <h2>Aperçu :</h2>
        <div className="slide">
          {image && (
            <div className="slide-image">
              <img src={URL.createObjectURL(image)} alt="Slide Image" />
            </div>
          )}
          <div className="slide-content">
            <div>
              <h3>{title}</h3>
              <p>{paragraph}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSlidePage;