import React, { useState, useEffect } from 'react';
import './YoutubeIntegration.css';
import { searchVideos } from '../lib/youtube-api';
import VideoCard from './VideoCard';
import { BiError } from 'react-icons/bi';
import { useToast } from '../hooks/use-toast';

const YouTubeIntegration = ({ companyName, jobTitle }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  // Format text for display (capitalize words)
  const formatDisplayText = (text) => {
    if (!text) return '';
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Normalize text for searching
  const normalizeText = (text) => {
    if (!text) return '';
    // Remove special characters but keep spaces
    return text.replace(/[^\w\s]/gi, '').trim();
  };

  // Simple logging for debugging
  const logWithTimestamp = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
  };

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError('');

      const normalizedCompany = normalizeText(companyName);
      const normalizedJobTitle = normalizeText(jobTitle);
      
      // Check if we have enough data to search
      if (!normalizedCompany && !normalizedJobTitle) {
        setError('No company or job title provided. Please enter job details first.');
        setLoading(false);
        return;
      }

      let query = '';
      // Construct search query based on available data
      if (normalizedCompany && normalizedJobTitle) {
        query = `${normalizedCompany} ${normalizedJobTitle} interview experience`;
        setSearchQuery(`${formatDisplayText(normalizedCompany)} - ${formatDisplayText(normalizedJobTitle)}`);
      } else if (normalizedCompany) {
        query = `${normalizedCompany} interview experience`;
        setSearchQuery(formatDisplayText(normalizedCompany));
      } else {
        query = `${normalizedJobTitle} interview experience`;
        setSearchQuery(formatDisplayText(normalizedJobTitle));
      }
      
      try {
        logWithTimestamp(`Searching for videos: ${query}`);
        const data = await searchVideos(query, 6);
        
        if (data.items && data.items.length > 0) {
          setVideos(data.items);
          showToast(`Found ${data.items.length} interview videos`, "success");
        } else {
          setError('No interview videos found. Try searching with more specific job details.');
          showToast('No interview videos found', "info");
        }
      } catch (err) {
        console.error('Error fetching YouTube videos:', err);
        setError('Failed to load interview videos. Please try again later.');
        showToast(`Error: ${err.message}`, "error");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [companyName, jobTitle, showToast]);

  if (loading) {
    return (
      <div className="youtube-container loading">
        <div className="loading-spinner"></div>
        <p>Loading interview videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="youtube-container error">
        <BiError size={30} />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="youtube-container">
      {searchQuery && <div className="search-context">Showing interviews for: {searchQuery}</div>}
      
      <div className="videos-grid">
        {videos.map((video) => (
          <VideoCard 
            key={video.id.videoId} 
            video={video} 
          />
        ))}
      </div>
    </div>
  );
};

export default YouTubeIntegration; 