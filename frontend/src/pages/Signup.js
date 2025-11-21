import React, { useState } from 'react';
import { authApi, setAuthHeader } from '../api';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';

export default function Signup({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const nav = useNavigate();

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const checkPasswordStrength = (pass) => {
    if (pass.length < 6) return 'Too short';
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[\W]/.test(pass)) return 'Strong';
    if ((/[A-Z]/.test(pass) && /[0-9]/.test(pass)) || /[a-z]/.test(pass)) return 'Medium';
    return 'Weak';
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordStrength(checkPasswordStrength(val));
  };

  async function submit(e) {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword)
      return alert('All fields are required.');
    if (!validateEmail(email)) return alert('Enter a valid email.');
    if (password !== confirmPassword) return alert('Passwords do not match.');
    if (passwordStrength === 'Too short' || passwordStrength === 'Weak')
      return alert('Password is too weak.');

    try {
      // 1️⃣ Clear any old token first
      localStorage.removeItem('smarttodo_token');
      localStorage.removeItem('smarttodo_user');

      // 2️⃣ Signup API call
      const { token, user } = await authApi.signup({ name, email, password });

      // 3️⃣ Save token & user
      localStorage.setItem('smarttodo_token', token);
      localStorage.setItem('smarttodo_user', JSON.stringify(user));

      // 4️⃣ Set Axios auth header
      setAuthHeader(token);

      setUser(user);

      nav('/app'); // go to dashboard
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  }

  return (
    <div className="auth-container">
      <h2>Create an account</h2>
      <form onSubmit={submit} className="auth-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>

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
            onChange={handlePasswordChange}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '👁️‍🗨️' : '👁️'}
          </span>
        </div>
        {password && <small>Password strength: {passwordStrength}</small>}

        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button className="button" type="submit">Sign Up</button>
      </form>
    </div>
  );
}
