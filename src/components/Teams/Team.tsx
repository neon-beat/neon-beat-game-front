import React from 'react';
import type { Team as TeamType } from '../../types/game';

interface TeamProps {
  team: TeamType;
  isBuzzing?: boolean;
  isPairing?: boolean;
  onClick?: (team: TeamType) => void;
  className?: string;
}

/**
 * Individual team tile component displaying:
 * - Team name
 * - Score
 * - Visual state (buzzing, pairing)
 */
const Team: React.FC<TeamProps> = ({
  team,
  isBuzzing = false,
  isPairing = false,
  onClick,
  className = ''
}) => {
  const tileClasses = [
    'team-tile',
    'rounded-lg p-4 flex flex-col justify-between min-w-44 h-32 border transition-all duration-300 select-none cursor-pointer',
    'border-neutral-700 hover:border-neutral-500',
    isBuzzing && 'team-tile-buzzing ring-2 ring-amber-400 border-amber-300 bg-amber-500/20 shadow-[0_0_15px_theme(colors.amber.400)] scale-[1.03]',
    isPairing && 'team-tile-pairing ring-2 ring-blue-400 border-blue-300 bg-blue-500/20 shadow-[0_0_15px_theme(colors.blue.400)]',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const getStatusIndicator = () => {
    if (isBuzzing) {
      return (
        <span className="text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-amber-400 text-black">
          Buzzing
        </span>
      );
    }
    if (isPairing) {
      return (
        <span className="text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-blue-400 text-black">
          Pairing
        </span>
      );
    }
    return null;
  };

  const colorToCssHsl = ({ h }: { h: number; }) => {
    const hsl = `hsl(${h}, 100%, 50%)`;
    return hsl;
  };


  return (
    <button
      type="button"
      onClick={() => onClick?.(team)}
      className={tileClasses}
      aria-pressed={isBuzzing}
      aria-label={`${team.name} is ${isBuzzing ? 'buzzing' : isPairing ? 'pairing' : 'idle'} with score ${team.score}`}
      data-testid={`team-tile-${team.id}`}
      style={{
        backgroundColor: team.color ? colorToCssHsl(team.color) : '#c207a0'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold truncate flex-1" title={team.name}>
          {team.name}
        </h3>
        {getStatusIndicator()}
      </div>

      <div className="mt-auto text-center">
        <span className="block text-sm uppercase text-neutral-300">Score</span>
        <span
          className="text-2xl font-bold tabular-nums"
          data-testid={`team-score-${team.id}`}
        >
          {team.score}
        </span>
      </div>
    </button>
  );
};

export default Team;