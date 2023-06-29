import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CSS/App.css';
import image from '../components/CSS/templates.png';
import {toast} from 'react-toastify'

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [r_message , setr_message] = useState('');
  const [r_username, setr_username] = useState('');
  const [r_password , setr_password] = useState('');
  const [r_passwordConfirm, setr_passwordConfirm] = useState('');

  const handle_RpasswordConfirm = (event) => {
    setr_passwordConfirm(event.target.value);
  }

  const CustomToast = ({ closeToast }) => (
    <div>
      <p style={{color: 'black'}}>Veuillez remplir tous les champs pour l'inscription.</p>
      <button onClick={closeToast}>Fermer</button>
    </div>
  )
  
  const navigate = useNavigate();
  const location = useLocation();
  const isFirstPage = location.pathname === '/';

  const handle_Rusername = (event) =>{
    setr_username(event.target.value)
  }

  const handle_Rpassword = (event) => {
    setr_password(event.target.value)
  }


  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  useEffect(() => {
    fetch('/protected', {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log("L'utilisateur est connecté");
          navigate('/Home');
        } else {
          console.log("L'utilisateur n'est pas connecté");
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log('Connexion réussie');
          navigate('/Home');
        } else {
          console.log("Échec de la connexion");
          setErrorMessage("Échec de la connexion");
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
        setErrorMessage('Erreur de connexion');
      });
  };

  const handlesubmitregister = (event) => {
    event.preventDefault();
    if(!r_username || !r_password || !r_passwordConfirm ){
      toast(<CustomToast />);
      return;
    }
  
    // Vérifie si le mot de passe et la confirmation du mot de passe correspondent
    if (r_password !== r_passwordConfirm) {
      setr_message('Les mots de passe ne correspondent pas.');
      return;
    }
  
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: r_username,
        password: r_password,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
            console.log('Inscription réussie');
            setr_message('Inscription réussie');
            setTimeout(() => {
                window.location.reload();
              }, 1000); 
        } else {
          console.log("Échec de l'inscription");
          setr_message("Échec de l'inscription: " + data.error);
        }
      })
      .catch((error) => {
        console.error('Erreur:', error);
        setr_message('Erreur lors de l\'inscription');
      });
  };
  
  return (
    <div>
    <div className="main">
      {isFirstPage && (
        <div className="background-image">
          <img src={image} alt="Background" />
        </div>
      )}

      <input type="checkbox" id="chk" aria-hidden="true" />

      <div className="login">
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="chk" aria-hidden="true">Log in</label>
          <input className="input username" autocomplete="off"  value={username} onChange={handleUsernameChange} type="text" name="email" placeholder="Username" required="" />
          <input className="input" autocomplete="off" value={password} onChange={handlePasswordChange} type="password" name="pswd" placeholder="Password" required="" />
          <button>Log in</button>
        </form>
        {errorMessage && <p className="login-error">{errorMessage}</p>}
      </div>

      <div className="register">
        <form onSubmit={handlesubmitregister} className="form">
          <label htmlFor="chk" aria-hidden="true">Inscription</label>
          <input className="input username" autocomplete="off"  value = {r_username} onChange={handle_Rusername}type="text" name="txt" placeholder="Username" required="" />
          <input className="input" type="password"autocomplete="off"  value={r_password} onChange={handle_Rpassword} name="email" placeholder="Password" required="" />
          <input className="input" type="password" autocomplete="off" value={r_passwordConfirm} onChange={handle_RpasswordConfirm} name="pswdConfirm" placeholder="Confirm Password" required="" />
          <button>Register</button>
        </form>
        {r_message && <p className="register-error">{r_message}</p>}
      </div>
    </div>
    </div>
  );
}

export default Login;