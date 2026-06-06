import type { Proposition } from '../../types/game';
import './QuizzPropositions.css';

interface QuizzPropositionsProps {
  propositions: Proposition[];
  showKeys?: boolean;
}

function QuizzPropositions({ propositions, showKeys = true }: QuizzPropositionsProps) {
  return (
    <div className="propositions-grid">
      {propositions.map((p) => (
        <div key={p.key} className={`proposition-item proposition-${p.state}`}>
          {showKeys && <span className="proposition-key">{p.key}</span>}
          <span className="proposition-text">
            {p.state === 'hidden' ? '?' : p.text}
          </span>
        </div>
      ))}
    </div>
  );
}

export default QuizzPropositions;
