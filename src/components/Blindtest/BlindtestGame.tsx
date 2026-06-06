import logo from '../../assets/logo.png';
import Fields from '../Fields/Fields';
import YoutubePlayer from '../YoutubePlayer/YoutubePlayer';
import Teams from '../Teams/Teams';
import { Flex } from 'antd';
import { GameState, type BlindTestQuestionSnapshot, type Team } from '../../types/game';

interface BlindtestGameProps {
  gameState: string;
  question: BlindTestQuestionSnapshot | null;
  teams: Team[];
  teamPairingWaiting: string | null;
  teamIdBuzzing: string | undefined;
  foundAnswerIds: number[];
}

function BlindtestGame({ gameState, question, teams, teamPairingWaiting, teamIdBuzzing, foundAnswerIds }: BlindtestGameProps) {
  return (
    <Flex vertical align="center" gap="small" className="h-screen">
      <div>
        <img src={logo} alt="Logo" className="h-40 m-auto" />
      </div>
      <Flex gap="small" className="grow-1 w-full !px-4">
        <div className="max-w-100 grow-1 custom-gradient custom-border m-[6px]">
          <Fields
            answers={question?.answers ?? {}}
            foundAnswerIds={foundAnswerIds}
            revealAll={gameState === GameState.REVEAL}
          />
        </div>
        <div className="grow-1 custom-gradient custom-border m-[6px]">
          <YoutubePlayer
            youtubeUrl={question?.url}
            playing={gameState === GameState.PLAYING || gameState === GameState.REVEAL}
            showOverlay={gameState !== GameState.REVEAL}
            duration={question?.guess_duration_ms}
            start={question?.starts_at_ms}
          />
        </div>
      </Flex>
      <div className="!p-2">
        <Teams teams={teams} currentTeamPairing={teamPairingWaiting} teamBuzzing={teamIdBuzzing} gameState={gameState} />
      </div>
    </Flex>
  );
}

export default BlindtestGame;
