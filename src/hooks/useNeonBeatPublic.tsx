import { useEffect, useState, useCallback } from "react";
import { GameState, type AnswerValidation, type Song, type Team } from "../types/game";
import wrongSong from '../assets/sounds/qpuc-cestnon.mp3';
import rightSong from '../assets/sounds/kk-oui-oui-oui-oui-oui.mp3';

const wrongAudio = new Audio(wrongSong);
const rightAudio = new Audio(rightSong);

const useNeonBeatPublic = () => {

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  const [sse, setSse] = useState<EventSource | null>(null);
  const [isServerReady, setIsServerReady] = useState<boolean>(false);
  const [game, setGame] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [song, setSong] = useState<Song | null>(null);
  const [gameState, setGameState] = useState<string | null>(null);
  const [teamPairingWaiting, setTeamPairingWaiting] = useState<string | null>(null);
  const [pointFieldsFound, setPointFieldsFound] = useState<string[]>([]);
  const [bonusFieldsFound, setBonusFieldsFound] = useState<string[]>([]);
  const [buzzerIdBuzzing, setBuzzerIdBuzzing] = useState<string | undefined>();
  const [teamIdBuzzing, setTeamIdBuzzing] = useState<string | undefined>();

  const getTeams = useCallback(async () => {
    const data = await fetch(`${apiBaseUrl}/public/teams`);
    if (data.ok) {
      const json = await data.json();
      setTeams(json.teams);
    }
  }, [apiBaseUrl]);

  const getSong = useCallback(async () => {
    const data = await fetch(`${apiBaseUrl}/public/song`);
    if (data.ok) {
      const json = await data.json();
      setSong(json.song);
    }
  }, [apiBaseUrl]);

  const getPhase = useCallback(async () => {
    const data = await fetch(`${apiBaseUrl}/public/phase`);
    if (data.ok) {
      const json = await data.json();
      setGameState(json.phase);
      if (json.game_id) {
        setGame(json.game_id);
      }
    }
  }, [apiBaseUrl]);

  // Helper to safely parse JSON
  const parseEventData = useCallback(<T,>(data: string): T | null => {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to parse SSE event data:', error);
      return null;
    }
  }, []);

  const handleEvents = useCallback((event: MessageEvent) => {
    const data = parseEventData(event.data);
    if (data) {
      console.log(`${event.type}:`, data);
    }
  }, [parseEventData]);

  // const handleGameSessionEvent = useCallback((event: MessageEvent) => {
  //   const data = parseEventData<Game>(event.data);
  //   if (data) {
  //     console.log('game.session:', data);
  //     setGame(data);
  //     if (data.teams) {
  //       setTeams(data.teams);
  //     }
  //   }
  // }, [parseEventData]);

  const handlePhaseChangedEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{ phase: string, song?: Song, paused_buzzer?: string }>(event.data);
    if (data) {
      console.log('phase_changed:', data);
      if (data.phase === GameState.PLAYING && gameState === GameState.REVEAL) {
        setPointFieldsFound([]);
        setBonusFieldsFound([]);
      }
      setGameState(data.phase);
      if (data.song) {
        setSong(data.song);
      }
      if (data.phase === GameState.PAUSED && data.paused_buzzer) {
        setBuzzerIdBuzzing(data.paused_buzzer);
      }
    }
  }, [parseEventData, gameState]);

  const handlePairingWaitingEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{ team_id: string }>(event.data);
    if (data) {
      console.log('pairing.waiting:', data);
      setTeamPairingWaiting(data.team_id);
    }
  }, [parseEventData]);

  const handlePairingAssignedEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{ team_id: string, buzzer_id: string }>(event.data);
    if (data) {
      console.log('pairing.assigned:', data);
      setTeams((prevTeams) => {
        if (!prevTeams) return prevTeams;
        return prevTeams.map((team) =>
          team.id.toString() === data.team_id ? { ...team, buzzer_id: data.buzzer_id } : team
        );
      });
      setTeamPairingWaiting(null);
    }
  }, [parseEventData, teamPairingWaiting]);

  const handlePairingRestoredEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{ snapshot: Team[] }>(event.data);
    if (data) {
      console.log('pairing.restored:', data);
      setTeamPairingWaiting(null);
      setTeams(data.snapshot);
    }
  }, [parseEventData]);

  const handleFieldsFoundEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{ song_id: number, point_fields: string[], bonus_fields: string[] }>(event.data);
    if (data) {
      console.log('fields_found:', data);
      setPointFieldsFound(data.point_fields);
      setBonusFieldsFound(data.bonus_fields);
    }
  }, [parseEventData]);

  const handleScoreAdjustmentEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<Team>(event.data);
    if (data) {
      console.log('score_adjustment:', data);
      setTeams((prevTeams) => {
        if (!prevTeams) return prevTeams;
        return prevTeams.map((team) =>
          team.id === data.id ? { ...team, score: data.score } : team
        );
      });
    }
  }, [parseEventData]);

  const handleUpdateTeams = useCallback(() => {
    getTeams();
  }, [getTeams]);

  const handleValidateAnswer = useCallback((event: MessageEvent) => {
    const data = parseEventData<AnswerValidation>(event.data);
    if (data) {
      console.log('answer_validation:', data);
      if (data.valid === "wrong") {
        wrongAudio.volume = 0.5;
        wrongAudio.play().catch((error) => {
          console.error('Error playing wrong answer sound:', error);
        });
      } else if (data.valid === "correct") {
        rightAudio.volume = 0.5;
        rightAudio.play().catch((error) => {
          console.error('Error playing right answer sound:', error);
        });
      }
    }
    setTeamIdBuzzing(undefined);
    setBuzzerIdBuzzing(undefined);
  }, [parseEventData]);

  useEffect(() => {
    if (!apiBaseUrl) return;
    const eventSource = new EventSource(`${apiBaseUrl}/sse/public`);
    setSse(eventSource);
    getPhase();
    return () => {
      eventSource.close();
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!game) return;
    getTeams();
    getSong();
  }, [game, getTeams, getSong]);

  useEffect(() => {
    if (!gameState) return;
    if (gameState === GameState.IDLE || gameState === GameState.PREP_READY || gameState === GameState.SCORES) {
      setPointFieldsFound([]);
      setBonusFieldsFound([]);
      setSong(null);
      setTeams(null);
    }
    if (gameState === GameState.REVEAL) {
      setTeamIdBuzzing(undefined);
      setBuzzerIdBuzzing(undefined);
    }
    if (gameState !== GameState.PREP_READY) {
      getTeams();
    }
  }, [gameState]);

  useEffect(() => {
    if (!buzzerIdBuzzing) return;
    if (!teams) return;
    const team = teams?.find(t => t.buzzer_id === buzzerIdBuzzing);
    if (team) {
      setTeamIdBuzzing(team.id);
    }
  }, [buzzerIdBuzzing]);

  useEffect(() => {
    if (!sse) return;

    sse.onopen = () => {
      console.log('SSE connection opened');
      setIsServerReady(true);
    };

    sse.onerror = (error) => {
      console.error('SSE error:', error);
      setIsServerReady(false);
    };

    // Event handlers
    sse.addEventListener('fields_found', handleFieldsFoundEvent);
    sse.addEventListener('answer_validation', handleValidateAnswer);
    sse.addEventListener('score_adjustment', handleScoreAdjustmentEvent);
    sse.addEventListener('phase_changed', handlePhaseChangedEvent);
    sse.addEventListener('team.created', handleUpdateTeams);
    sse.addEventListener('team.updated', handleUpdateTeams);
    sse.addEventListener('team.deleted', handleUpdateTeams);
    // sse.addEventListener('game.session', handleGameSessionEvent);
    sse.addEventListener('pairing.waiting', handlePairingWaitingEvent);
    sse.addEventListener('pairing.assigned', handlePairingAssignedEvent);
    sse.addEventListener('pairing.restored', handlePairingRestoredEvent);
    sse.addEventListener('test.buzz', handleEvents);

    return () => {
      sse.removeEventListener('fields_found', handleFieldsFoundEvent);
      sse.removeEventListener('answer_validation', handleValidateAnswer);
      sse.removeEventListener('score_adjustment', handleScoreAdjustmentEvent);
      sse.removeEventListener('phase_changed', handlePhaseChangedEvent);
      sse.removeEventListener('team.created', handleUpdateTeams);
      sse.removeEventListener('team.updated', handleUpdateTeams);
      sse.removeEventListener('team.deleted', handleUpdateTeams);
      // sse.removeEventListener('game.session', handleGameSessionEvent);
      sse.removeEventListener('pairing.waiting', handlePairingWaitingEvent);
      sse.removeEventListener('pairing.assigned', handlePairingAssignedEvent);
      sse.removeEventListener('pairing.restored', handlePairingRestoredEvent);
      sse.removeEventListener('test.buzz', handleEvents);
    };

  }, [sse, parseEventData,
    handleFieldsFoundEvent, handleValidateAnswer, handleScoreAdjustmentEvent,
    handlePhaseChangedEvent, handleUpdateTeams, handlePairingWaitingEvent,
    handlePairingAssignedEvent, handlePairingRestoredEvent, handleEvents,
  ]);

  return {
    // Connection status
    isServerReady,

    // Game state
    game,
    teams,
    song,
    gameState,
    teamPairingWaiting,
    pointFieldsFound,
    bonusFieldsFound,
    teamIdBuzzing,
  };
}

export default useNeonBeatPublic;
