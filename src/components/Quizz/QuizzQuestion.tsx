import './QuizzQuestion.css';

function getQuestionFontSize(length: number): string {
  if (length < 30) return '8rem';
  if (length < 60) return '6rem';
  if (length < 100) return '4rem';
  return '2.5rem';
}

interface QuizzQuestionProps {
  question: string;
  questionNumber?: number;
  subtext?: string;
}

function QuizzQuestion({ question, questionNumber, subtext }: QuizzQuestionProps) {
  return (
    <div className="quizz-question-container">
      {questionNumber !== undefined && (
        <span className="quizz-question-label">Question {questionNumber}</span>
      )}
      <p className="quizz-question-text" style={{ fontSize: getQuestionFontSize(question.length) }}>{question}</p>
      {subtext && <p className="quizz-question-subtext">{subtext}</p>}
    </div>
  );
}

export default QuizzQuestion;
