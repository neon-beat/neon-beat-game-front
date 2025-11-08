import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import './YoutubePlayer.css';
import { Flex } from 'antd';

interface YoutubePlayerProps {
  youtubeUrl?: string;
  showOverlay?: boolean;
  duration?: number;
  start?: number;
  playing?: boolean;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({
  youtubeUrl,
  showOverlay = false,
  duration = 30000,
  start = 0,
  playing = false,
}) => {
  const [timer, setTimer] = useState<number>();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (youtubeUrl && duration) {
      setTimer(duration / 1000);
    }
  }, [youtubeUrl]);

  useEffect(() => {
    if (playing === true) {
      if (timer && timer > 0) {
        timeoutRef.current = setInterval(() => {
          setTimer((prevTimer) => {
            const newTimer = (prevTimer !== undefined ? prevTimer - 1 : prevTimer);
            return (newTimer ?? 0) >= 0 ? newTimer : 0;
          });
        }, 1000);
        return () => {
          if (timeoutRef.current) clearInterval(timeoutRef.current);
        }
      }
    } else {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    }
  }, [playing, timer]);

  const finalShow = showOverlay;

  return (
    <Flex vertical justify="center" align="center" className="h-full w-full text-9xl text-white grow-1">
      <Flex id="player-overlay" justify="center" align="center" className={`player-overlay w-full h-full !flex ${finalShow ? 'visible' : 'hidden'}`}>
        {finalShow && <>{(timer ?? 0) > 0 ? <p className="overlay-counter text-center">{timer?.toString()}</p> : <p className="overlay-counter text-center">Time's up !</p>}
        </>}
      </Flex>
      {youtubeUrl && <ReactPlayer
        id="youtube-player"
        className={`react-player w-full overflow-auto rounded-[10px] ${finalShow ? 'hidden' : 'visible'}`}
        src={youtubeUrl}
        playing={playing}
        width="100%"
        config={{
          youtube: {
            start: start ? start / 1000 : 0,
          }
        }}
        height={finalShow ? '0%' : '100%'}
      />}
    </Flex>
  );
};

export default YoutubePlayer;
