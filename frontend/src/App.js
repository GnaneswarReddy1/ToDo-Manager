import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import { setAuthHeader } from './api';

function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('smarttodo_user');
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const token = localStorage.getItem('smarttodo_token');
    if (token) setAuthHeader(token);
  }, []);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/app" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={user ? "/app" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
