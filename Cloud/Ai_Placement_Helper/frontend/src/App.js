import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/toast';
import { JobProvider } from './context/JobContext';
import './index.css';

// Import components
import Navbar from './components/Navbar';
import JobAnalyser from './components/JobAnalyser';
import CompanyInfo from './components/CompanyInfo';
import PastInterviews from './components/PastInterviews';
import LoginPage from './components/LoginPage';
import HeroPage from './components/HeroPage';

// AuthContext to manage authentication state across the app
export const AuthContext = React.createContext();

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check authentication status on initial load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("jobDetails");
    
    // Update state to trigger re-render
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, handleLogin, handleLogout }}>
      <ToastProvider>
        <JobProvider>
          <Router>
            <div className="App">
              {isLoggedIn && <Navbar />}
              <main>
                <Routes>
                  <Route path="/login" element={!isLoggedIn ? <LoginPage /> : <Navigate to="/" />} />
                  <Route path="/" element={isLoggedIn ? <HeroPage /> : <Navigate to="/login" />} />
                  <Route path="/job-analyser" element={isLoggedIn ? <JobAnalyser /> : <Navigate to="/login" />} />
                  <Route path="/company-info" element={isLoggedIn ? <CompanyInfo /> : <Navigate to="/login" />} />
                  <Route path="/past-interviews" element={isLoggedIn ? <PastInterviews /> : <Navigate to="/login" />} />
                  {/* Catch-all route to redirect to login */}
                  <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
                </Routes>
              </main>
            </div>
          </Router>
        </JobProvider>
      </ToastProvider>
    </AuthContext.Provider>
  );
}

export default App;
