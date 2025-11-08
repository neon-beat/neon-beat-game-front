import React, { useEffect } from 'react';
import type { Team as TeamType } from '../../types/game';
import buzzSound from '../../assets/sounds/qpuc-buzz.mp3';

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
    'rounded-lg p-4 flex flex-col justify-between min-w-44 h-40 border transition-all duration-300 select-none cursor-pointer',
    'bg-neutral-900/70 border-neutral-700 hover:border-neutral-500',
    isBuzzing && 'team-tile-buzzing ring-2 ring-amber-400 border-amber-300 bg-amber-500/20 scale-[1.03]',
    isPairing && 'team-tile-pairing ring-2 ring-blue-400 border-blue-300 bg-blue-500/20 shadow-[0_0_15px_theme(colors.blue.400)]',
    className
  ]
    .filter(Boolean)
    .join(' ');

  // const getStatusIndicator = () => {
  //   if (isBuzzing) {
  //     return (
  //       <span className="text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-amber-400 text-black">
  //         Buzzing
  //       </span>
  //     );
  //   }
  //   if (isPairing) {
  //     return (
  //       <span className="text-xs px-2 py-1 rounded-full font-medium tracking-wide bg-blue-400 text-black">
  //         Pairing
  //       </span>
  //     );
  //   }
  //   return null;
  // };

  const colorToCssHsl = ({ h, s, v }: { h: number; s: number; v: number }) => {
    return `hsl(${h}, ${s}%, ${v}%)`;
  };

  useEffect(() => {
    if (isBuzzing === true) {
      // const teamTile = document.getElementById(`team-tile-${team.id}`);
      // if (teamTile) {
      //   teamTile.classList.add('team-tile-buzzshake');
      // }
      const buzzAudio = new Audio(buzzSound);
      buzzAudio.volume = 0.5;
      buzzAudio.play().catch((error) => {
        console.error('Error playing buzz sound:', error);
      });
    }
  }, [isBuzzing, team.id]);


  return (
    <button
      type="button"
      id={`team-tile-${team.id}`}
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
        <h1 className="text-4xl font-semibold truncate flex-1" title={team.name}>
          {team.name}
        </h1>
        {/* {getStatusIndicator()} */}
      </div>

      <div className="mt-auto text-center">
        <span className="block text-lg font-bold uppercase text-neutral-300">Score</span>
        <span
          className="text-4xl font-bold tabular-nums"
          data-testid={`team-score-${team.id}`}
        >
          {team.score}
        </span>
      </div>
    </button>
  );
};

export default Team;