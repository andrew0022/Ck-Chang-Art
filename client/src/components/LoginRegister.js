import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css'
import Header from './Header';

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token); // Assuming the token is returned as 'token' in the data
      console.log('Success:', data);
      navigate('/gallery'); // Update this with your actual Gallery route
    } else {
      console.error('Error:', data);
      // Handle errors
    }

    
  };

  return (
    <div>
      <Header></Header>
      <div className="login-register-container">
        <h2 className="login-form-title">{'Login'}</h2>
        <form onSubmit={handleSubmit} className="login-register-form">
          <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} className="login-form-input" />
          <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="login-form-input" />
          <button type="submit" className="login-form-submit">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        {/* <button onClick={() => setIsLogin(!isLogin)} className="switch-button">
          {isLogin ? 'No account? Register Here' : 'Already have an account? Login Here'}
        </button> */}
      </div>
    </div>
  );
}

export default LoginRegister;
