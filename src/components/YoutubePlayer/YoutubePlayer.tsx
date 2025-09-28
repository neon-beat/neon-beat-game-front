import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './YoutubePlayer.css';

interface YoutubePlayerProps {
  youtubeId?: string;
  showOverlay?: boolean;
  overlayText?: string;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  youtubeId = 'oDax2eMTmtA',
  showOverlay = false,
  overlayText = '',
}) => {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);

  useEffect(() => {
    setIsOverlayVisible(showOverlay);
  }, [showOverlay]);


  return (
    <div className="youtube-wrapper w-full flex">
      {isOverlayVisible && (
        <div className="youtube-overlay">
          <span>{overlayText}</span>
        </div>
      )}
      <ReactPlayer
        className="react-player"
        src={`https://www.youtube.com/watch?v=${youtubeId}`}
        playing={true}
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default YoutubePlayer;
