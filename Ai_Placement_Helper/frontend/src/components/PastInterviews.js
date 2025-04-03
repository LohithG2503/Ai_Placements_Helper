import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JobContext } from "../context/JobContext";
import Navbar from "./Navbar";
import "./JobAnalyser.css"; // Reusing the same styles

function PastInterviews() {
  const { showNavbar, setShowNavbar } = useContext(JobContext);
  const navigate = useNavigate();

  // Set navbar visibility
  useEffect(() => {
    setShowNavbar(true); // Always show navbar on past interviews page
  }, [setShowNavbar]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jobDetails");
    setShowNavbar(false);
    navigate("/login");
  };

  return (
    <div className={`company-details-container ${showNavbar ? 'sidebar-visible' : ''}`}>
      <Navbar />
      
      <div className="main-content">
        <div className="company-card">
          <h1 className="company-header">Past Interviews</h1>
          <div className="placeholder-content">
            <p className="placeholder-message">
              This feature is currently under development. Soon you'll be able to:
            </p>
            <div className="info-section">
              <h2>Upcoming Features</h2>
              <ul>
                <li>Track your interview history</li>
                <li>Review past interview questions</li>
                <li>Analyze your performance</li>
                <li>Get personalized feedback</li>
              </ul>
            </div>
            <p className="coming-soon">Coming Soon!</p>
          </div>
        </div>
      </div>
      
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
}

export default PastInterviews;