import React from 'react';
import './fields.css';
import { Flex } from 'antd';
import type { Field } from '../../types/game';

interface FieldsProps {
  pointFields: Field[];
  bonusFields: Field[];
  pointFieldsFound?: string[], // optional found fields to reveal
  bonusFieldsFound?: string[], // optional found fields to reveal
}

const Fields: React.FC<FieldsProps> = ({ pointFields, bonusFields, pointFieldsFound, bonusFieldsFound }) => {
  return (
    <Flex vertical gap="12px" className="h-full overflow-auto !p-2 min-w-[300px]">
      {pointFields.map((field) => {
        const revealField = pointFieldsFound?.includes(field.key);
        return (
          <div key={field.key} className={`field-item ${revealField ? 'field-item-revealed' : ''}`}>
            <span className="field-key">{field.key}</span>
            <span className="field-value">{revealField === true ? field.value : '????'}</span>
          </div>
        );
      })}
      {bonusFields.map((field) => {
        const revealField = bonusFieldsFound?.includes(field.key);
        return (
          <div key={field.key} className={`field-item ${revealField ? 'field-item-revealed' : ''}`}>
            <span className="field-key">{field.key}</span>
            <span className="field-value">{revealField === true ? field.value : '????'}</span>
          </div>
        );
      })}
    </Flex>
  );
};

export default Fields;
