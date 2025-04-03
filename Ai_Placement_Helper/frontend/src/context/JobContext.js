import React, { createContext, useState, useEffect } from "react";

export const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [jobDetails, setJobDetails] = useState(null);
  const [showNavbar, setShowNavbar] = useState(false);

  // Initialize on mount - only show navbar if there are valid job details
  useEffect(() => {
    try {
      // Get stored navbar state first
      const navbarState = sessionStorage.getItem("showNavbar");
      
      // Get job details
      const storedJobDetails = localStorage.getItem("jobDetails");
      
      if (storedJobDetails) {
        const parsedDetails = JSON.parse(storedJobDetails);
        // Set job details in state
        setJobDetails(parsedDetails);
        
        // Use existing navbar state or determine based on job details
        if (navbarState === "true") {
          setShowNavbar(true);
        } else if (navbarState === "false") {
          setShowNavbar(false);
        } else {
          // Only show navbar if there's an actual job analysis
          const shouldShowNavbar = !!parsedDetails && Object.keys(parsedDetails).length > 0;
          setShowNavbar(shouldShowNavbar);
        }
      } else {
        setShowNavbar(false);
      }
    } catch (error) {
      console.error("Error reading job details from localStorage:", error);
      setShowNavbar(false);
    }
  }, []);
  
  // Persist navbar state to sessionStorage when it changes
  useEffect(() => {
    sessionStorage.setItem("showNavbar", showNavbar);
  }, [showNavbar]);

  return (
    <JobContext.Provider value={{ 
      jobDetails, 
      setJobDetails,
      showNavbar,
      setShowNavbar
    }}>
      {children}
    </JobContext.Provider>
  );
};