import { useEffect, useState, useCallback } from "react";
import { GameState, type QuestionSnapshot, type QuestionValidation, type Team } from "../types/game";
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
  const [question, setQuestion] = useState<QuestionSnapshot | null>(null);

  const [gameMode, setGameMode] = useState<string | null>(null);
  const [gameState, setGameState] = useState<string | null>(null);

  const [teamPairingWaiting, setTeamPairingWaiting] = useState<string | null>(null);
  const [foundAnswerIds, setFoundAnswerIds] = useState<number[]>([]);
  const [revealedHintIds, setRevealedHintIds] = useState<number[]>([]);
  const [buzzerIdBuzzing, setBuzzerIdBuzzing] = useState<string | undefined>();
  const [teamIdBuzzing, setTeamIdBuzzing] = useState<string | undefined>();

  const applyQuestion = useCallback((q: QuestionSnapshot, answersIds: number[], hintsIds: number[]) => {
    setQuestion(q);
    setFoundAnswerIds(answersIds);
    setRevealedHintIds(hintsIds);
    setGameMode(q.type === 'blind_test' ? 'blindtest' : 'quizz');
  }, []);

  const getTeams = useCallback(async () => {
    const data = await fetch(`${apiBaseUrl}/public/teams`, {
      credentials: 'include',
    });
    if (data.ok) {
      const json = await data.json();
      setTeams(json.teams);
    }
  }, [apiBaseUrl]);

  const getQuestion = useCallback(async () => {
    const data = await fetch(`${apiBaseUrl}/public/question`, {
      credentials: 'include',
    });
    if (data.ok) {
      const json = await data.json();
      if (json.question) {
        applyQuestion(json.question, json.answers_ids ?? [], json.hints_ids ?? []);
      }
    }
  }, [apiBaseUrl, applyQuestion]);

  const getPhase = useCallback(async () => {
    const data = await fetch(`${apiBaseUrl}/public/phase`, {
      credentials: 'include',
    });
    if (data.ok) {
      const json = await data.json();
      setGameState(json.phase);
      if (json.game_id) {
        setGame(json.game_id);
      }
      if (json.question) {
        applyQuestion(json.question, json.answers_ids ?? [], json.hints_ids ?? []);
      }
    }
  }, [apiBaseUrl, applyQuestion]);

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

  const handlePhaseChangedEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{
      phase: string;
      game_id?: string;
      paused_buzzer?: string;
      question?: QuestionSnapshot;
      answers_ids?: number[];
      hints_ids?: number[];
    }>(event.data);
    if (data) {
      console.log('phase_changed:', data);
      if (data.phase === GameState.PLAYING && gameState === GameState.REVEAL) {
        setFoundAnswerIds([]);
        setRevealedHintIds([]);
      }
      setGameState(data.phase);
      if (data.question) {
        applyQuestion(data.question, data.answers_ids ?? [], data.hints_ids ?? []);
      }
      if (data.phase === GameState.PAUSED && data.paused_buzzer) {
        setBuzzerIdBuzzing(data.paused_buzzer);
      }
    }
  }, [parseEventData, gameState, applyQuestion]);

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

  const handleFoundAnswersEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{ question_id: number, answers_ids: number[] }>(event.data);
    if (data) {
      console.log('question.found_answers:', data);
      setFoundAnswerIds(data.answers_ids);
    }
  }, [parseEventData]);

  const handleHintsEvent = useCallback((event: MessageEvent) => {
    const data = parseEventData<{ question_id: number, hints_ids: number[] }>(event.data);
    if (data) {
      console.log('question.hints:', data);
      setRevealedHintIds(data.hints_ids);
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
    const data = parseEventData<{ question_id: number, valid: QuestionValidation }>(event.data);
    if (data) {
      console.log('question.validation:', data);
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
    const eventSource = new EventSource(`${apiBaseUrl}/sse/public`, {
      withCredentials: true,
    });
    setSse(eventSource);
    getPhase();
    return () => {
      eventSource.close();
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!game) return;
    getTeams();
    getQuestion();
  }, [game, getTeams, getQuestion]);

  useEffect(() => {
    if (!gameState) return;
    if (gameState === GameState.IDLE || gameState === GameState.PREP_READY || gameState === GameState.SCORES) {
      setFoundAnswerIds([]);
      setRevealedHintIds([]);
      setQuestion(null);
      setTeams(null);
    }
    if (gameState === GameState.REVEAL) {
      setTeamIdBuzzing(undefined);
      setBuzzerIdBuzzing(undefined);
    }
    if (gameState !== GameState.PREP_READY && gameState !== GameState.IDLE) {
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
    sse.addEventListener('question.found_answers', handleFoundAnswersEvent);
    sse.addEventListener('question.hints', handleHintsEvent);
    sse.addEventListener('question.validation', handleValidateAnswer);
    sse.addEventListener('score_adjustment', handleScoreAdjustmentEvent);
    sse.addEventListener('phase_changed', handlePhaseChangedEvent);
    sse.addEventListener('team.created', handleUpdateTeams);
    sse.addEventListener('team.updated', handleUpdateTeams);
    sse.addEventListener('team.deleted', handleUpdateTeams);
    sse.addEventListener('pairing.waiting', handlePairingWaitingEvent);
    sse.addEventListener('pairing.assigned', handlePairingAssignedEvent);
    sse.addEventListener('pairing.restored', handlePairingRestoredEvent);
    sse.addEventListener('test.buzz', handleEvents);

    return () => {
      sse.removeEventListener('question.found_answers', handleFoundAnswersEvent);
      sse.removeEventListener('question.hints', handleHintsEvent);
      sse.removeEventListener('question.validation', handleValidateAnswer);
      sse.removeEventListener('score_adjustment', handleScoreAdjustmentEvent);
      sse.removeEventListener('phase_changed', handlePhaseChangedEvent);
      sse.removeEventListener('team.created', handleUpdateTeams);
      sse.removeEventListener('team.updated', handleUpdateTeams);
      sse.removeEventListener('team.deleted', handleUpdateTeams);
      sse.removeEventListener('pairing.waiting', handlePairingWaitingEvent);
      sse.removeEventListener('pairing.assigned', handlePairingAssignedEvent);
      sse.removeEventListener('pairing.restored', handlePairingRestoredEvent);
      sse.removeEventListener('test.buzz', handleEvents);
    };

  }, [sse, parseEventData,
    handleFoundAnswersEvent, handleHintsEvent, handleValidateAnswer, handleScoreAdjustmentEvent,
    handlePhaseChangedEvent, handleUpdateTeams, handlePairingWaitingEvent,
    handlePairingAssignedEvent, handlePairingRestoredEvent, handleEvents,
  ]);

  return {
    // Connection status
    isServerReady,

    // Game state
    game,
    teams,
    question,
    gameMode,
    gameState,
    teamPairingWaiting,
    foundAnswerIds,
    revealedHintIds,
    teamIdBuzzing,
  };
}

export default useNeonBeatPublic;
