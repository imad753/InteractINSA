import React from "react";
import { BrowserRouter as Router, Route, Link, NavLink, Routes } from 'react-router-dom';
import Login from "./login";
import Create from './Create';
import Home from './Home';
import CreateDiapo from './Create-diapo';
import CreateQuiz from './Create-quiz';
import ModifieDiapo from './Modifie-diapo';
import ModifieQuiz from './Modifie-quiz';
import Student from './Student';
import './CSS/App.css';
import { ToastContainer } from 'react-toastify';


function App() {
  return (
    <Router>
      <div className="App">
      <ToastContainer />
      
 

 

 
 

 <main>
<Routes>
  <Route exact path="/" element={<Login />} />
  <Route exact path="/Home" element={<Home />} />
  <Route path="/Create/:id" element={<Create />} />
  <Route path="/Create/:id/Create-quiz" element={<CreateQuiz />} />
  <Route path="/Create/:id/Modifie-quiz/:quizId" element={<ModifieQuiz />} />
  <Route path="/Create/:id/Create-diapo" element={<CreateDiapo />} />
  <Route path="/Create/:id/Modifie-diapo/:slideId" element={<ModifieDiapo />} />
  <Route path="/:courseID/Student" element={<Student />} />
  <Route path="/:courseID/Student/:studentId" element={<Student />} />
</Routes>
</main>
      </div>
    </Router>
  );
}

export default App;

