import logo from './assets/logo.png';
import './App.css';
import YoutubePlayer from './components/YoutubePlayer/YoutubePlayer';
import Teams from './components/Teams/Teams';
import { Flex } from 'antd';
import useNeonBeatPublic from './hooks/useNeonBeatPublic';
import useEqualizerSettings from './hooks/useEqualizerSettings';
import Fields from './components/Fields/Fields';
import { GameState } from './types/game';
import { useEffect, useRef, useCallback, useState } from 'react';
import intro from './assets/sounds/intro.mp3';
import Scores from './components/Scores/Scores';
import Equalizer from 'r3f-equalizer';

function App() {
  const { gameState, teams, song, teamPairingWaiting, pointFieldsFound, bonusFieldsFound, teamIdBuzzing } = useNeonBeatPublic();
  const { amplitude, cubeSpacing, cubeSideLength, gridCols, gridRows, cameraFov, cameraPosition } = useEqualizerSettings();
  const audioRef = useRef(new Audio(intro));
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Smooth fade out function
  const fadeOutAudio = useCallback((duration = 1000) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const fadeStep = startVolume / (duration / 50); // Update every 50ms

    const fade = () => {
      if (audio.volume > fadeStep) {
        audio.volume = Math.max(0, audio.volume - fadeStep);
        fadeTimeoutRef.current = setTimeout(fade, 50);
      } else {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        fadeTimeoutRef.current = null;
      }
    };

    fade();
  }, []);

  // Smooth fade in function
  const fadeInAudio = useCallback((duration = 1000, targetVolume = 1) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.volume = 0;
    audio.play().catch((error) => {
      console.error('Error playing intro audio:', error);
    });

    const fadeStep = targetVolume / (duration / 50); // Update every 50ms

    const fade = () => {
      if (audio.volume < targetVolume - fadeStep) {
        audio.volume = Math.min(targetVolume, audio.volume + fadeStep);
        fadeTimeoutRef.current = setTimeout(fade, 50);
      } else {
        audio.volume = targetVolume;
        fadeTimeoutRef.current = null;
      }
    };

    fade();
  }, []);

  // Toggle play/pause function for manual control
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      fadeOutAudio(500);
      setIsPlaying(false);
    } else {
      fadeInAudio(500, 1);
      setIsPlaying(true);
    }
  }, [isPlaying, fadeOutAudio, fadeInAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch((error) => {
      console.error('Error playing intro audio:', error);
      setIsPlaying(false);
    });

    // Cleanup function to clear any pending fade timeouts
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, [])

  useEffect(() => {
    // Clear any existing fade timeout
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    if (gameState && gameState !== GameState.IDLE) {
      // Fade out smoothly when leaving IDLE state
      fadeOutAudio(1000); // 800ms fade out
      setIsPlaying(false);
    } else {
      // Fade in smoothly when entering IDLE state
      fadeInAudio(1000, 1); // 1000ms fade in to full volume
      setIsPlaying(true);
    }
  }, [gameState, fadeOutAudio, fadeInAudio]);

  if (!gameState || gameState === GameState.IDLE) return (
    <Flex vertical justify="center" align="center" className="h-screen">
      <div>
        <img src={logo} alt="Logo" className="h-[50vh] m-auto" />
      </div>
      <div className="grow-1 w-full relative min-h-[50vh]">
        <Equalizer
          audio={audioRef}
          amplitude={amplitude}
          cubeSpacing={cubeSpacing}
          cubeSideLength={cubeSideLength}
          gridCols={gridCols}
          gridRows={gridRows}
          cameraFov={cameraFov}
          cameraPosition={cameraPosition}
        />
        {/* Semi-transparent Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/20 hover:border-white/40 group"
          style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
        >
          {isPlaying ? (
            // Pause icon
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-white/80 group-hover:bg-white rounded-sm"></div>
              <div className="w-1 h-4 bg-white/80 group-hover:bg-white rounded-sm"></div>
            </div>
          ) : (
            // Play icon
            <div
              className="w-0 h-0 ml-1 border-l-[6px] border-l-white/80 group-hover:border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"
            />
          )}
        </button>
      </div>
    </Flex>
  );

  if (gameState === GameState.SCORES) return (
    <Flex vertical justify="center" align="center" gap="small" className="h-screen !m-auto !pb-12 !px-12 max-w-[1600px]">
      <div>
        <img src={logo} alt="Logo" className="h-80 m-auto" />
      </div>
      <div className="w-full grow-1 custom-gradient custom-border">
        <Scores teams={teams ?? []} />
      </div>
    </Flex>
  );

  return (
    <Flex vertical align="center" gap="small" className="h-screen">
      <div>
        <img src={logo} alt="Logo" className="h-40 m-auto" />
      </div>
      <Flex gap="small" className="grow-1 w-full !px-4">
        <div className="max-w-100 grow-1 custom-gradient custom-border m-[6px]">
          <Fields
            pointFields={song?.point_fields ?? []}
            bonusFields={song?.bonus_fields ?? []}
            pointFieldsFound={pointFieldsFound}
            bonusFieldsFound={bonusFieldsFound}
          />
        </div>
        <div className="grow-1 custom-gradient custom-border m-[6px]">
          <YoutubePlayer youtubeUrl={song?.url} playing={gameState === GameState.PLAYING || gameState === GameState.REVEAL} showOverlay={gameState !== GameState.REVEAL} duration={song?.guess_duration_ms} start={song?.starts_at_ms} />
        </div>
      </Flex>
      <div className="!p-2">
        <Teams teams={teams ?? []} currentTeamPairing={teamPairingWaiting} teamBuzzing={teamIdBuzzing} />
      </div>
    </Flex>
  );
}

export default App;
