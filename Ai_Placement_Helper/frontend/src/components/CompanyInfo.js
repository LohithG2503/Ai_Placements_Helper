import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { JobContext } from "../context/JobContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./JobAnalyser.css"; // Base styles
import "./InterviewProcess.css"; // Specific styles last to take precedence
import "./Search.css"; // Add this import for search styling

function CompanyInfo() {
  const { jobDetails, showNavbar, setShowNavbar } = useContext(JobContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const searchTimeout = useRef(null);
  const searchResultsRef = useRef(null);
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("jobDetails");
    setShowNavbar(false);
    navigate("/login");
  };

  // Load popular companies on component mount
  useEffect(() => {
    const loadCompanyList = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch list of companies for suggestions
        const response = await axios.get("http://localhost:5000/api/company", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setCompanyList(response.data.data);
        }
      } catch (err) {
        console.error("Failed to load company list:", err);
      }
    };

    loadCompanyList();
  }, []);

  // Function to fetch company information wrapped in useCallback
  const fetchCompanyInfo = useCallback(async (company) => {
    if (!company) return;
    
    setLoading(true);
    setError(null);
    setShowSearchResults(false);
    setCompanyInfo(null); // Clear previous data immediately
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      // Add a minimum loading time to prevent UI flickering
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 800));
      
      console.log(`Fetching data for company: ${company}`);
      const fetchData = axios.get(
        `http://localhost:5000/api/company/${encodeURIComponent(company)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Wait for both the minimum load time and the API response
      const [response] = await Promise.all([fetchData, minLoadTime]);

      // Check response structure
      if (!response.data) {
        throw new Error("No data received from server");
      }

      console.log(`Data received for ${company}:`, response.data);
      
      if (!response.data.success) {
        // Handle server-reported failure
        setError(response.data.error || `Error retrieving information for ${company}`);
        
        // Still use fallback data if provided
        if (response.data.data) {
          setCompanyInfo(response.data.data);
        } else {
          // Create fallback data
          setCompanyInfo({
            name: company,
            description: `Information about ${company} is currently being compiled.`,
            industry: "Not specified",
            founded: "Not specified",
            headquarters: "Not specified",
            employeeCount: "Not specified",
            source: "placeholder"
          });
        }
      } else {
        // Set the company info from response
        if (response.data.data) {
          setCompanyInfo({
            ...response.data.data,
            name: response.data.data.name || company // Ensure name is always set
          });
        } else {
          setCompanyInfo({
            ...response.data,
            name: response.data.name || company // Ensure name is always set
          });
        }
        setError(null);
      }
    } catch (err) {
      console.error("Company info fetch error:", err);
      
      const errorMessage = err.response?.data?.error || err.message || "Network error";
      setError(errorMessage);
      
      // If we have fallback data from the error response, use it
      if (err.response?.data?.data) {
        setCompanyInfo(err.response.data.data);
      } else {
        // Create fallback data if none provided
        setCompanyInfo({
          name: company,
          description: `Unable to retrieve information for ${company} at this time.`,
          industry: "Not available",
          founded: "Not available",
          headquarters: "Not available",
          employeeCount: "Not available",
          source: "error"
        });
      }
      
      // Handle authentication errors
      if (errorMessage.includes("Authentication required")) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array

  // Function to search for companies
  const searchCompanies = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `http://localhost:5000/api/company/search/${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.success) {
        setSearchResults(response.data.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCompanyNameChange = (e) => {
    const value = e.target.value;
    setCompanyName(value);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        searchCompanies(value);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
  };

  const handleSelectCompany = (company) => {
    setCompanyName(company.name);
    setShowSearchResults(false);
    setSearchResults([]);
    fetchCompanyInfo(company.name);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    if (companyName.trim()) {
      // Hide any search results that might be showing
      setShowSearchResults(false);
      // Clear previous search results
      setSearchResults([]);
      // Fetch company info
      fetchCompanyInfo(companyName);
    } else {
      setError("Please enter a company name");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    // Reset all states
    setCompanyName('');
    setCompanyInfo(null);
    setError(null);
    setSearchResults([]);
    setShowSearchResults(false);
    setLoading(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Fetch company info if job details exist
  useEffect(() => {
    // Use company name from job details if available
    if (jobDetails && jobDetails.company && jobDetails.company.trim()) {
      const companyFromJob = jobDetails.company.trim();
      setCompanyName(companyFromJob);
      fetchCompanyInfo(companyFromJob);
    }
    
    // Make sure navbar is visible
    setShowNavbar(true);
  }, [jobDetails, fetchCompanyInfo, setShowNavbar]); // Dependencies

  // Render the company information
  const renderCompanyInfo = () => {
    if (!companyInfo) return null;
    
    // Ensure company name is displayed correctly
    const displayName = companyInfo.name || 'Unknown Company';
    
    return (
      <div className="info-section">
        <h2>{displayName}</h2>
        
        {companyInfo.source && (
          <div className="source-badge">
            Data Source: {companyInfo.source}
          </div>
        )}
        
        {/* Basic info */}
        <div className="about-subsection">
          <h3>About</h3>
          <p className="about-text">
            {companyInfo.description || `Information about ${displayName} is being compiled.`}
          </p>
          
          {/* Extended Description - Always show when available */}
          <div className="extended-description">
            {companyInfo.extendedDescription && companyInfo.extendedDescription.length > 0 ? (
              companyInfo.extendedDescription.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : null}
          </div>
          
          <div className="basic-info-grid">
            {companyInfo.founded && (
              <div className="info-item">
                <span className="info-label">Founded</span>
                <span className="info-value">{companyInfo.founded}</span>
              </div>
            )}
            
            {companyInfo.headquarters && (
              <div className="info-item">
                <span className="info-label">Headquarters</span>
                <span className="info-value">{companyInfo.headquarters}</span>
              </div>
            )}
            
            {companyInfo.industry && (
              <div className="info-item">
                <span className="info-label">Industry</span>
                <span className="info-value">{companyInfo.industry !== "Unknown" ? companyInfo.industry : "Not specified"}</span>
              </div>
            )}
            
            {companyInfo.employeeCount && (
              <div className="info-item">
                <span className="info-label">Employees</span>
                <span className="info-value">{companyInfo.employeeCount}</span>
              </div>
            )}
            
            {companyInfo.revenue && (
              <div className="info-item">
                <span className="info-label">Revenue</span>
                <span className="info-value">{companyInfo.revenue}</span>
              </div>
            )}
            
            {companyInfo.website && (
              <div className="info-item">
                <span className="info-label">Website</span>
                <a 
                  href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  {companyInfo.website.replace(/^https?:\/\//i, '')}
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Key People */}
        {companyInfo.keyPeople && companyInfo.keyPeople.length > 0 && companyInfo.keyPeople[0] !== 'Unknown' && (
          <div className="about-subsection">
            <h3>Key People</h3>
            <ul className="values-list">
              {companyInfo.keyPeople.map((person, index) => (
                <li key={index}>{person}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Business Segments */}
        {companyInfo.businessSegments && companyInfo.businessSegments.length > 0 && (
          <div className="about-subsection">
            <h3>Business Segments</h3>
            <div className="technologies-container">
              {companyInfo.businessSegments.map((segment, index) => (
                <span key={index} className="technology-tag">{segment}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Technologies */}
        {companyInfo.technologies && companyInfo.technologies.length > 0 && (
          <div className="about-subsection">
            <h3>Technologies</h3>
            <div className="technologies-container">
              {companyInfo.technologies.map((tech, index) => (
                <span key={index} className="technology-tag">{tech}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Products */}
        {companyInfo.products && companyInfo.products.length > 0 && (
          <div className="about-subsection">
            <h3>Products</h3>
            <ul className="values-list">
              {companyInfo.products.map((product, index) => (
                <li key={index}>{product}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Services */}
        {companyInfo.services && companyInfo.services.length > 0 && (
          <div className="about-subsection">
            <h3>Services</h3>
            <ul className="values-list">
              {companyInfo.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Company Culture */}
        {companyInfo.culture && companyInfo.culture.values && (
          <div className="about-subsection">
            <h3>Company Culture</h3>
            <div className="culture-details">
              {companyInfo.culture.workLifeBalance && (
                <div className="culture-item">
                  <span className="culture-label">Work-Life Balance:</span>
                  <span className="culture-value">{companyInfo.culture.workLifeBalance}</span>
                </div>
              )}
              {companyInfo.culture.learningOpportunities && (
                <div className="culture-item">
                  <span className="culture-label">Learning Opportunities:</span>
                  <span className="culture-value">{companyInfo.culture.learningOpportunities}</span>
                </div>
              )}
              {companyInfo.culture.teamEnvironment && (
                <div className="culture-item">
                  <span className="culture-label">Team Environment:</span>
                  <span className="culture-value">{companyInfo.culture.teamEnvironment}</span>
                </div>
              )}
            </div>
            <h4>Core Values</h4>
            <div className="technologies-container">
              {companyInfo.culture.values.map((value, index) => (
                <span key={index} className="technology-tag">{value}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Interview Process */}
        {companyInfo.interviewProcess && (
          <div className="about-subsection">
            <h3>Interview Process</h3>
            {companyInfo.interviewProcess.rounds && (
              <div>
                <h4>Interview Rounds</h4>
                <ol className="interview-rounds">
                  {companyInfo.interviewProcess.rounds.map((round, index) => (
                    <li key={index}>{round}</li>
                  ))}
                </ol>
              </div>
            )}
            {companyInfo.interviewProcess.typicalDuration && (
              <div className="duration-info">
                <span className="duration-label">Typical Duration:</span>
                <span className="duration-value">{companyInfo.interviewProcess.typicalDuration}</span>
              </div>
            )}
            {companyInfo.interviewProcess.tips && (
              <div>
                <h4>Interview Tips</h4>
                <ul className="interview-tips">
                  {companyInfo.interviewProcess.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Last Updated */}
        {companyInfo.lastUpdated && (
          <div className="last-updated">
            <small>Last updated: {new Date(companyInfo.lastUpdated).toLocaleString()}</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`company-details-container ${showNavbar ? 'sidebar-visible' : ''}`}>
      <Navbar />
      <div className="main-content">
        <div className="company-card">
          <h1 className="company-header">Company Information</h1>
          
          {/* Wrap search section in a div with higher stacking context */}
          <div style={{ position: 'relative', zIndex: 99999 }}>
            <div className="search-section">
              <div className="search-input-container" ref={searchContainerRef}>
                <input
                  type="text"
                  value={companyName}
                  onChange={handleCompanyNameChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter company name"
                  className="search-input"
                  disabled={loading}
                  ref={inputRef}
                  onFocus={() => {
                    if (companyList.length > 0) {
                      setSearchResults(companyList.slice(0, 5));
                      setShowSearchResults(true);
                    }
                  }}
                />
                {showSearchResults && (
                  <div className="search-results-container" style={{
                    position: 'absolute',
                    top: inputRef.current ? inputRef.current.offsetHeight + 5 : 0,
                    left: 0,
                    width: inputRef.current ? inputRef.current.offsetWidth : 0,
                    zIndex: 999999
                  }}>
                    <div className="search-results" ref={searchResultsRef}>
                      {searchResults.length > 0 ? (
                        searchResults.map((company, index) => (
                          <div 
                            key={index} 
                            className="search-result-item"
                            onClick={() => handleSelectCompany(company)}
                          >
                            <span className="company-name">{company.name}</span>
                            {company.industry && company.industry !== "Unknown" ? (
                              <span className="company-industry">{company.industry}</span>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div className="no-results-found">
                          {isSearching ? 'Searching...' : 'No results found'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="search-button"
              >
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                onClick={handleClear}
                disabled={loading}
                className="clear-button"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Content below search has lower z-index */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Loading indicator */}
            {loading && (
              <div className="loading-container">
                <div className="loading-message">Loading company information...</div>
              </div>
            )}
            
            {/* Error message */}
            {error && !loading && (
              <div className="info-section error-container">
                <h2 className="error-heading">Error</h2>
                <p className="error-message">{error}</p>
                <p className="error-suggestion">
                  Please try a different company name or check your network connection.
                </p>
              </div>
            )}

            {/* Company information */}
            {!loading && !error && companyInfo && (
              <>
                {renderCompanyInfo()}
              </>
            )}
            
            {/* Default state when nothing is searched yet */}
            {!loading && !error && !companyInfo && (
              <div className="welcome-container">
                <h2>Welcome to Company Information Portal</h2>
                <p>Enter a company name above to view detailed information.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Logout button */}
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
}

export default CompanyInfo;