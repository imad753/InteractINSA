import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import logo from './logo.png';
import {toast} from 'react-toastify'

function ModifySlidePage() {
  const navigate = useNavigate();
  const { slideId } = useParams();
  const [title, setTitle] = useState('');
  const [paragraph, setParagraph] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch(`/api/slide/${slideId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(data => {
        setTitle(data.title);
        setParagraph(data.paragraph);
        if (data.image) {
          fetch(`data:image/jpeg;base64,${data.image}`)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], "filename.jpeg", { type: 'image/jpeg' });
              setImage(file);
            });
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
      });
  }, [slideId]);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleParagraphChange = (event) => {
    setParagraph(event.target.value);
  };

  const supprimerImage = (event) => {
    event.preventDefault();
    setImage(null);
    document.getElementById('image').value = null;
  };

  function handleGoBack() {
    navigate(-1);
  }

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('paragraph', paragraph);
    

    if (image) {
      formData.append('image', image);
    } else {
      formData.append('image', '');
    }

    fetch(`/api/slide/${slideId}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          toast.success('Slide sauvegardé avec succès !');
          navigate(`/Create/${window.location.pathname.split('/')[2]}`);
        } else {
          console.log('Échec de la modification de la diapositive');
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
      });
  };

  
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
    <br></br>
    <br></br>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title" style={{color:'black'}}>Titre :</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            placeholder="Entrez le titre de la diapositive"
          />
        </div>
        <div>
          <label htmlFor="paragraph" style={{color:'black'}}>Paragraphe :</label>
          <br />
          <textarea
            id="paragraph"
            value={paragraph}
            onChange={handleParagraphChange}
            placeholder="Entrez le paragraphe souhaité"
          />
        </div>
        <div>
          <label htmlFor="image"style={{color:'black'}}>Image :</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <br></br>
        <button type="submit">Modifier</button>
        <button className='creatediapo' type="button" onClick={(event) => supprimerImage(event)}>Supprimer Image</button>
      </form>

      <div className="preview">
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

export default ModifySlidePage;
