import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, setUser }) {
  const nav = useNavigate();
  function logout(){
    localStorage.removeItem('smarttodo_token');
    localStorage.removeItem('smarttodo_user');
    setUser(null);
    nav('/login');
  }
  return (
    <div className="nav">
      <div style={{display:'flex', gap:12, alignItems:'center'}}><strong>SmartToDo</strong><span className="small">AI-powered tasks</span></div>
      <div>
        {user ? (
          <>
            <span style={{marginRight:12}}>{user.name}</span>
            <button className="button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"><button className="button">Login</button></Link>
            <Link to="/signup"><button className="button" style={{marginLeft:8}}>Signup</button></Link>
          </>
        )}
      </div>
    </div>
  );
}
