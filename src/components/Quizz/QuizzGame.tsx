import logo from '../../assets/logo.png';
import Teams from '../Teams/Teams';
import QuizzQuestion from './QuizzQuestion';
import QuizzPropositions from './QuizzPropositions';
import QuizzMedia from './QuizzMedia';
import { Flex } from 'antd';
import { type Team, type Proposition, type MultipleChoiceQuestionSnapshot, type OpenQuestionSnapshot } from '../../types/game';

interface QuizzGameProps {
  gameState: string;
  teams: Team[];
  teamPairingWaiting: string | null;
  teamIdBuzzing: string | undefined;
  question?: MultipleChoiceQuestionSnapshot | OpenQuestionSnapshot | null;
  foundAnswerIds?: number[];
}

function derivePropositions(question: MultipleChoiceQuestionSnapshot, foundAnswerIds: number[]): Proposition[] {
  return Object.entries(question.answers).map(([id, answer]) => ({
    key: String.fromCharCode(65 + Number(id)),
    text: answer.text,
    state: foundAnswerIds.includes(Number(id))
      ? (answer.is_correct ? 'revealed_true' : 'revealed_false')
      : 'displayed',
  }));
}

function deriveOpenFoundAnswers(question: OpenQuestionSnapshot, foundAnswerIds: number[]): Proposition[] {
  return Object.entries(question.answers)
    .filter(([id]) => foundAnswerIds.includes(Number(id)))
    .map(([, answer], index) => ({
      key: String.fromCharCode(65 + index),
      text: answer.text,
      state: 'revealed_true' as const,
    }));
}

function QuizzGame({ gameState, teams, teamPairingWaiting, teamIdBuzzing, question, foundAnswerIds = [] }: QuizzGameProps) {
  return (
    <Flex vertical align="center" gap="small" className="h-screen !pl-4 !pr-4 max-w-[1600px] !m-auto">
      <div>
        <img src={logo} alt="Logo" className="h-40 m-auto" />
      </div>
      <div className="grow-1 w-full custom-gradient custom-border flex flex-col justify-center">
        {question && <QuizzQuestion question={question.prompt} />}
        {question?.url && <QuizzMedia url={question.url} gameState={gameState} />}
        {question?.type === 'multiple_choice' && (
          <QuizzPropositions propositions={derivePropositions(question, foundAnswerIds)} />
        )}
        {question?.type === 'open' && (() => {
          const found = deriveOpenFoundAnswers(question, foundAnswerIds);
          return found.length > 0 ? <QuizzPropositions propositions={found} showKeys={false} /> : null;
        })()}
      </div>
      <div className="!p-2">
        <Teams teams={teams} currentTeamPairing={teamPairingWaiting} teamBuzzing={teamIdBuzzing} gameState={gameState} />
      </div>
    </Flex>
  );
}

export default QuizzGame;
