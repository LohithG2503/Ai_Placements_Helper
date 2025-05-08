import React from 'react';
import { Card } from './ui/card';

const VideoList = ({ video }) => {
  const openVideoInNewTab = () => {
    window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank');
  };

  // Format the published date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Card 
      className="p-4 cursor-pointer hover:shadow-md transition-shadow" 
      onClick={openVideoInNewTab}
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <div className="relative aspect-video">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-1 line-clamp-2">{video.title}</h3>
          <p className="text-sm text-gray-600 mb-1">{video.channelTitle}</p>
          <p className="text-xs text-gray-500 mb-2">{formatDate(video.publishedAt)}</p>
          <p className="text-sm text-gray-700 line-clamp-3">{video.description}</p>
        </div>
      </div>
    </Card>
  );
};

export default VideoList; 