import logo from './assets/logo.png';
import './App.css';
import { Flex } from 'antd';
import useNeonBeatPublic from './hooks/useNeonBeatPublic';
import useEqualizerSettings from './hooks/useEqualizerSettings';
import { GameState } from './types/game';
import { useEffect, useRef, useCallback, useState } from 'react';
import intro from './assets/sounds/intro.mp3';
import Scores from './components/Scores/Scores';
import Equalizer from 'r3f-equalizer';
import BlindtestGame from './components/Blindtest/BlindtestGame';
import QuizzGame from './components/Quizz/QuizzGame';

const introAudio = new Audio(intro);

function App() {
  const { gameState, gameMode, teams, question, teamPairingWaiting, foundAnswerIds, teamIdBuzzing } = useNeonBeatPublic();
  const { amplitude, cubeSpacing, cubeSideLength, gridCols, gridRows, cameraFov, cameraPosition } = useEqualizerSettings();
  const audioRef = useRef(introAudio);
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const introSongPlayingStates = [
    GameState.IDLE,
    GameState.PREP_READY,
    GameState.PAIRING,
    GameState.PREP_PAIRING,
    GameState.SCORES
  ];

  const showHomeScreenState = [
    GameState.IDLE,
    GameState.PREP_READY,
    GameState.PAIRING,
    GameState.PREP_PAIRING
  ]

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
    if (audio.volume > 0) return; // Prevent overlapping fades
    if (audio.volume === targetVolume) return;

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
    audio.volume = 1;
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
    if (!gameState) return;
    // Clear any existing fade timeout
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    if (gameState && !introSongPlayingStates.map((s) => s.toString()).includes(gameState)) {
      // Fade out smoothly when leaving IDLE state
      if (isPlaying !== false) fadeOutAudio(1000); // 800ms fade out
      setIsPlaying(false);
    } else {
      // Fade in smoothly when entering IDLE state
      if (isPlaying !== true) fadeInAudio(1000, 1); // 1000ms fade in to full volume
      setIsPlaying(true);
    }
  }, [gameState]);

  return (<>
    <Flex vertical justify="center" align="center" className="h-screen" style={{
      display: !gameState || showHomeScreenState.map((s) => s.toString()).includes(gameState) ? 'flex' : 'none'
    }}>
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
    {gameState && gameState === GameState.SCORES && (
      <Flex vertical justify="center" align="center" gap="small" className="h-screen !m-auto !pb-12 !px-12 max-w-[1600px]">
        <div>
          <img src={logo} alt="Logo" className="h-80 m-auto" />
        </div>
        <div className="w-full grow-1 custom-gradient custom-border">
          <Scores teams={teams ?? []} />
        </div>
      </Flex>
    )}
    {gameState && !showHomeScreenState.map((s) => s.toString()).includes(gameState) && gameMode === 'blindtest' && (
      <BlindtestGame
        gameState={gameState}
        question={question?.type === 'blind_test' ? question : null}
        teams={teams ?? []}
        teamPairingWaiting={teamPairingWaiting}
        teamIdBuzzing={teamIdBuzzing}
        foundAnswerIds={foundAnswerIds}
      />
    )}
    {gameState && !showHomeScreenState.map((s) => s.toString()).includes(gameState) && gameMode === 'quizz' && (
      <QuizzGame
        gameState={gameState}
        teams={teams ?? []}
        teamPairingWaiting={teamPairingWaiting}
        teamIdBuzzing={teamIdBuzzing}
        question={question?.type === 'multiple_choice' || question?.type === 'open' ? question : null}
        foundAnswerIds={foundAnswerIds}
      />
    )}
  </>);
}

export default App;
