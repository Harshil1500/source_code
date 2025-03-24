import React from 'react';
import './App.css';
import Login from './Pages/LoginPage/Login';
import ErrorPage from './Pages/ErrorPage/ErrorPage';
import { Route, Routes } from 'react-router-dom';
import SignUp from './Pages/SignUpPage/SignUp';
import Dash from './Pages/Dash';
import ResetPassword from './Pages/ResetPassword/ResetPassword';
import CompleteProfile from './Pages/student/Pages/CompleteProfile'; // ✅ Import it



function App() {
  return (
    <>
      <Routes>
        <Route exact path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/dash' element={<Dash />} />
        <Route path='/reset' element={<ResetPassword />} />
        <Route path='/complete-profile' element={<CompleteProfile />} /> {/* ✅ Add this */}
        <Route path='*' element={<ErrorPage />} />
      </Routes>
    </>
  );
}

export default App;
