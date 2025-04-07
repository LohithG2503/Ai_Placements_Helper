import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { JobContext } from "../context/JobContext";
import { AuthContext } from "../App";
import Navbar from "./Navbar";
import "./HeroPage.css";
import "./JobAnalyser.css"; // Import for consistent button styling

const HeroPage = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { setJobDetails, setShowNavbar } = useContext(JobContext);
  const { handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Always hide navbar when landing on the homepage
    setShowNavbar(false);
    
    // Only load job details for context, not the raw description
    const jobData = localStorage.getItem("jobDetails");
    if (jobData) {
      try {
        const parsedData = JSON.parse(jobData);
        setJobDetails(parsedData);
        // Do NOT show navbar on home page even if we have job details
      } catch (err) {
        console.error("Error parsing job details:", err);
        localStorage.removeItem("jobDetails");
      }
    }
  }, [setJobDetails, setShowNavbar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setLoading(true);
    setError("");
    setShowSuccessMessage(false);
    setShowNavbar(false);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await fetch("http://localhost:5000/api/job/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ job_description: jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze job description");
      }

      const data = await response.json();
      
      if (!data.job_details) {
        throw new Error("Invalid response format from server");
      }

      setJobDetails(data.job_details);
      localStorage.setItem("jobDetails", JSON.stringify({
        ...data.job_details,
        job_description: jobDescription
      }));
      
      setShowSuccessMessage(true);
      setShowNavbar(true); // Show navbar after successful analysis
      
      // Show success message for 1.5 seconds before navigating
      setTimeout(() => {
        setShowSuccessMessage(false);
        navigate("/job-analyser");
      }, 1500);
      
    } catch (err) {
      console.error("Error analyzing job:", err);
      setError(err.message || "Failed to analyze job description. Please try again.");
      setShowNavbar(false);
      
      if (err.message.includes("Authentication required")) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDismissError = () => {
    setIsExiting(true);
    setTimeout(() => {
      setError("");
      setIsExiting(false);
    }, 300);
  };

  return (
    <div className="hero-container">
      <Navbar />
      <div className="hero-content">
        <h1 className="hero-title">AI Placement Helper</h1>
        <div className="glassmorphic-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="jobDescription" className="form-label">
                Paste your job description here
              </label>
              <textarea
                id="jobDescription"
                className="text-box"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description including responsibilities, requirements, and company details..."
                rows={10}
                disabled={loading}
              />
            </div>
            
            <div className="button-container">
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Job Description"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <button 
        onClick={handleLogout} 
        className="logout-btn"
        disabled={loading}
      >
        Logout
      </button>

      {/* Toast Messages */}
      {error && (
        <div className={`hero-toast error ${isExiting ? 'exiting' : ''}`}>
          <span>{error}</span>
          <button 
            onClick={handleDismissError} 
            className="dismiss-button"
            disabled={loading}
          >
            Dismiss
          </button>
        </div>
      )}
      {showSuccessMessage && (
        <div className="hero-toast success">
          <span>Analysis successful!</span>
        </div>
      )}
    </div>
  );
};

export default HeroPage;