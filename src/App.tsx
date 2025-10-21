import logo from './assets/logo.png';
import './App.css';
import YoutubePlayer from './components/YoutubePlayer/YoutubePlayer';
import Teams from './components/Teams/Teams';
import { Flex } from 'antd';
import useNeonBeatPublic from './hooks/useNeonBeatPublic';
import useEqualizerSettings from './hooks/useEqualizerSettings';
import Fields from './components/Fields/Fields';
import { GameState } from './types/game';
import { useEffect, useRef, useCallback } from 'react';
import intro from './assets/intro.mp3';
import Scores from './components/Scores/Scores';
import Equalizer from 'r3f-equalizer';

function App() {
  const { gameState, teams, song, teamPairingWaiting, pointFieldsFound, bonusFieldsFound, teamIdBuzzing } = useNeonBeatPublic();
  const { amplitude, cubeSpacing, cubeSideLength, gridCols, gridRows, cameraFov, cameraPosition } = useEqualizerSettings();
  const audioRef = useRef(new Audio(intro));
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0;
    audio.play().catch((error) => {
      console.error('Error playing intro audio:', error);
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
    } else {
      // Fade in smoothly when entering IDLE state
      fadeInAudio(1000, 1); // 1000ms fade in to full volume
    }
  }, [gameState, fadeOutAudio, fadeInAudio]);

  if (!gameState || gameState === GameState.IDLE) return (
    <Flex vertical justify="center" align="center" gap="small" className="h-screen">
      <div>
        <img src={logo} alt="Logo" className="h-150 m-auto" />
      </div>
      <div className="grow-1 w-full">
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
