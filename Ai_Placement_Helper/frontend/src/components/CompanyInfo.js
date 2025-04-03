import React, { useState, useEffect, useContext, useRef } from "react";
import { JobContext } from "../context/JobContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import "./JobAnalyser.css"; // Base styles
import "./InterviewProcess.css"; // Specific styles last to take precedence
import companyData from "../data/companyData.json"; // Import the company data JSON file

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
  const [searchQuery, setSearchQuery] = useState('');
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
    
    // Load popular companies from the JSON file as well
    try {
      // First check if companyData has a 'companies' property, otherwise fall back to direct access
      const localData = companyData.companies ? companyData.companies : companyData;
      
      if (localData) {
        const topCompanies = Object.keys(localData)
          .slice(0, 20)
          .map(name => ({
            name,
            industry: localData[name].industry || '',
            location: localData[name].headquarters || ''
          }));
          
        // Combine with database companies, avoiding duplicates
        setCompanyList(prevList => {
          const newList = [...prevList];
          for (const company of topCompanies) {
            if (!newList.some(c => c.name.toLowerCase() === company.name.toLowerCase())) {
              newList.push(company);
            }
          }
          return newList;
        });
      }
    } catch (err) {
      console.error("Failed to load companies from JSON:", err);
    }
  }, []);

  // Function to fetch company information
  const fetchCompanyInfo = async (company) => {
    if (!company) return;
    
    setLoading(true);
    setError(null);
    setShowSearchResults(false);
    setCompanyInfo(null); // Clear previous data immediately
    
    try {
      // Check if we have this company in our local data first
      const normalizedCompanyName = company.toLowerCase().trim();
      
      // First check if companyData has a 'companies' property, otherwise fall back to direct access
      const localData = companyData.companies ? companyData.companies : companyData;
      
      if (localData && localData[normalizedCompanyName]) {
        // Use local data if available
        console.log(`Using local data for ${company}`);
        const localCompanyData = localData[normalizedCompanyName];
        
        // Add a minimum loading time to prevent UI flickering
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCompanyInfo({
          name: company,
          ...localCompanyData,
          source: "local database"
        });
        setError(null);
        setLoading(false);
        return;
      }
      
      // If not in local data, fetch from API
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
    setSearchQuery(query);
    
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
        // If API returns no results, try to find matches in our JSON data
        // First check if companyData has a 'companies' property, otherwise fall back to direct access
        const localData = companyData.companies ? companyData.companies : companyData;
        
        if (localData) {
          const jsonMatches = Object.keys(localData)
            .filter(name => name.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map(name => ({
              name,
              industry: localData[name].industry || '',
              location: localData[name].headquarters || ''
            }));
            
          if (jsonMatches.length > 0) {
            setSearchResults(jsonMatches);
            setShowSearchResults(true);
            return;
          }
        }
        
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
    // Make sure navbar is visible when we have job details
    if (jobDetails?.company) {
      setShowNavbar(true);
      setCompanyName(jobDetails.company);
      fetchCompanyInfo(jobDetails.company);
    } else {
      setShowNavbar(true); // Still show navbar on company info page
    }
  }, [jobDetails, setShowNavbar]);

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

  // Function to display about section with extended description if available
  const renderAboutSection = (companyInfo) => {
    if (!companyInfo.description && !companyInfo.about) return null;
    
    const aboutText = companyInfo.description || companyInfo.about;
    
    if (!aboutText) return null;
    
    return (
      <div className="info-section">
        <h2>About</h2>
        <p className="about-text">{aboutText}</p>
        
        {companyInfo.mission && (
          <div className="about-subsection">
            <h3>Mission</h3>
            <p>{companyInfo.mission}</p>
          </div>
        )}
        
        {companyInfo.vision && (
          <div className="about-subsection">
            <h3>Vision</h3>
            <p>{companyInfo.vision}</p>
          </div>
        )}
        
        {companyInfo.values && (
          <div className="about-subsection">
            <h3>Values</h3>
            {Array.isArray(companyInfo.values) ? (
              <ul className="values-list">
                {companyInfo.values.map((value, index) => (
                  <li key={index}>{value}</li>
                ))}
              </ul>
            ) : (
              <p>{companyInfo.values}</p>
            )}
          </div>
        )}
        
        {companyInfo.achievements || companyInfo.keyAchievements ? (
          <div className="about-subsection">
            <h3>Key Achievements</h3>
            {Array.isArray(companyInfo.achievements || companyInfo.keyAchievements) ? (
              <ul className="achievements-list">
                {(companyInfo.achievements || companyInfo.keyAchievements).map((achievement, index) => (
                  <li key={index} className="achievement-item">{achievement}</li>
                ))}
              </ul>
            ) : (
              <p>{companyInfo.achievements || companyInfo.keyAchievements}</p>
            )}
          </div>
        ) : null}
        
        {companyInfo.history && (
          <div className="about-subsection">
            <h3>History</h3>
            <p>{companyInfo.history}</p>
          </div>
        )}
      </div>
    );
  };

  // Function to render the career growth section
  const renderCareerGrowthSection = (companyInfo) => {
    if (!companyInfo.careerGrowth && !hasData(companyInfo.careerGrowth)) return null;
    
    return (
      <div className="info-section">
        <h2>Career Growth</h2>
        <div className="career-growth-details">
          {companyInfo.careerGrowth && Object.entries(companyInfo.careerGrowth).map(([key, value]) => {
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
    );
  };

  // Function to render the pros and cons section
  const renderProsAndCons = (companyInfo) => {
    if ((!companyInfo.pros || companyInfo.pros.length === 0) && 
        (!companyInfo.cons || companyInfo.cons.length === 0)) return null;
    
    return (
      <div className="info-section">
        <h2>Pros and Cons</h2>
        <div className="pros-cons-container">
          <div className="pros-section">
            <h3>Pros</h3>
            <ul className="pros-list">
              {companyInfo.pros && companyInfo.pros.map((pro, index) => (
                <li key={index} className="pro-item">
                  {pro}
                </li>
              ))}
              {(!companyInfo.pros || companyInfo.pros.length === 0) && (
                <li className="pro-item">
                  No specific pros listed
                </li>
              )}
            </ul>
          </div>
          <div className="cons-section">
            <h3>Cons</h3>
            <ul className="cons-list">
              {companyInfo.cons && companyInfo.cons.map((con, index) => (
                <li key={index} className="con-item">
                  {con}
                </li>
              ))}
              {(!companyInfo.cons || companyInfo.cons.length === 0) && (
                <li className="con-item">
                  No specific cons listed
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // Function to render the culture section
  const renderCultureSection = (companyInfo) => {
    if (!companyInfo.culture && !hasData(companyInfo.culture)) return null;
    
    return (
      <div className="info-section">
        <h2>Culture</h2>
        <div className="culture-details">
          {companyInfo.culture && typeof companyInfo.culture === 'string' ? (
            <p>{companyInfo.culture}</p>
          ) : companyInfo.culture && typeof companyInfo.culture === 'object' ? (
            Object.entries(companyInfo.culture).map(([key, value]) => (
              <div key={key} className="culture-item">
                <h3>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                {Array.isArray(value) ? (
                  <ul className="culture-list">
                    {value.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{value}</p>
                )}
              </div>
            ))
          ) : (
            <p>No specific culture information available.</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render the hiring process section
  const renderHiringProcessSection = (companyInfo) => {
    if (!companyInfo.hiringProcess && !hasData(companyInfo.hiringProcess)) return null;
    
    return (
      <div className="info-section">
        <h2>Hiring Process</h2>
        <div className="hiring-process-details">
          {companyInfo.hiringProcess && typeof companyInfo.hiringProcess === 'string' ? (
            <p>{companyInfo.hiringProcess}</p>
          ) : companyInfo.hiringProcess && typeof companyInfo.hiringProcess === 'object' ? (
            <>
              {companyInfo.hiringProcess.overview && (
                <div className="hiring-process-overview">
                  <p>{companyInfo.hiringProcess.overview}</p>
                </div>
              )}
              
              {companyInfo.hiringProcess.stages && companyInfo.hiringProcess.stages.length > 0 && (
                <div className="hiring-process-stages">
                  <h3>Stages</h3>
                  <ol className="stages-list">
                    {companyInfo.hiringProcess.stages.map((stage, index) => (
                      <li key={index} className="stage-item">
                        {typeof stage === 'string' ? (
                          stage
                        ) : (
                          <>
                            <strong>{stage.name}</strong>: {stage.description}
                            {stage.tips && stage.tips.length > 0 && (
                              <div className="stage-tips">
                                <h4>Tips for this stage:</h4>
                                <ul>
                                  {stage.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {companyInfo.hiringProcess.timeframe && (
                <div className="hiring-timeframe">
                  <h3>Typical Timeframe</h3>
                  <p>{companyInfo.hiringProcess.timeframe}</p>
                </div>
              )}
              
              {companyInfo.hiringProcess.tips && companyInfo.hiringProcess.tips.length > 0 && (
                <div className="hiring-tips">
                  <h3>General Tips</h3>
                  <ul>
                    {companyInfo.hiringProcess.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>No specific hiring process information available.</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render the required documents section
  const renderRequiredDocsSection = (companyInfo) => {
    if (!companyInfo.hiringProcess || 
        !companyInfo.hiringProcess.requiredDocuments || 
        companyInfo.hiringProcess.requiredDocuments.length === 0) {
      return null;
    }
    
    return (
      <div className="info-section">
        <h2>Required Documents</h2>
        <div className="required-docs-section">
          <ul className="required-docs-list">
            {companyInfo.hiringProcess.requiredDocuments.map((doc, index) => (
              <li key={index} className="required-doc-item">{doc}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // Function to render the interview process section
  const renderInterviewProcessSection = (companyInfo) => {
    if (!companyInfo.interviewProcess && !hasData(companyInfo.interviewProcess)) return null;
    
    return (
      <div className="info-section">
        <h2>Interview Process</h2>
        <div className="interview-process-details">
          {companyInfo.interviewProcess && typeof companyInfo.interviewProcess === 'string' ? (
            <p>{companyInfo.interviewProcess}</p>
          ) : companyInfo.interviewProcess && typeof companyInfo.interviewProcess === 'object' ? (
            <>
              {companyInfo.interviewProcess.overview && (
                <div className="interview-overview">
                  <p>{companyInfo.interviewProcess.overview}</p>
                </div>
              )}
              
              {companyInfo.interviewProcess.rounds && companyInfo.interviewProcess.rounds.length > 0 && (
                <div className="interview-rounds">
                  <h3>Interview Rounds</h3>
                  <ol className="rounds-list">
                    {companyInfo.interviewProcess.rounds.map((round, index) => (
                      <li key={index} className="round-item">
                        {typeof round === 'string' ? (
                          round
                        ) : (
                          <>
                            <strong>{round.name}</strong>: {round.description}
                            {round.tips && round.tips.length > 0 && (
                              <div className="round-tips">
                                <h4>Tips for this round:</h4>
                                <ul>
                                  {round.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex}>{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              
              {companyInfo.interviewProcess.commonQuestions && companyInfo.interviewProcess.commonQuestions.length > 0 && (
                <div className="common-questions">
                  <h3>Common Interview Questions</h3>
                  <ul>
                    {companyInfo.interviewProcess.commonQuestions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {companyInfo.interviewProcess.tips && companyInfo.interviewProcess.tips.length > 0 && (
                <div className="interview-tips">
                  <h3>Interview Tips</h3>
                  <ul>
                    {companyInfo.interviewProcess.tips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>No specific interview process information available.</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render the salary section
  const renderSalarySection = (companyInfo) => {
    if (!companyInfo.salary && !hasData(companyInfo.salary)) return null;
    
    return (
      <div className="info-section">
        <h2>Salary Information</h2>
        <div className="salary-details">
          {companyInfo.salary && typeof companyInfo.salary === 'string' ? (
            <p>{companyInfo.salary}</p>
          ) : companyInfo.salary && typeof companyInfo.salary === 'object' ? (
            <>
              {companyInfo.salary.overview && (
                <div className="salary-overview">
                  <p>{companyInfo.salary.overview}</p>
                </div>
              )}
              
              {companyInfo.salary.ranges && Object.keys(companyInfo.salary.ranges).length > 0 && (
                <div className="salary-ranges">
                  <h3>Salary Ranges by Position</h3>
                  <ul className="ranges-list">
                    {Object.entries(companyInfo.salary.ranges).map(([position, range]) => (
                      <li key={position} className="range-item">
                        <strong>{position}:</strong> {range}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {companyInfo.salary.factors && companyInfo.salary.factors.length > 0 && (
                <div className="salary-factors">
                  <h3>Factors Affecting Salary</h3>
                  <ul>
                    {companyInfo.salary.factors.map((factor, index) => (
                      <li key={index}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {companyInfo.salary.negotiationTips && companyInfo.salary.negotiationTips.length > 0 && (
                <div className="negotiation-tips">
                  <h3>Negotiation Tips</h3>
                  <ul>
                    {companyInfo.salary.negotiationTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p>No specific salary information available.</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render the benefits section
  const renderBenefitsSection = (companyInfo) => {
    if (!companyInfo.benefits && !hasData(companyInfo.benefits)) return null;
    
    return (
      <div className="info-section">
        <h2>Benefits</h2>
        <div className="benefits-details">
          {companyInfo.benefits && typeof companyInfo.benefits === 'string' ? (
            <p>{companyInfo.benefits}</p>
          ) : companyInfo.benefits && Array.isArray(companyInfo.benefits) ? (
            <ul className="benefits-list">
              {companyInfo.benefits.map((benefit, index) => (
                <li key={index} className="benefit-item">{benefit}</li>
              ))}
            </ul>
          ) : companyInfo.benefits && typeof companyInfo.benefits === 'object' ? (
            Object.entries(companyInfo.benefits).map(([category, items]) => (
              <div key={category} className="benefit-category">
                <h3>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h3>
                {Array.isArray(items) ? (
                  <ul className="benefit-items">
                    {items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{items}</p>
                )}
              </div>
            ))
          ) : (
            <p>No specific benefits information available.</p>
          )}
        </div>
      </div>
    );
  };

  // Function to render company basic info
  const renderBasicInfo = (companyInfo) => {
    if (!companyInfo) return null;

    const basicInfoItems = [
      { label: "Industry", value: companyInfo.industry },
      { label: "Founded", value: companyInfo.founded || companyInfo.foundingYear },
      { label: "Headquarters", value: companyInfo.headquarters },
      { label: "Company Size", value: companyInfo.companySize || companyInfo.size || companyInfo.employeeCount || companyInfo.employees },
      { label: "Revenue", value: companyInfo.revenue },
      { label: "CEO", value: companyInfo.ceo || companyInfo.leadership?.ceo },
      { label: "Stock Symbol", value: companyInfo.stockSymbol || companyInfo.financialInfo?.stockSymbol },
      { label: "Stock Exchange", value: companyInfo.stockExchange || companyInfo.financialInfo?.stockExchange },
      { label: "Market Cap", value: companyInfo.marketCap || companyInfo.financialInfo?.marketCap },
      { label: "Parent Company", value: companyInfo.parentCompany },
      { label: "Website", value: companyInfo.website, isLink: true },
      { label: "LinkedIn", value: companyInfo.linkedin, isLink: true },
    ].filter(item => item.value);

    if (basicInfoItems.length === 0) return null;

    return (
      <section className="info-section basic-info">
        <h2>Basic Information</h2>
        <div className="basic-info-grid">
          {basicInfoItems.map((item, index) => (
            <div key={index} className="info-item">
              <span className="info-label">{item.label}</span>
              {item.isLink ? (
                <a href={item.value.startsWith('http') ? item.value : `https://${item.value}`} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="info-link">
                  {item.value}
                </a>
              ) : (
                <span className="info-value">{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  };

  // Function to render reviews section
  const renderReviewsSection = (companyInfo) => {
    if (!companyInfo.reviews && !hasData(companyInfo.reviews)) return null;
    
    return (
      <div className="info-section">
        <h2>Employee Reviews</h2>
        <div className="reviews-container">
          {companyInfo.reviews && Array.isArray(companyInfo.reviews) ? (
            companyInfo.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <span className="review-rating">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </span>
                  <span className="review-position">{review.position}</span>
                  <span className="review-date">{review.date}</span>
                </div>
                <p className="review-content">{review.content}</p>
                {review.pros && (
                  <div className="review-pros">
                    <strong>Pros:</strong> {review.pros}
                  </div>
                )}
                {review.cons && (
                  <div className="review-cons">
                    <strong>Cons:</strong> {review.cons}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No employee reviews available at this time.</p>
          )}
        </div>
      </div>
    );
  };

  const renderOfficeLocations = (companyInfo) => {
    if (!companyInfo.officeLocations && !companyInfo.locations && !companyInfo.offices) return null;
    
    const locations = companyInfo.officeLocations || companyInfo.locations || companyInfo.offices;
    
    if (!locations || (Array.isArray(locations) && locations.length === 0)) return null;
    
    return (
      <div className="info-section">
        <h2>Office Locations</h2>
        <div className="locations-grid">
          {Array.isArray(locations) ? (
            locations.map((location, index) => (
              <div key={index} className="location-item">
                {typeof location === 'string' ? (
                  <span>{location}</span>
                ) : (
                  <div>
                    {location.city && <span className="location-city">{location.city}</span>}
                    {location.country && <span className="location-country">{location.country}</span>}
                    {location.address && <p className="location-address">{location.address}</p>}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>{locations}</p>
          )}
        </div>
      </div>
    );
  };

  const renderTechnologyStack = (companyInfo) => {
    if (!companyInfo.technologies && !companyInfo.technologyStack) return null;
    
    const technologies = companyInfo.technologies || companyInfo.technologyStack;
    
    if (!technologies || (Array.isArray(technologies) && technologies.length === 0)) return null;
    
    return (
      <div className="info-section">
        <h2>Technology Stack</h2>
        <div className="technologies-container">
          {Array.isArray(technologies) ? (
            technologies.map((tech, index) => (
              <div key={index} className="technology-tag">
                {tech}
              </div>
            ))
          ) : (
            <p>{technologies}</p>
          )}
        </div>
      </div>
    );
  };

  const renderProductsSection = (companyInfo) => {
    if (!companyInfo.products && !companyInfo.services && !companyInfo.productsAndServices) return null;
    
    const products = companyInfo.products || companyInfo.productsAndServices;
    const services = companyInfo.services;
    
    if ((!products || (Array.isArray(products) && products.length === 0)) && 
        (!services || (Array.isArray(services) && services.length === 0))) {
      return null;
    }
    
    return (
      <div className="info-section">
        <h2>Products & Services</h2>
        
        {products && (
          <div className="products-container">
            <h3>Products</h3>
            {Array.isArray(products) ? (
              <ul className="products-list">
                {products.map((product, index) => (
                  <li key={index} className="product-item">
                    {typeof product === 'string' ? product : (
                      <>
                        <strong>{product.name}</strong>
                        {product.description && <p>{product.description}</p>}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{products}</p>
            )}
          </div>
        )}
        
        {services && (
          <div className="services-container">
            <h3>Services</h3>
            {Array.isArray(services) ? (
              <ul className="services-list">
                {services.map((service, index) => (
                  <li key={index} className="service-item">
                    {typeof service === 'string' ? service : (
                      <>
                        <strong>{service.name}</strong>
                        {service.description && <p>{service.description}</p>}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{services}</p>
            )}
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
          
          <div className="search-section">
            <div className="search-input-container" ref={searchContainerRef}>
              <input
                type="text"
                value={companyName}
                onChange={handleCompanyNameChange}
                onKeyPress={handleKeyPress}
                placeholder="Company name"
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
                <div className="search-results" ref={searchResultsRef}>
                  {searchResults.length > 0 ? (
                    searchResults.map((company, index) => (
                      <div 
                        key={index} 
                        className="search-result-item"
                        onClick={() => handleSelectCompany(company)}
                      >
                        <span className="company-name">{company.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="no-results-found">
                      {isSearching ? 'Searching...' : 'No results'}
                    </div>
                  )}
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
              
              {/* Company sections in a logical order */}
              {renderBasicInfo(companyInfo)}
              {renderAboutSection(companyInfo)}
              {renderCultureSection(companyInfo)}
              {renderProsAndCons(companyInfo)}
              {renderBenefitsSection(companyInfo)}
              {renderSalarySection(companyInfo)}
              {renderCareerGrowthSection(companyInfo)}
              {renderRequiredDocsSection(companyInfo)}
              {renderHiringProcessSection(companyInfo)}
              {renderInterviewProcessSection(companyInfo)}
              {renderReviewsSection(companyInfo)}
              {renderOfficeLocations(companyInfo)}
              {renderTechnologyStack(companyInfo)}
              {renderProductsSection(companyInfo)}
              
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
            <div className="welcome-container">
              <h2>Welcome to Company Information Portal</h2>
              <p>Enter a company name above to view detailed information.</p>
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