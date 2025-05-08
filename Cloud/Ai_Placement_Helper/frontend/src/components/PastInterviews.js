import React, { useContext, useEffect, useState } from "react";
import { JobContext } from "../context/JobContext";
import { AuthContext } from "../App";
import Navbar from "./Navbar";
import YouTubeIntegration from "./YouTubeIntegration";
import "./PastInterviews.css";

const PastInterviews = () => {
  const { showNavbar, setShowNavbar, jobDetails } = useContext(JobContext);
  const { handleLogout } = useContext(AuthContext);
  const [jobData, setJobData] = useState({
    description: "",
    company: "",
    title: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  // Set navbar visibility
  useEffect(() => {
    setShowNavbar(true);
  }, [setShowNavbar]);

  // Load job data from localStorage or context
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Shorter loading delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check for saved data in localStorage
        const savedJD = localStorage.getItem("jobDetails");
        let companyData = '';
        let titleData = '';
        
        if (savedJD) {
          try {
            const parsedData = JSON.parse(savedJD);
            
            // Extract company and job title - check all possible fields
            companyData = parsedData.company || 
                          parsedData.company_name || 
                          localStorage.getItem("jobCompany") || 
                          '';
                          
            titleData = parsedData.job_title || 
                        parsedData.title || 
                        localStorage.getItem("jobTitle") || 
                        '';
            
            setJobData({
              description: parsedData.job_description || '',
              company: companyData,
              title: titleData
            });
          } catch (parseError) {
            console.error("Error parsing saved job details:", parseError);
            // Use backup data from localStorage
            companyData = localStorage.getItem("jobCompany") || '';
            titleData = localStorage.getItem("jobTitle") || '';
            setJobData({
              description: '',
              company: companyData,
              title: titleData
            });
          }
        } else if (jobDetails) {
          // Fallback to context data if available
          companyData = jobDetails.company || '';
          titleData = jobDetails.job_title || '';
          
          setJobData({
            description: jobDetails.job_description || '',
            company: companyData,
            title: titleData
          });
        } else {
          // Don't provide defaults - let the component handle empty values
          setJobData({
            description: '',
            company: '',
            title: ''
          });
        }
        
        console.log(`Loaded job data - Company: ${companyData}, Title: ${titleData}`);
      } catch (error) {
        console.error("Error loading job data:", error);
        setJobData({
          description: '',
          company: '',
          title: ''
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [jobDetails]);

  if (isLoading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`company-details-container ${showNavbar ? 'sidebar-visible' : ''}`}>
      <Navbar />
      
      <div className="main-content">
        <div className="company-card">
          <h1 className="past-interviews-header">Past Interviews</h1>
          <YouTubeIntegration 
            companyName={jobData.company}
            jobTitle={jobData.title}
          />
        </div>
      </div>
      
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
};

export default PastInterviews;