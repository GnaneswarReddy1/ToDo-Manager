import React, { useState, useEffect } from 'react';
import { authApi, setAuthHeader } from '../api';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css'; // optional: keep your styles

export default function Login({ setUser }) {
  const [email, setEmail] = useState(localStorage.getItem('rememberedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    if (!email || !password) return alert('Please fill in all fields.');

    try {
      const { token, user } = await authApi.login({ email, password });
      localStorage.setItem('smarttodo_token', token);
      localStorage.setItem('smarttodo_user', JSON.stringify(user));
      setAuthHeader(token);
      setUser(user);

      if (rememberMe) localStorage.setItem('rememberedEmail', email);
      else localStorage.removeItem('rememberedEmail');

      nav('/app');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={submit} className="auth-form">
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '👁️‍🗨️' : '👁️'}
          </span>
        </div>

        <div className="remember-me">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
          />
          <label htmlFor="remember">Remember me</label>
        </div>

        <button className="button" type="submit">Login</button>
      </form>
    </div>
  );
}
