import React from 'react';
import './Answers.css';

export interface Answer {
  key: string;
  value: string;
  show: boolean;
}

interface AnswersProps {
  answers: Answer[];
}

const Answers: React.FC<AnswersProps> = ({ answers }) => {
  return (
    <div className="answers-container h-full overflow-auto p-2">
      {answers.map((answer) => (
        <div key={answer.key} className="answer-item">
          <span className="answer-key">{answer.key}</span>
          <span className="answer-value">{answer.show ? answer.value : '????'}</span>
        </div>
      ))}
    </div>
  );
};

export default Answers;
