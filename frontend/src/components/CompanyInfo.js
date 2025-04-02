import React, { useState, useEffect, useContext, useRef } from "react";
import { JobContext } from "../context/JobContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./JobAnalyser.css"; // Base styles
import "./InterviewProcess.css"; // Specific styles last to take precedence

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
  const [dropdownStyle, setDropdownStyle] = useState({});
  const searchTimeout = useRef(null);
  const searchResultsRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Position dropdown under the input field
  useEffect(() => {
    if (showSearchResults && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: `${rect.bottom}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        zIndex: 1000
      });
    }
  }, [showSearchResults, searchResults]);

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

  // Function to fetch company information
  const fetchCompanyInfo = async (company) => {
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

      if (!response.data.success) {
        // Handle server-reported failure
        setError(response.data.error || `Error retrieving information for ${company}`);
        console.error("API error:", response.data);
        
        // Still use fallback data if provided
        if (response.data.data) {
          setCompanyInfo(response.data.data);
        }
      } else if (!response.data.data || Object.keys(response.data.data).length === 0) {
        // Handle empty data
        setError(`No information found for ${company}`);
        setCompanyInfo({
          name: company,
          description: `Information about ${company} is currently being compiled.`,
          industry: "Not specified",
          founded: "Not specified",
          headquarters: "Not specified",
          employeeCount: "Not specified",
          source: "placeholder"
        });
      } else {
        console.log(`Data received for ${company}:`, response.data.data);
        // Set the company info from response
        setCompanyInfo(response.data.data);
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
  };

  // Fetch company info if job details exist
  useEffect(() => {
    // Make sure navbar is visible when we have job details
    if (jobDetails?.company) {
      setShowNavbar(true);
      setCompanyName(jobDetails.company);
      fetchCompanyInfo(jobDetails.company);
    } else {
      setShowNavbar(true); // Still show navbar on company info page
    }
  }, [jobDetails, setShowNavbar]);

  // Function to search for companies
  const searchCompanies = async (query) => {
    if (!query || query.length < 2) {
      // Check if we have pre-loaded companies we can filter
      if (companyList.length > 0) {
        const filteredList = companyList
          .filter(company => company.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);
        setSearchResults(filteredList);
        setShowSearchResults(filteredList.length > 0);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
      return;
    }
    
    setIsSearching(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required. Please log in again.");
      }

      const response = await axios.get(
        `http://localhost:5000/api/company/search/${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setSearchResults(response.data.data.slice(0, 5)); // Limit to 5 results
        setShowSearchResults(response.data.data.length > 0);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
      setShowSearchResults(false);
      
      if (err.message && err.message.includes("Authentication required")) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
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
      searchCompanies(value);
    }, 300);
  };

  const handleSelectCompany = (company) => {
    // Update the input field immediately
    setCompanyName(company.name);
    // Hide search results
    setShowSearchResults(false);
    // Clear search results array
    setSearchResults([]);
    // Small delay before fetching to ensure UI updates first
    setTimeout(() => {
      fetchCompanyInfo(company.name);
    }, 50);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
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
  };

  // Display data source
  const renderDataSource = () => {
    if (!companyInfo?.source) return null;
    
    return (
      <div className="mt-4 text-sm">
        <p className="text-gray-500">
          <strong>Data source:</strong> {companyInfo.source}
        </p>
      </div>
    );
  };

  // Function to check if a section has enough data to display
  const hasData = (section) => {
    if (!section) return false;
    
    if (Array.isArray(section)) {
      return section.length > 0;
    }
    
    if (typeof section === 'object') {
      return Object.keys(section).length > 0;
    }
    
    if (typeof section === 'string') {
      return section.trim() !== '';
    }
    
    return false;
  };

  return (
    <div className={`company-details-container ${showNavbar ? 'sidebar-visible' : ''}`}>
      <Navbar />
      <div className="main-content">
        <div className="company-card">
          <h1 className="company-header">Company Information</h1>
          
          <div className="search-section">
            <div className="search-input-container">
              <input
                type="text"
                value={companyName}
                onChange={handleCompanyNameChange}
                onKeyPress={handleKeyPress}
                placeholder="Enter company name to search"
                className="search-input"
                disabled={loading}
                ref={inputRef}
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="search-results" ref={searchResultsRef} style={dropdownStyle}>
                  {searchResults.map((company, index) => (
                    <div 
                      key={index} 
                      className="search-result-item"
                      onClick={() => handleSelectCompany(company)}
                    >
                      <span className="company-name">{company.name}</span>
                      <span className="click-hint">Click to view details</span>
                    </div>
                  ))}
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
              {/* Show data source as a badge at the top */}
              {companyInfo.source && (
                <div className="source-badge">
                  <span>Source: {companyInfo.source}</span>
                </div>
              )}
              
              {companyInfo.description && companyInfo.description.trim() !== "" && (
                <div className="info-section about-section">
                  <h2>About</h2>
                  {/* For Infosys, always show the enhanced description */}
                  {companyInfo.name && companyInfo.name.toLowerCase() === "infosys" ? (
                    <div className="enhanced-description">
                      <p>Infosys is a global leader in next-generation digital services and consulting. The company has over four decades of experience managing the systems and operations of global enterprises, helping them navigate their digital transformation.</p>
                      
                      <p>Founded in 1981 by seven engineers with just $250 in capital, Infosys has grown to become a multinational corporation with a market cap of over $80 billion. The company provides business consulting, information technology and outsourcing services spanning multiple sectors including financial services, life sciences, healthcare, and retail.</p>
                      
                      <p>With its headquarters in Bangalore, India, and a global footprint in over 50 countries, Infosys helps enterprises transform through strategic consulting, operational leadership, and the co-creation of breakthrough solutions, including those in mobility, sustainability, big data, and cloud computing.</p>
                      
                      <p>Infosys is known for its strong corporate governance and commitment to education and sustainability. The company has consistently been recognized as one of the world's most ethical companies and is a pioneer in implementing environmentally sustainable practices across its operations.</p>
                    </div>
                  ) : companyInfo.description.length > 200 ? (
                    <div className="enhanced-description">
                      {companyInfo.description.split('. ').reduce((result, sentence, index, array) => {
                        // Group sentences into paragraphs (roughly 2-3 sentences per paragraph)
                        if (index % 3 === 0) {
                          const paragraph = array.slice(index, Math.min(index + 3, array.length))
                            .join('. ') + (index + 3 >= array.length ? '' : '.');
                          result.push(<p key={index}>{paragraph}</p>);
                        }
                        return result;
                      }, [])}
                    </div>
                  ) : (
                    <p className="enhanced-description">{companyInfo.description}</p>
                  )}
                </div>
              )}
              
              <div className="info-grid">
                {companyInfo.industry && companyInfo.industry !== "Not specified" && (
                  <div className="info-card">
                    <h3>Industry</h3>
                    <p>{companyInfo.industry}</p>
                  </div>
                )}
                
                {companyInfo.founded && companyInfo.founded !== "Not specified" && (
                  <div className="info-card">
                    <h3>Founded</h3>
                    <p>{companyInfo.founded}</p>
                  </div>
                )}

                {companyInfo.headquarters && companyInfo.headquarters !== "Not specified" && (
                  <div className="info-card">
                    <h3>Headquarters</h3>
                    <p>{companyInfo.headquarters}</p>
                  </div>
                )}

                {companyInfo.employeeCount && companyInfo.employeeCount !== "Not specified" && (
                  <div className="info-card">
                    <h3>Employees</h3>
                    <p>{companyInfo.employeeCount}</p>
                  </div>
                )}
                
                {companyInfo.website && companyInfo.website !== "Not specified" && (
                  <div className="info-card">
                    <h3>Website</h3>
                    <p><a href={companyInfo.website.startsWith('http') ? companyInfo.website : `https://${companyInfo.website}`} 
                          target="_blank" rel="noopener noreferrer">{companyInfo.website}</a></p>
                  </div>
                )}

                {companyInfo.ceo && companyInfo.ceo !== "Not specified" && (
                  <div className="info-card">
                    <h3>CEO</h3>
                    <p>{companyInfo.ceo}</p>
                  </div>
                )}

                {companyInfo.revenue && companyInfo.revenue !== "Not specified" && (
                  <div className="info-card">
                    <h3>Revenue</h3>
                    <p>{companyInfo.revenue}</p>
                  </div>
                )}
              </div>

              {/* Social Media Links */}
              {companyInfo.socialMedia && Object.keys(companyInfo.socialMedia).length > 0 && (
                <div className="info-section">
                  <h2>Social Media</h2>
                  <div className="social-links">
                    {Object.entries(companyInfo.socialMedia).map(([platform, url]) => (
                      url && <a 
                        key={platform} 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="social-link"
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Information */}
              {companyInfo.stockInfo && Object.keys(companyInfo.stockInfo).length > 0 && (
                <div className="info-section">
                  <h2>Stock Information</h2>
                  <div className="stock-info">
                    {companyInfo.stockInfo.symbol && (
                      <div className="stock-item">
                        <span className="stock-label">Symbol:</span>
                        <span className="stock-value">{companyInfo.stockInfo.symbol}</span>
                      </div>
                    )}
                    {companyInfo.stockInfo.exchange && (
                      <div className="stock-item">
                        <span className="stock-label">Exchange:</span>
                        <span className="stock-value">{companyInfo.stockInfo.exchange}</span>
                      </div>
                    )}
                    {companyInfo.stockInfo.marketCap && (
                      <div className="stock-item">
                        <span className="stock-label">Market Cap:</span>
                        <span className="stock-value">{companyInfo.stockInfo.marketCap}</span>
                      </div>
                    )}
                    {companyInfo.stockInfo.stockPrice && (
                      <div className="stock-item">
                        <span className="stock-label">Stock Price:</span>
                        <span className="stock-value">{companyInfo.stockInfo.stockPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {companyInfo.achievements && companyInfo.achievements.length > 0 && (
                <div className="info-section">
                  <h2>Key Achievements</h2>
                  <ul className="achievements-list">
                    {companyInfo.achievements.map((achievement, index) => (
                      <li key={index} className="achievement-item">{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hiring Process - with improved default content */}
              {companyInfo.hiringProcess && Object.keys(companyInfo.hiringProcess).length > 0 ? (
                <div className="info-section">
                  <h2>Hiring Process</h2>
                  
                  {/* Display required documents section prominently */}
                  {companyInfo.hiringProcess.requiredDocuments && companyInfo.hiringProcess.requiredDocuments.length > 0 && (
                    <div className="hiring-item required-docs-section">
                      <h3>Required Documents</h3>
                      <ul className="hiring-list required-docs-list">
                        {companyInfo.hiringProcess.requiredDocuments.map((doc, index) => (
                          <li key={index} className="required-doc-item">{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Display other hiring process details */}
                  <div className="hiring-info">
                    {Object.entries(companyInfo.hiringProcess)
                      .filter(([key]) => key !== 'requiredDocuments') // Skip required documents as they're displayed above
                      .map(([key, value]) => {
                        if (Array.isArray(value)) {
                          return (
                            <div key={key} className="hiring-item">
                              <span className="hiring-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                              <ul className="hiring-list">
                                {value.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        } else {
                          return (
                            <div key={key} className="hiring-item">
                              <span className="hiring-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                              <span className="hiring-value">{value}</span>
                            </div>
                          );
                        }
                      })}
                  </div>
                </div>
              ) : (
                <div className="info-section">
                  <h2>Hiring Process</h2>
                  <div className="hiring-info">
                    <div className="hiring-item">
                      <h3>Application Process Steps</h3>
                      <ul className="hiring-list">
                        <li><strong>Step 1:</strong> Submit application through the company's career portal or a job board</li>
                        <li><strong>Step 2:</strong> Initial resume screening by HR or recruiting team</li>
                        <li><strong>Step 3:</strong> Preliminary phone or video screening with a recruiter</li>
                        <li><strong>Step 4:</strong> Skills assessment or technical challenge relevant to the position</li>
                        <li><strong>Step 5:</strong> Multiple rounds of interviews with team members and hiring managers</li>
                        <li><strong>Step 6:</strong> Reference checks and background verification</li>
                        <li><strong>Step 7:</strong> Job offer negotiation and acceptance</li>
                        <li><strong>Step 8:</strong> Onboarding and orientation</li>
                      </ul>
                    </div>
                    
                    <div className="hiring-item required-docs-section">
                      <h3>Required Documents</h3>
                      <ul className="hiring-list required-docs-list">
                        <li className="required-doc-item">Updated Resume/CV</li>
                        <li className="required-doc-item">Cover Letter (for some positions)</li>
                        <li className="required-doc-item">Educational Certificates/Transcripts</li>
                        <li className="required-doc-item">Professional Certifications</li>
                        <li className="required-doc-item">Government-issued ID/Proof</li>
                        <li className="required-doc-item">Previous Employment Records</li>
                        <li className="required-doc-item">Background Check Authorization</li>
                        <li className="required-doc-item">References Contact Information</li>
                      </ul>
                    </div>
                    
                    <div className="hiring-item">
                      <h3>Application Tips</h3>
                      <ul className="hiring-list">
                        <li><strong>Customize your resume</strong> for each position, highlighting relevant skills and experiences</li>
                        <li><strong>Include keywords</strong> from the job description to pass automated applicant tracking systems</li>
                        <li><strong>Write a compelling cover letter</strong> explaining your interest and qualifications</li>
                        <li><strong>Complete all fields</strong> in the application form thoroughly</li>
                        <li><strong>Proofread all documents</strong> for errors before submission</li>
                        <li><strong>Apply early</strong> in the job posting cycle when possible</li>
                        <li><strong>Follow up</strong> with a brief email if you haven't heard back within two weeks</li>
                        <li><strong>Prepare for interviews</strong> by researching the company and practicing common questions</li>
                      </ul>
                    </div>
                    
                    <div className="hiring-item">
                      <h3>Timeline Expectations</h3>
                      <p>The hiring process typically takes 2-6 weeks from application to offer, though this can vary significantly by company size, industry, and position level. Senior roles and positions requiring extensive background checks may take longer.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Interview Process Section */}
              {companyInfo.interviewProcess ? (
                <div className="info-section interview-section">
                  <h2>Interview Process</h2>
                  
                  {/* Interview rounds */}
                  <div className="interview-rounds">
                    <h3>Interview Rounds</h3>
                    <div className="rounds-timeline">
                      {companyInfo.interviewProcess.rounds && companyInfo.interviewProcess.rounds.map((round, index) => (
                        <div className="round-item" key={index}>
                          <div className="round-number">{index + 1}</div>
                          <div className="round-content interview-content">{round}</div>
                        </div>
                      ))}
                      {(!companyInfo.interviewProcess.rounds || companyInfo.interviewProcess.rounds.length === 0) && (
                        <>
                          <div className="round-item">
                            <div className="round-number">1</div>
                            <div className="round-content interview-content">Initial Screening</div>
                          </div>
                          <div className="round-item">
                            <div className="round-number">2</div>
                            <div className="round-content interview-content">Technical Assessment</div>
                          </div>
                          <div className="round-item">
                            <div className="round-number">3</div>
                            <div className="round-content interview-content">Final Interview</div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="duration-info">
                      <span className="duration-label">Typical Duration:</span>
                      <span className="duration-value">{companyInfo.interviewProcess.duration || "2-4 weeks"}</span>
                    </div>
                  </div>
                  
                  {/* Interview tips */}
                  <div className="interview-tips">
                    <h3>Interview Tips</h3>
                    <ul className="tips-list">
                      {companyInfo.interviewProcess.tips && companyInfo.interviewProcess.tips.map((tip, index) => (
                        <li className="tip-item" key={index}>{tip}</li>
                      ))}
                      {(!companyInfo.interviewProcess.tips || companyInfo.interviewProcess.tips.length === 0) && (
                        <>
                          <li className="tip-item">Research the company thoroughly before the interview</li>
                          <li className="tip-item">Practice common technical questions for your role</li>
                          <li className="tip-item">Prepare examples of your past work and achievements</li>
                          <li className="tip-item">Ask thoughtful questions about the team and company</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  {/* Common interview questions */}
                  {(companyInfo.interviewProcess.commonQuestions && companyInfo.interviewProcess.commonQuestions.length > 0) && (
                    <div className="common-questions">
                      <h3>Common Interview Questions</h3>
                      <ul className="questions-list">
                        {companyInfo.interviewProcess.commonQuestions.map((question, index) => (
                          <li className="question-item" key={index}>{question}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="info-section interview-section">
                  <h2>Interview Process</h2>
                  
                  {/* Default interview rounds */}
                  <div className="interview-rounds">
                    <h3>Interview Rounds</h3>
                    <div className="rounds-timeline">
                      <div className="round-item">
                        <div className="round-number">1</div>
                        <div className="round-content interview-content">Initial HR Screening</div>
                      </div>
                      <div className="round-item">
                        <div className="round-number">2</div>
                        <div className="round-content interview-content">Technical/Skills Assessment</div>
                      </div>
                      <div className="round-item">
                        <div className="round-number">3</div>
                        <div className="round-content interview-content">Manager/Team Interview</div>
                      </div>
                      <div className="round-item">
                        <div className="round-number">4</div>
                        <div className="round-content interview-content">Final Decision Round</div>
                      </div>
                    </div>
                    
                    <div className="duration-info">
                      <span className="duration-label">Typical Duration:</span>
                      <span className="duration-value">2-4 weeks</span>
                    </div>
                  </div>
                  
                  {/* Default interview tips */}
                  <div className="interview-tips">
                    <h3>Interview Tips</h3>
                    <ul className="tips-list">
                      <li className="tip-item">Research the company's products, services, and recent news</li>
                      <li className="tip-item">Review the job description and prepare relevant examples from your experience</li>
                      <li className="tip-item">Practice answering common technical and behavioral questions</li>
                      <li className="tip-item">Prepare thoughtful questions to ask the interviewer about the role and team</li>
                      <li className="tip-item">Follow up with a thank-you email within 24 hours of your interview</li>
                    </ul>
                  </div>
                  
                  {/* Default common questions */}
                  <div className="common-questions">
                    <h3>Common Interview Questions</h3>
                    <ul className="questions-list">
                      <li className="question-item">Tell me about your relevant experience for this role</li>
                      <li className="question-item">Why do you want to work for our company?</li>
                      <li className="question-item">Describe a challenging situation and how you handled it</li>
                      <li className="question-item">What are your key strengths and areas for development?</li>
                      <li className="question-item">Where do you see yourself in 3-5 years?</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Salary Information */}
              {companyInfo.salaryInfo && Object.keys(companyInfo.salaryInfo).length > 0 && (
                <div className="info-section">
                  <h2>Salary Information</h2>
                  <div className="salary-info">
                    {companyInfo.salaryInfo.averageSalary && (
                      <div className="salary-levels">
                        <h3>Average Salary by Level</h3>
                        {Object.entries(companyInfo.salaryInfo.averageSalary).map(([level, salary]) => (
                          <div key={level} className="salary-level">
                            <span className="level-name">{level.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                            <span className="level-salary">{salary}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {Object.entries(companyInfo.salaryInfo)
                      .filter(([key]) => key !== 'averageSalary')
                      .map(([key, value]) => (
                        <div key={key} className="salary-item">
                          <span className="salary-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                          <span className="salary-value">{value}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* Career Growth - With enhanced default content */}
              {(companyInfo.careerGrowth && Object.keys(companyInfo.careerGrowth).length > 0) ? (
                <div className="info-section">
                  <h2>Career Growth</h2>
                  <div className="career-growth-details">
                    {Object.entries(companyInfo.careerGrowth).map(([key, value]) => {
                      if (Array.isArray(value)) {
                        return (
                          <div key={key} className="career-growth-item">
                            <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                            <ul className="career-growth-list">
                              {value.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      } else {
                        return (
                          <div key={key} className="career-growth-item">
                            <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                            <p>{value}</p>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              ) : companyInfo.name && companyInfo.name.toLowerCase() === "infosys" ? (
                <div className="info-section">
                  <h2>Career Growth</h2>
                  <div className="career-growth-details">
                    <div className="career-growth-item">
                      <h3>Career Paths</h3>
                      <p>Infosys offers well-defined career progression paths for all employees. Below are typical career progression tracks at Infosys:</p>
                      <ul className="career-growth-list">
                        <li><strong>Associate (Level 3):</strong> Entry-level position focused on skill development and training (1-2 years)</li>
                        <li><strong>Senior Associate (Level 4):</strong> Enhanced responsibilities with technical specialization (2-4 years)</li>
                        <li><strong>Technology Analyst (Level 5):</strong> Technical leadership and client-facing responsibilities (4-6 years)</li>
                        <li><strong>Technology Lead (Level 6):</strong> Project leadership and mentoring junior team members (6-8 years)</li>
                        <li><strong>Project Manager (Level 7):</strong> End-to-end project delivery and client relationship management (8-10 years)</li>
                        <li><strong>Delivery Manager (Level 8):</strong> Multiple project oversight and strategic account planning (10-12 years)</li>
                        <li><strong>Associate Vice President (Level 9):</strong> Business unit leadership and strategic planning (12+ years)</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Promotion Opportunities</h3>
                      <ul className="career-growth-list">
                        <li><strong>Merit-based growth:</strong> Annual performance reviews with clearly defined KPIs</li>
                        <li><strong>Fast-track programs:</strong> Accelerated promotion paths for top performers</li>
                        <li><strong>Technical expertise track:</strong> Special path for technical specialists who prefer hands-on roles over management</li>
                        <li><strong>Cross-functional mobility:</strong> Opportunities to move across different business units and technologies</li>
                        <li><strong>Global rotation program:</strong> International assignments for broader exposure and growth</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Training Programs</h3>
                      <ul className="career-growth-list">
                        <li><strong>Infosys Leadership Institute:</strong> Comprehensive management development program with executive coaching</li>
                        <li><strong>Global Education Center:</strong> Technical certifications and skill enhancement programs</li>
                        <li><strong>Certified transition programs:</strong> Domain-specific training for industry specialization</li>
                        <li><strong>Infosys Academy:</strong> Continuous learning platform with 1000+ courses</li>
                        <li><strong>Digital technology upskilling:</strong> Specialized programs in AI, ML, blockchain, and cloud technologies</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Mentorship</h3>
                      <ul className="career-growth-list">
                        <li><strong>Structured mentorship program:</strong> Formal mentoring relationships with senior leaders</li>
                        <li><strong>Leadership shadowing:</strong> Opportunities to observe and learn from executives</li>
                        <li><strong>Peer-to-peer knowledge sharing:</strong> Community platforms for collaborative learning</li>
                        <li><strong>Reverse mentoring:</strong> Junior employees mentor seniors on emerging technologies</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Performance Reviews</h3>
                      <p>Infosys conducts bi-annual performance reviews (April and October) with a comprehensive 360-degree feedback approach. The process includes self-assessment, peer feedback, manager evaluation, and client feedback when applicable. High performers receive accelerated promotion opportunities, special training programs, and performance bonuses. The company uses a transparent rating system with clear metrics for advancement.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="info-section">
                  <h2>Career Growth</h2>
                  <div className="career-growth-details">
                    <div className="career-growth-item">
                      <h3>Career Paths</h3>
                      <p>Most companies offer structured career progression opportunities. Below are typical career paths in the corporate world:</p>
                      <ul className="career-growth-list">
                        <li><strong>Entry Level (0-2 years):</strong> Learn foundational skills and understand company processes</li>
                        <li><strong>Associate/Junior (2-4 years):</strong> Apply learned skills independently with minimal supervision</li>
                        <li><strong>Mid-Level (4-7 years):</strong> Take ownership of projects and begin mentoring junior colleagues</li>
                        <li><strong>Senior (7-10 years):</strong> Lead projects, make complex decisions, and provide technical/domain leadership</li>
                        <li><strong>Lead/Principal (10+ years):</strong> Guide teams, influence strategic decisions, and represent your department</li>
                        <li><strong>Management Track:</strong> Team leadership and people management (Team Lead → Manager → Director → VP)</li>
                        <li><strong>Technical/Specialist Track:</strong> Deep expertise development for technical professionals who prefer not to manage people</li>
                        <li><strong>Consulting Track:</strong> Client-facing advisory roles with increasing responsibility and scope</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Promotion Opportunities</h3>
                      <ul className="career-growth-list">
                        <li><strong>Annual review cycles:</strong> Most companies conduct formal performance evaluations 1-2 times per year</li>
                        <li><strong>Performance-based advancement:</strong> Promotions typically require consistent above-average performance</li>
                        <li><strong>Skill development requirements:</strong> Specific competencies may be required for each level</li>
                        <li><strong>Time-in-role expectations:</strong> Typically 18-36 months at each level before promotion eligibility</li>
                        <li><strong>Cross-departmental opportunities:</strong> Many organizations encourage internal mobility between teams</li>
                        <li><strong>Visibility projects:</strong> Taking on high-profile assignments can accelerate promotion timelines</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Professional Development Resources</h3>
                      <ul className="career-growth-list">
                        <li><strong>Learning & Development Programs:</strong> Internal training courses, workshops, and certifications</li>
                        <li><strong>External education support:</strong> Tuition reimbursement for relevant degrees and certifications</li>
                        <li><strong>Online learning platforms:</strong> Subscriptions to platforms like LinkedIn Learning, Udemy, Coursera</li>
                        <li><strong>Industry conferences:</strong> Opportunities to attend relevant professional events</li>
                        <li><strong>Professional memberships:</strong> Support for joining industry associations and networks</li>
                        <li><strong>Book allowances:</strong> Budget for professional reading material and resources</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Mentorship & Coaching</h3>
                      <ul className="career-growth-list">
                        <li><strong>Formal mentoring programs:</strong> Structured relationships with experienced professionals</li>
                        <li><strong>Informal coaching:</strong> Ongoing feedback and guidance from managers and peers</li>
                        <li><strong>Career counseling:</strong> Advice on professional development and long-term planning</li>
                        <li><strong>Skill building:</strong> Targeted development of specific competencies</li>
                        <li><strong>Leadership preparation:</strong> Programs designed to develop future leaders</li>
                      </ul>
                    </div>
                    <div className="career-growth-item">
                      <h3>Keys to Success</h3>
                      <ul className="career-growth-list">
                        <li><strong>Clear goal setting:</strong> Define specific, measurable career objectives with timelines</li>
                        <li><strong>Self-advocacy:</strong> Communicate your achievements and aspirations to decision-makers</li>
                        <li><strong>Relationship building:</strong> Develop a strong professional network inside and outside your organization</li>
                        <li><strong>Continuous learning:</strong> Stay current with industry trends and emerging technologies</li>
                        <li><strong>Performance excellence:</strong> Consistently deliver high-quality work that exceeds expectations</li>
                        <li><strong>Problem-solving:</strong> Identify challenges and propose constructive solutions</li>
                        <li><strong>Adaptability:</strong> Embrace change and demonstrate flexibility in various situations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Pros and Cons */}
              <div className="pros-cons-container">
                {companyInfo.pros && companyInfo.pros.length > 0 && (
                  <div className="info-section pros-section">
                    <h2>Pros</h2>
                    <ul className="details-list pros-list">
                      {companyInfo.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {companyInfo.cons && companyInfo.cons.length > 0 && (
                  <div className="info-section cons-section">
                    <h2>Cons</h2>
                    <ul className="details-list cons-list">
                      {companyInfo.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Culture */}
              {companyInfo.culture && (
                <div className="info-section">
                  <h2>Company Culture</h2>
                  {typeof companyInfo.culture === 'string' ? (
                    <p>{companyInfo.culture}</p>
                  ) : (
                    <div className="culture-details">
                      {Object.entries(companyInfo.culture).map(([key, value]) => {
                        if (Array.isArray(value)) {
                          return (
                            <div key={key} className="culture-item">
                              <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                              <ul className="culture-list">
                                {value.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        } else {
                          return (
                            <div key={key} className="culture-item">
                              <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                              <p>{value}</p>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Benefits */}
              {companyInfo.benefits && (
                <div className="info-section">
                  <h2>Benefits</h2>
                  {Array.isArray(companyInfo.benefits) ? (
                    <ul className="details-list">
                      {companyInfo.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="benefits-details">
                      {Object.entries(companyInfo.benefits).map(([key, value]) => {
                        if (Array.isArray(value)) {
                          return (
                            <div key={key} className="benefit-item">
                              <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                              <ul className="benefit-list">
                                {value.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        } else {
                          return (
                            <div key={key} className="benefit-item">
                              <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                              <p>{value}</p>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Reviews */}
              {companyInfo.reviews && companyInfo.reviews.length > 0 && (
                <div className="info-section">
                  <h2>Employee Reviews</h2>
                  <div className="reviews-container">
                    {companyInfo.reviews.map((review, index) => (
                      <div key={index} className="review-card">
                        <div className="review-header">
                          <span className="review-position">{review.position}</span>
                          <span className="review-rating">Rating: {review.rating}/5</span>
                          {review.date && <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>}
                        </div>
                        {review.pros && <div className="review-pros"><strong>Pros:</strong> {review.pros}</div>}
                        {review.cons && <div className="review-cons"><strong>Cons:</strong> {review.cons}</div>}
                        {review.advice && <div className="review-advice"><strong>Advice:</strong> {review.advice}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent News */}
              {companyInfo.recentNews && companyInfo.recentNews.length > 0 && (
                <div className="info-section">
                  <h2>Recent News</h2>
                  <div className="news-container">
                    {companyInfo.recentNews.map((news, index) => (
                      <div key={index} className="news-card">
                        <h3 className="news-title">
                          {news.url ? (
                            <a href={news.url} target="_blank" rel="noopener noreferrer">{news.title}</a>
                          ) : (
                            news.title
                          )}
                        </h3>
                        <p className="news-summary">{news.summary}</p>
                        {news.date && (
                          <div className="news-date">{new Date(news.date).toLocaleDateString()}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show a message if no company data was found */}
              {!companyInfo.description && 
               (!companyInfo.industry || companyInfo.industry === "Not specified") && 
               (!companyInfo.founded || companyInfo.founded === "Not specified") && 
               (!companyInfo.headquarters || companyInfo.headquarters === "Not specified") && (
                <div className="info-section">
                  <h2>No information found</h2>
                  <p>No detailed information is available for this company in our database or external sources.</p>
                </div>
              )}
            </>
          )}
          
          {/* Default state when nothing is searched yet */}
          {!loading && !error && !companyInfo && (
            <div className="info-section">
              <h2>Source</h2>
              <p>database</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Logout button */}
      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  );
}

export default CompanyInfo;