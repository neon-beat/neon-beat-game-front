import React from 'react';
import './fields.css';
import { Flex } from 'antd';
import type { BlindTestAnswerSnapshot } from '../../types/game';

interface FieldsProps {
  answers: Record<string, BlindTestAnswerSnapshot>;
  foundAnswerIds?: number[];
  revealAll?: boolean;
}

const Fields: React.FC<FieldsProps> = ({ answers, foundAnswerIds, revealAll }) => {
  const entries = Object.entries(answers).map(([id, answer]) => ({ id: Number(id), answer }));
  const pointAnswers = entries.filter(({ answer }) => !answer.is_bonus);
  const bonusAnswers = entries.filter(({ answer }) => answer.is_bonus);

  return (
    <Flex vertical gap="12px" className="h-full overflow-auto !p-2 min-w-[300px]">
      {pointAnswers.map(({ id, answer }) => {
        const revealed = revealAll === true || foundAnswerIds?.includes(id) === true;
        return (
          <div key={id} className={`field-item ${revealed ? 'field-item-revealed' : ''}`}>
            <span className="field-key">{answer.key}</span>
            <span className="field-value">{revealed ? answer.value : '????'}</span>
          </div>
        );
      })}
      {bonusAnswers.map(({ id, answer }) => {
        const revealed = foundAnswerIds?.includes(id) === true;
        return (
          <div key={id} className={`field-item ${revealed ? 'field-item-revealed' : ''}`}>
            <span className="field-key">{answer.key}</span>
            <span className="field-value">{revealed ? answer.value : '????'}</span>
          </div>
        );
      })}
    </Flex>
  );
};

export default Fields;
