import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { JobContext } from '../context/JobContext';
import { AuthContext } from '../App';
import './HeroPage.css';

const Navbar = () => {
  const { showNavbar } = useContext(JobContext);
  const { handleLogout } = useContext(AuthContext);
  const location = useLocation();

  // Don't render anything on login page
  if (location.pathname === '/login') {
    return null;
  }

  // Use the sidebar-nav class with visible modifier from JobAnalyser.css
  return (
    <div className={`sidebar-nav ${showNavbar ? 'visible' : ''}`}>
      <Link
        to="/"
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        Home
      </Link>
      <Link
        to="/job-analyser"
        className={`nav-item ${location.pathname === '/job-analyser' ? 'active' : ''}`}
      >
        Job Analysis
      </Link>
      <Link
        to="/company-info"
        className={`nav-item ${location.pathname === '/company-info' ? 'active' : ''}`}
      >
        Company Details
      </Link>
      <Link
        to="/past-interviews"
        className={`nav-item ${location.pathname === '/past-interviews' ? 'active' : ''}`}
      >
        Past Interviews
      </Link>
      <button 
        className="nav-item logout-btn" 
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;