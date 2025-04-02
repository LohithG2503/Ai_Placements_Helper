import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { JobProvider } from "./context/JobContext";
import LoginPage from "./components/LoginPage";
import HeroPage from "./components/HeroPage";
import JobAnalyser from "./components/JobAnalyser";
import CompanyInfo from "./components/CompanyInfo";
import PastInterviews from "./components/PastInterviews";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);

    // Apply body style directly to ensure no white space
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.background = "#0A1128";
    document.documentElement.style.margin = "0";
    document.documentElement.style.padding = "0";
    document.documentElement.style.background = "#0A1128";
  }, []);

  const handleLogin = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  return (
    <JobProvider>
      <Router>
        <div className="app-container">
          <Routes>
            <Route
              path="/"
              element={isAuthenticated ? <HeroPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={<LoginPage onLogin={handleLogin} />}
            />
            
            {isAuthenticated && (
              <>
                <Route path="/job-analyser" element={<JobAnalyser />} />
                <Route path="/company-info" element={<CompanyInfo />} />
                <Route path="/past-interviews" element={<PastInterviews />} />
              </>
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </JobProvider>
  );
}

export default App;
