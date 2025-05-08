import React from 'react';
import { Card } from './ui/card';
import './YoutubeIntegration.css'; // Import shared styles

const VideoCard = ({ video }) => {
  const openVideoInNewTab = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank');
  };

  // Format the published date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card 
      className="video-card" 
      onClick={openVideoInNewTab}
    >
      <div className="video-thumbnail">
        <img 
          src={video.snippet.thumbnails.medium.url} 
          alt={video.snippet.title} 
          className="thumbnail-img"
          loading="lazy"
        />
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.snippet.title}</h3>
        <div>
          <p className="video-channel">{video.snippet.channelTitle}</p>
          <p className="video-date">{formatDate(video.snippet.publishedAt)}</p>
        </div>
      </div>
    </Card>
  );
};

export default VideoCard; 