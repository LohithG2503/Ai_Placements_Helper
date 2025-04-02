import React, { useContext, useEffect } from "react";
import { JobContext } from "../context/JobContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import "./JobAnalyser.css";

const JobAnalyser = () => {
  const { jobDetails, showNavbar, setShowNavbar } = useContext(JobContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (jobDetails) {
      setShowNavbar(true);
      
      const timer = setInterval(() => {
        setShowNavbar(true);
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setShowNavbar(false);
    }
  }, [jobDetails, setShowNavbar]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jobDetails");
    setShowNavbar(false);
    navigate("/login");
  };

  if (!jobDetails) {
    return (
      <div className="job-analyser-container">
        <Navbar />
        <div className="content-area">
          <div className="glassmorphic-card">
            <h2 className="error-heading">No Job Details Found</h2>
            <p className="error-message">Please submit a job description from the home page.</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    );
  }

  const {
    job_title,
    company,
    location,
    salary_range,
    job_type,
    responsibilities,
    requirements,
    how_to_apply
  } = jobDetails;
  return (
    <div className={`job-analyser-container ${showNavbar ? 'sidebar-visible' : ''}`}>
      <Navbar />
      <div className="main-content">
        <div className="glassmorphic-card">
          <div className="job-header">
            <div className="company-section">
              <h2 className="company-name">{company || "Company Not Specified"}</h2>
              {location && location !== "Not specified" && (
                <p className="location">Location: {location}</p>
              )}
            </div>

            <h1 className="job-title">{job_title || "Job Title Not Available"}</h1>
          </div>
          <div className="job-details-grid">
            {salary_range && salary_range !== "Not specified" && (
              <div className="detail-item">
                <h3><b><u>Salary Range</u></b></h3>
                <p>{salary_range}</p>
              </div>
            )}
            
            {job_type && job_type !== "Not specified" && (
              <div className="detail-item">
                <h3><b>Job Type</b></h3>
                <p>{job_type}</p>
              </div>
            )}
          </div>
          
          {responsibilities && responsibilities.length > 0 && (
            <div className="responsibilities-section">
              <h3><b><u>Key Responsibilities</u></b></h3>
              <ul>
                {responsibilities.map((responsibility, index) => (
                  <li key={`resp-${index}`}>{responsibility}</li>
                ))}
              </ul>
            </div>
          )}
          
          {requirements && requirements.length > 0 && (
            <div className="requirements-section">
              <h3><b><u>Requirements</u></b></h3>
              <ul>
                {requirements.map((requirement, index) => (
                  <li key={`req-${index}`}>{requirement}</li>
                ))}
              </ul>
            </div>
          )}
          
          {how_to_apply && how_to_apply !== "Not specified" && (
            <div className="apply-section">
              <h3><b><u>How to Apply</u></b></h3>
              <p>{how_to_apply}</p>
            </div>
          )}
        </div>
      </div>
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default JobAnalyser;