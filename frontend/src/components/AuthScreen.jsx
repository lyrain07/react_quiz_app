import { useState } from 'react';
import { login, register } from '../utils/api';
import '../styles/Authscreen.css';

function AuthScreen({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const data = await login(formData.username, formData.password);
        onAuthSuccess(data.user);
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match!');
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        
        const data = await register(formData.username, formData.email, formData.password);
        onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleGuestMode = () => {
    onAuthSuccess(null);
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <h1>Math Quiz Game</h1>
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            autoFocus
          />

          {!isLogin && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="switch-mode">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={switchMode} className="link-btn" type="button">
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>

        <div className="guest-mode">
          <button onClick={handleGuestMode} className="guest-btn" type="button">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthScreen;