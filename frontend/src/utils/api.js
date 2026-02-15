const API_URL = 'http://127.0.0.1:8000/api';

//  AUTH FUNCTIONS

export const register = async (username, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    const data = await response.json();
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  const token = localStorage.getItem('token');
  
  try {
    await fetch(`${API_URL}/logout/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear localStorage regardless
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/profile/`, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Profile fetch error:', error);
    return null;
  }
};


export const fetchLeaderboard = async (difficulty = null) => {
  try {
    const url = difficulty 
      ? `${API_URL}/scores/?difficulty=${difficulty}`
      : `${API_URL}/scores/`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

export const saveScore = async (scoreData) => {
  const token = localStorage.getItem('token');
  
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add token if logged in
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    const response = await fetch(`${API_URL}/scores/`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(scoreData)
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};