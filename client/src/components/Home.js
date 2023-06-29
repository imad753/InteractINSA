import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Link, NavLink, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './CSS/App.css';
import image1 from './3.png'
import image2 from './4.png'
import logo from './logo.png'

export default function Home() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  const handleLogout = () => {
    // Envoyer une requête de déconnexion au serveur
    fetch('/logout', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Déconnexion réussie');
          navigate('/');
        } else {
          console.log('Échec de la déconnexion');
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
      });
  }

  useEffect(() => {
    fetch('/protected', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('L\'utilisateur est connecté');
          navigate('/Home');
        } else {
          console.log('L\'utilisateur n\'est pas connecté');
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
      });
  }, []);

  const handleCreateEvent = async () => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: 'Nouveau cours'}),  
    });

    const data = await response.json();

    if (data.success) {
      console.log('Événement créé avec succès:', data.eventId);
      navigate(`/Create/${data.eventId}`);  // Redirige vers le nouvel événement
    } else {
      console.log('Erreur lors de la création de l\'événement');
    }
  };

  const handleModifier = (courseId) => {
    navigate(`/Create/${courseId}`);
  }

  const handleSupprimer = (courseId) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?");
  
    if (confirmation) {
      fetch(`/delete_event/${courseId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setCourses(courses.filter(course => course.id !== courseId));
          }
        })
        .catch(error => console.error('Erreur:', error));
    }
  };

  useEffect(() => {
    fetch('/get_event', {
      method: 'GET',
      credentials: 'include',
    })
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Erreur:', error));
  }, []);

  return (
    <div className='grey-background' >
      <img src={logo} style={{
        height: '400px',
        width: '400px',
        position: 'absolute',
        top: -140,
        left: '50%',
        transform: 'translateX(-50%)'
      }} alt="logo" />

      <div style={{ marginTop: '25px', marginLeft: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginLeft: '-500px' }}>
          <button onClick={handleCreateEvent} >
            <span className="text">Créer un événement</span>
          </button>
          <button onClick={handleLogout} >
            <span className="text">Se déconnecter</span>
          </button>
        </div>

        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <h1>Liste des cours :</h1>
        <br></br>
        <ul>
          {courses.map(course => (
            <li key={course.id}>
              <span><h3 style={{color: 'black'}}>Titre: {course.title}</h3></span>
              <div>
                <br></br>
                <button onClick={() => handleModifier(course.id)} >
                  <span> Afficher </span>
                </button>
                <button onClick={() => handleSupprimer(course.id)} >
                  <span> Supprimer </span>
                </button>
                <br></br>
              </div>
              <br></br>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',pointerEvents:'none' }}>
        <img src={image1} alt="Image 1" style={{ width: '300px', height: '300px', marginRight: '1150px' }} />
      </div>

      <div style={{ position: 'absolute', top: '50%', right: '50%', transform: 'translate(50%, -50%)',pointerEvents:'none' }}>
        <img src={image2} alt="Image 2" style={{ width: '300px', height: '300px', marginLeft: '1100px' }} />
      </div>
    </div> 
  );
}
