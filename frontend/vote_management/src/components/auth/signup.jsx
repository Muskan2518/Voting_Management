import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignup = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Signup successful! Please log in.');
        navigate('/signin'); // redirect to sign in
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
      /><br />

      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      /><br />

      <input
        name="password"
        type="password"
        placeholder="Password (min 8 chars)"
        value={formData.password}
        onChange={handleChange}
      /><br />

      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
};

export default SignUp;
