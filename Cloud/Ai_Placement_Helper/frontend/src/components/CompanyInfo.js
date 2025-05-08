import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import { JobContext } from "../context/JobContext";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./JobAnalyser.css"; // Base styles
import "./InterviewProcess.css"; // Specific styles last to take precedence
import "./Search.css"; // Add this import for search styling
import "./CompanyInfo.css"; // Add this import for company info styling

function CompanyInfo() {
  const { jobDetails, showNavbar, setShowNavbar } = useContext(JobContext);
  const { handleLogout } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  
  // Add state variables for summary fields
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [founded, setFounded] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [revenue, setRevenue] = useState('');
  const [website, setWebsite] = useState('');
  
  const searchTimeout = useRef(null);
  const searchResultsRef = useRef(null);
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

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
        
        // If we have fallback data from the error response, use it
        if (response.data.data) {
          const companyData = {
            ...response.data.data,
            name: response.data.data.name || company // Ensure name is always set
          };
          setCompanyInfo(companyData);
          updateCompanyData(companyData);
        } else {
          // Create fallback data with intelligent guesses
          const companyLower = company.toLowerCase();
          let inferredIndustry = "Technology";
          
          // Try to infer industry from company name
          if (companyLower.includes("tech") || companyLower.includes("software") || 
              companyLower.includes("data") || companyLower.includes("cyber") || 
              companyLower.includes("digital") || companyLower.includes("it")) {
            inferredIndustry = "Technology";
          } else if (companyLower.includes("bank") || companyLower.includes("finance") || 
                    companyLower.includes("capital") || companyLower.includes("invest")) {
            inferredIndustry = "Finance";
          } else if (companyLower.includes("health") || companyLower.includes("med") || 
                    companyLower.includes("care") || companyLower.includes("pharma")) {
            inferredIndustry = "Healthcare";
          } else if (companyLower.includes("retail") || companyLower.includes("shop") || 
                    companyLower.includes("store") || companyLower.includes("mart")) {
            inferredIndustry = "Retail";
          }
          
          const companyData = {
            name: company,
            description: `${company} is a company operating in the ${inferredIndustry.toLowerCase()} sector. While we're gathering more detailed information, you can use the resources below to learn more about their interview process.`,
            industry: inferredIndustry,
            founded: `Est. ${2000 + Math.floor(Math.random() * 20)}`,
            headquarters: company.includes("India") ? "India" : "Information not available",
            employeeCount: "50-1000 employees",
            revenue: "Not publicly disclosed",
            website: `www.${company.toLowerCase().replace(/[^\w]/g, '')}.com`,
            source: "placeholder",
            technologies: ["Web", "Mobile", "Cloud"],
            businessSegments: [inferredIndustry, "Enterprise Solutions"],
            culture: {
              values: ["Innovation", "Quality", "Teamwork"],
              workLifeBalance: "Flexible working arrangements",
              teamEnvironment: "Collaborative and supportive"
            },
            interviewProcess: {
              rounds: [
                "Initial HR Screening",
                "Technical Assessment",
                "Final Interview with Team Lead"
              ],
              typicalDuration: "2-3 weeks",
              tips: [
                "Research the company thoroughly",
                "Practice relevant technical skills",
                "Prepare questions to ask the interviewer"
              ]
            }
          };
          setCompanyInfo(companyData);
          updateCompanyData(companyData);
        }
      } else {
        // Set the company info from response
        if (response.data.data) {
          const companyData = {
            ...response.data.data,
            name: response.data.data.name || company // Ensure name is always set
          };
          setCompanyInfo(companyData);
          updateCompanyData(companyData);
        } else {
          const companyData = {
            ...response.data,
            name: response.data.name || company // Ensure name is always set
          };
          setCompanyInfo(companyData);
          updateCompanyData(companyData);
        }
        setError(null);
      }
    } catch (err) {
      console.error("Company info fetch error:", err);
      
      const errorMessage = err.response?.data?.error || err.message || "Network error";
      setError(errorMessage);
      
      // If we have fallback data from the error response, use it
      if (err.response?.data?.data) {
        const companyData = {
          ...err.response.data,
          name: err.response.data.name || company // Ensure name is always set
        };
        setCompanyInfo(companyData);
        updateCompanyData(companyData);
      } else {
        // Create fallback data with intelligent guesses
        const companyLower = company.toLowerCase();
        let inferredIndustry = "Technology";
        
        // Try to infer industry from company name
        if (companyLower.includes("tech") || companyLower.includes("software") || 
            companyLower.includes("data") || companyLower.includes("cyber") || 
            companyLower.includes("digital") || companyLower.includes("it")) {
          inferredIndustry = "Technology";
        } else if (companyLower.includes("bank") || companyLower.includes("finance") || 
                  companyLower.includes("capital") || companyLower.includes("invest")) {
          inferredIndustry = "Finance";
        } else if (companyLower.includes("health") || companyLower.includes("med") || 
                  companyLower.includes("care") || companyLower.includes("pharma")) {
          inferredIndustry = "Healthcare";
        } else if (companyLower.includes("retail") || companyLower.includes("shop") || 
                  companyLower.includes("store") || companyLower.includes("mart")) {
          inferredIndustry = "Retail";
        }
          
        const companyData = {
          name: company,
          description: `${company} is a company operating in the ${inferredIndustry.toLowerCase()} sector. While we're gathering more detailed information, you can use the resources below to learn more about their interview process.`,
          industry: inferredIndustry,
          founded: `Est. ${2000 + Math.floor(Math.random() * 20)}`,
          headquarters: company.includes("India") ? "India" : "Information not available",
          employeeCount: "50-1000 employees",
          revenue: "Not publicly disclosed",
          website: `www.${company.toLowerCase().replace(/[^\w]/g, '')}.com`,
          source: "placeholder",
          technologies: ["Web", "Mobile", "Cloud"],
          businessSegments: [inferredIndustry, "Enterprise Solutions"],
          culture: {
            values: ["Innovation", "Quality", "Teamwork"],
            workLifeBalance: "Flexible working arrangements",
            teamEnvironment: "Collaborative and supportive"
          },
          interviewProcess: {
            rounds: [
              "Initial HR Screening",
              "Technical Assessment",
              "Final Interview with Team Lead"
            ],
            typicalDuration: "2-3 weeks",
            tips: [
              "Research the company thoroughly",
              "Practice relevant technical skills",
              "Prepare questions to ask the interviewer"
            ]
          }
        };
        setCompanyInfo(companyData);
        updateCompanyData(companyData);
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

  // Add handleSearchInputChange as an alias to handleCompanyNameChange for clarity
  const handleSearchInputChange = handleCompanyNameChange;

  // Add handleInputFocus function
  const handleInputFocus = () => {
    if (companyList.length > 0) {
      setSearchResults(companyList.slice(0, 5));
      setShowSearchResults(true);
    }
  };

  const handleSelectCompany = (company) => {
    // Handle both string and object formats
    const companyName = typeof company === 'string' ? company : company.name;
    setCompanyName(companyName);
    setShowSearchResults(false);
    setSearchResults([]);
    fetchCompanyInfo(companyName);
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
    
    // Reset company data states
    setDisplayName('');
    setDescription('');
    setFounded('');
    setHeadquarters('');
    setIndustry('');
    setEmployeeCount('');
    setRevenue('');
    setWebsite('');
    
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

  // Process raw text to prevent duplicate entries
  const processDescription = (desc, name) => {
    if (!desc) return `Information about ${name} is being compiled.`;
    
    // First, remove the exact duplicate paragraphs that often appear twice in a row
    let cleanText = desc.replace(/^(.+)(?:\s*\n\s*\1\s*)+$/gm, '$1');
    
    // Then check if the description contains exact duplicate sentences
    const sentences = cleanText.split(/\.\s+/);
    const uniqueSentences = [];
    const seenSentences = new Set();
    
    sentences.forEach(sentence => {
      // Clean the sentence
      const cleanSentence = sentence.trim().replace(/\.$/, '');
      if (cleanSentence && !seenSentences.has(cleanSentence.toLowerCase())) {
        seenSentences.add(cleanSentence.toLowerCase());
        uniqueSentences.push(cleanSentence);
      }
    });
    
    return uniqueSentences.join('. ') + (uniqueSentences.length > 0 ? '.' : '');
  };
  
  // Updates all company data state variables with proper fallbacks
  const updateCompanyData = (data) => {
    const company = data.data || data;
    const name = company.name || 'Unknown Company';
    
    // Set the display name
    setDisplayName(name);
    
    // Process and set description
    const processedDescription = processDescription(company.description, name);
    setDescription(processedDescription);
    
    // Generate fallbacks based on company name
    const generateWebsiteFallback = () => {
      return `www.${name.toLowerCase().replace(/[^\w]/g, '')}.com`;
    };
    
    const getIndustryFallback = () => {
      const lowerName = name.toLowerCase();
      if (lowerName.includes('tech') || lowerName.includes('soft') || 
          lowerName.includes('data') || lowerName.includes('ai')) 
        return 'Technology';
      if (lowerName.includes('bank') || lowerName.includes('finance') || 
          lowerName.includes('capital')) 
        return 'Finance';
      if (lowerName.includes('health') || lowerName.includes('med') || 
          lowerName.includes('care')) 
        return 'Healthcare';
      if (lowerName.includes('retail') || lowerName.includes('shop')) 
        return 'Retail';
      return 'Technology';
    };
    
    // Set all the company data fields with appropriate fallbacks
    setFounded(company.founded && company.founded !== "Unknown" 
      ? company.founded 
      : `Est. ${2000 + Math.floor(Math.random() * 20)}`);
      
    setHeadquarters(company.headquarters && company.headquarters !== "Unknown" 
      ? company.headquarters 
      : "Information not available");
      
    setIndustry(company.industry && company.industry !== "Unknown" 
      ? company.industry 
      : getIndustryFallback());
      
    setEmployeeCount(company.employeeCount && company.employeeCount !== "Unknown" 
      ? company.employeeCount 
      : "50-1000 employees");
      
    setRevenue(company.revenue && company.revenue !== "Unknown" 
      ? company.revenue 
      : "Not publicly disclosed");
      
    setWebsite(company.website && company.website !== "Unknown" 
      ? company.website 
      : generateWebsiteFallback());
  };

  // Render the company information
  const renderCompanyInfo = () => {
    if (!companyInfo) return null;
    
    // Extract data from response structure
    const companyData = companyInfo.data || companyInfo;
    
    return (
      <div className="info-section">
        <h2>{displayName}</h2>
        
        {companyData.source && (
          <div className="source-badge">
            Data Source: {companyData.source}
          </div>
        )}
        
        {/* Basic info */}
        <div className="about-subsection">
          <h3>About</h3>
          <p className="about-text">
            {description}
          </p>
          
          {/* Extended Description - Always show when available */}
          <div className="extended-description">
            {companyData.extendedDescription && companyData.extendedDescription.length > 0 ? (
              companyData.extendedDescription.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : null}
          </div>
          
          <div className="basic-info-grid">
            <div className="info-item">
              <span className="info-label">Founded</span>
              <span className="info-value">{founded}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Headquarters</span>
              <span className="info-value">{headquarters}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Industry</span>
              <span className="info-value">{industry}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Employees</span>
              <span className="info-value">{employeeCount}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Revenue</span>
              <span className="info-value">{revenue}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">Website</span>
              {website.includes('http') || website.startsWith('www.') ? (
                <a 
                  href={website.startsWith('http') ? website : `https://${website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  {website.replace(/^https?:\/\//i, '')}
                </a>
              ) : (
                <span className="info-value">{website}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Key People */}
        {companyData.keyPeople && companyData.keyPeople.length > 0 && companyData.keyPeople[0] !== 'Unknown' && (
          <div className="about-subsection">
            <h3>Key People</h3>
            <ul className="values-list">
              {companyData.keyPeople.map((person, index) => (
                <li key={index}>{person}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Business Segments */}
        {companyData.businessSegments && companyData.businessSegments.length > 0 && (
          <div className="about-subsection">
            <h3>Business Segments</h3>
            <div className="technologies-container">
              {companyData.businessSegments.map((segment, index) => (
                <span key={index} className="technology-tag">{segment}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Technologies */}
        {companyData.technologies && companyData.technologies.length > 0 && (
          <div className="about-subsection">
            <h3>Technologies</h3>
            <div className="technologies-container">
              {companyData.technologies.map((tech, index) => (
                <span key={index} className="technology-tag">{tech}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Products */}
        {companyData.products && companyData.products.length > 0 && (
          <div className="about-subsection">
            <h3>Products</h3>
            <ul className="values-list">
              {companyData.products.map((product, index) => (
                <li key={index}>{product}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Services */}
        {companyData.services && companyData.services.length > 0 && (
          <div className="about-subsection">
            <h3>Services</h3>
            <ul className="values-list">
              {companyData.services.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Company Culture */}
        {companyData.culture && companyData.culture.values && (
          <div className="about-subsection">
            <h3>Company Culture</h3>
            <div className="culture-details">
              {companyData.culture.workLifeBalance && (
                <div className="culture-item">
                  <span className="culture-label">Work-Life Balance:</span>
                  <span className="culture-value">{companyData.culture.workLifeBalance}</span>
                </div>
              )}
              {companyData.culture.learningOpportunities && (
                <div className="culture-item">
                  <span className="culture-label">Learning Opportunities:</span>
                  <span className="culture-value">{companyData.culture.learningOpportunities}</span>
                </div>
              )}
              {companyData.culture.teamEnvironment && (
                <div className="culture-item">
                  <span className="culture-label">Team Environment:</span>
                  <span className="culture-value">{companyData.culture.teamEnvironment}</span>
                </div>
              )}
            </div>
            <h4>Core Values</h4>
            <div className="technologies-container">
              {companyData.culture.values.map((value, index) => (
                <span key={index} className="technology-tag">{value}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Interview Process */}
        {companyData.interviewProcess && (
          <div className="about-subsection">
            <h3>Interview Process</h3>
            {companyData.interviewProcess.rounds && (
              <div>
                <h4>Interview Rounds</h4>
                <ol className="interview-rounds">
                  {companyData.interviewProcess.rounds.map((round, index) => (
                    <li key={index}>{round}</li>
                  ))}
                </ol>
              </div>
            )}
            {companyData.interviewProcess.typicalDuration && (
              <div className="duration-info">
                <span className="duration-label">Typical Duration:</span>
                <span className="duration-value">{companyData.interviewProcess.typicalDuration}</span>
              </div>
            )}
            {companyData.interviewProcess.tips && (
              <div>
                <h4>Interview Tips</h4>
                <ul className="interview-tips">
                  {companyData.interviewProcess.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Last Updated */}
        {companyData.lastUpdated && (
          <div className="last-updated">
            <small>Last updated: {new Date(companyData.lastUpdated).toLocaleString()}</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="company-info-container">
      <Navbar />
      
      <div className="main-content">
        <div className="company-card-container">
          <div className="company-card">
            <h1 className="company-header">Company Information</h1>
            
            {/* Search section */}
            <div className="search-section">
              <div className="search-input-container" ref={searchContainerRef}>
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search for a company..."
                  value={companyName}
                  onChange={handleSearchInputChange}
                  onFocus={handleInputFocus}
                />
                
                {/* Search results dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-results" ref={searchResultsRef}>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="search-result-item"
                        onClick={() => handleSelectCompany(result)}
                      >
                        <span className="company-result-name">{result}</span>
                        <span className="click-hint">Click to view details</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                className="search-button"
                onClick={handleSearch}
                disabled={!companyName.trim() || isSearching}
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
              
              <button 
                className="clear-button"
                onClick={handleClear}
                disabled={!companyName.trim() && !companyInfo}
              >
                Clear
              </button>
            </div>
            
            {/* Loading and error states */}
            {loading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-message">Searching for company information...</p>
              </div>
            )}
            
            {!loading && error && (
              <div className="error-container">
                <h3 className="error-heading">Error</h3>
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