import { useState, useEffect, useRef } from 'react';
import AuthScreen from './components/AuthScreen';
import { logout } from './utils/api';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("easy");
  const [guestName, setGuestName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  const nameInputRef = useRef(null);
  
  const [state, setState] = useState({
    num1: Math.floor(Math.random() * 10) + 1,
    num2: Math.floor(Math.random() * 10) + 1,
    response: "",
    score: 0,
    wrong: 0,
    feedback: "",
    feedbackColor: "",
    gameStarted: false
  });

  const [leaderboard, setLeaderboard] = useState([]);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  // Fetch leaderboard
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  function fetchLeaderboard() {
    fetch('http://127.0.0.1:8000/api/scores/')
      .then((response) => response.json())
      .then((data) => setLeaderboard(data))
      .catch((error) => console.error("Error fetching leaderboard:", error));
  }

  function saveScore() {
    // Guest mode: show custom modal and store pending save
    if (!user) {
      setPendingSave({ score: state.score, wrong: state.wrong, difficulty });
      setShowSaveModal(true);
      return;
    }

    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    fetch('http://127.0.0.1:8000/api/scores/', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        player_name: user.username,
        score: state.score,
        wrong: state.wrong,
        difficulty: difficulty
      })
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("Score saved:", data);
      fetchLeaderboard();
    })
    .catch((error) => console.error("Error saving score:", error));
  }

  function handleSaveModalClose() {
    setShowSaveModal(false);
    // if modal closed by continuing as guest, ensure game view ends
    setState(prev => ({ ...prev, gameStarted: false }));
  }

  function handleGoToLogin() {
    // hide modal and show auth screen (don't reset game state yet)
    setShowSaveModal(false);
    setIsAuthenticated(false);
  }

  function handleAuthSuccess(userData) {
    setUser(userData);
    setIsAuthenticated(true);
    // If there was a pending guest score, save it now under the newly authenticated user
    if (pendingSave) {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Token ${token}`;

      fetch('http://127.0.0.1:8000/api/scores/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          player_name: userData.username,
          score: pendingSave.score,
          wrong: pendingSave.wrong,
          difficulty: pendingSave.difficulty
        })
      })
      .then((r) => r.json())
      .then(() => {
        setPendingSave(null);
        fetchLeaderboard();
      })
      .catch((err) => console.error('Error saving pending score:', err));
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setIsAuthenticated(false);
    setGuestName("");
    setState({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
      response: "",
      score: 0,
      wrong: 0,
      feedback: "",
      feedbackColor: "",
      gameStarted: false
    });
  }

  function startGame() {
    // Guest mode: read and save name from the input when Start is clicked
    if (!user) {
      const typed = nameInputRef.current ? nameInputRef.current.value.trim() : '';
      if (!typed && !guestName) {
        alert('Please enter your name!');
        return;
      }
      // Always save what's currently typed (if any) when Start is clicked
      if (typed && typed !== guestName) setGuestName(typed);
    }
    
    setState(prev => ({ 
      ...prev, 
      gameStarted: true, 
      response: "",
      score: 0,
      wrong: 0,
      num1: generateNumbers(),
      num2: generateNumbers()
    }));
  }

  // We only set `guestName` when the user clicks Start Game (not on Enter)

  function endGame() {
    // If guest, open save modal and keep game view so modal overlays the game
    if (!user) {
      setPendingSave({ score: state.score, wrong: state.wrong, difficulty });
      setShowSaveModal(true);
      return;
    }

    // authenticated users: save and reset
    saveScore();
    setState({
      ...state,
      gameStarted: false,
      score: 0,
      wrong: 0
    });
  }

  function generateNumbers() {
    const ranges = {
      easy: 10,
      medium: 100,
      hard: 1000
    };
    return Math.floor(Math.random() * ranges[difficulty]) + 1;
  }

  // Use refs/local input value for the quiz answer to avoid re-rendering App/navbar on every keystroke
  const responseInputRef = useRef(null);

  function inputKeyPress(event) {
    if (event.key === "Enter") {
      const answer = parseInt(event.target.value);
      if (answer === state.num1 + state.num2) {
        setState({
          ...state,
          score: state.score + 1,
          response: "",
          num1: generateNumbers(),
          num2: generateNumbers(),
          feedback: "Correct!",
          feedbackColor: "#4caf50"
        });
        // clear the input DOM value without updating App state on each keystroke
        if (event.target) event.target.value = '';
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            feedback: "",
            feedbackColor: "",
          }));
        }, 1000);
      } else {
        setState({
          ...state,
          wrong: state.wrong + 1,
          response: "",
          feedback: "Wrong!",
          feedbackColor: "#f44336"
        });
        if (event.target) event.target.value = '';
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            feedback: "",
            feedbackColor: "",
          }));
        }, 1000);
      }
    }
  }

  // Save Score Modal Component
  const SaveModal = () => (
    <div className="modal-overlay" onClick={handleSaveModalClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">🔒</div>
        <h2>Save Your Progress!</h2>
        <p className="modal-message">
          You're playing as a guest. To save your score and compete on the leaderboard, 
          you need to create an account.
        </p>
        <div className="modal-score">
          <div className="score-item">
            <span className="score-label">Correct</span>
            <span className="score-value">{pendingSave ? pendingSave.score : state.score}</span>
          </div>
          <div className="score-item">
            <span className="score-label">Wrong</span>
            <span className="score-value">{pendingSave ? pendingSave.wrong : state.wrong}</span>
          </div>
        </div>
        <div className="modal-buttons">
          <button onClick={handleGoToLogin} className="btn-primary">
            Login / Sign Up
          </button>
          <button onClick={handleSaveModalClose} className="btn-secondary">
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );

  // Navbar Component
  const Navbar = () => (
    <div className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">Math Quiz Game</div>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-user-icon">
            {user ? user.username.charAt(0).toUpperCase() : guestName.charAt(0).toUpperCase() || 'G'}
          </div>
          <span>{user ? user.username : guestName || 'Guest'}</span>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );

  // Loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <div className="spinner"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Game Screen (when playing)
  if (state.gameStarted) {
    return (
      <>
        <Navbar />
        {showSaveModal && <SaveModal />}
        <div className="quiz-container">
          <div className="difficulty-selector">
            <button
              onClick={() => setDifficulty("easy")}
              className={difficulty === "easy" ? "active" : ""}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficulty("medium")}
              className={difficulty === "medium" ? "active" : ""}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty("hard")}
              className={difficulty === "hard" ? "active" : ""}
            >
              Hard
            </button>
          </div>
          
          <div className="question">
            {state.num1} + {state.num2}
          </div>
          
          <input 
            ref={responseInputRef}
            onKeyDown={inputKeyPress}  
            type="number"
            placeholder="Your answer"
            autoFocus
          />
          
          {state.feedback && (
            <div className="feedback" style={{ color: state.feedbackColor }}>
              {state.feedback}
            </div>
          )}
          
          <div className="scores">
            <div className="score">Correct: {state.score}</div>
            <div className="wrong">Wrong: {state.wrong}</div>
          </div>
          
          <button onClick={endGame} className="end-game-btn">
            End Game & Save Score
          </button>
        </div>
      </>
    );
  }

  // Welcome Screen (not playing)
  return (
    <>
      <Navbar />
      <div className="quiz-container">
        <h1>Math Quiz Game</h1>
        <br />
        
        {/* Show name input only for guest users */}
        {!user && (
          <input 
            type="text"
            className="name-input"
            placeholder="Enter your name"
            ref={nameInputRef}
          />
        )}
        <br/>
        
        <button onClick={startGame} className="start-btn">
          Start Quiz
        </button>
        <br />
        <h2 className="leaderboard-title">Leaderboard</h2>
    
        <div className="leaderboard">
          {leaderboard.length === 0 ? (
            <div className="no-scores">No scores yet. Be the first!</div>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={entry.id} className="leaderboard-entry">
                <span className="rank">#{index + 1}</span>
                <span className="name">{entry.player_name}</span>
                <span className="score-badge">Score: {entry.score}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default App;