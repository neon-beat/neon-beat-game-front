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

  /**
   * Convert HSV to HSL color format
   * @param h - Hue (0-360)
   * @param s - Saturation (0-1)
   * @param v - Value/Brightness (0-1)
   * @returns HSL color string in format "hsl(h, s%, l%)"
   */
  const hsvToHsl = ({ h, s, v }: { h: number; s: number; v: number }): string => {
    // Calculate lightness
    const l = v * (1 - s / 2);

    // Calculate saturation for HSL
    const sHsl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

    // Convert to percentage and round
    const lPercent = Math.round(l * 100);
    const sHslPercent = Math.round(sHsl * 100);

    return `hsl(${h}, ${sHslPercent}%, ${lPercent}%)`;
  };

  /**
   * Determine text color (black or white) based on HSL background color for optimal readability
   * Uses WCAG relative luminance calculation
   * @param h - Hue (0-360)
   * @param s - Saturation (0-1)
   * @param l - Lightness (0-1)
   * @returns '#000000' for black text or '#FFFFFF' for white text
   */
  const getTextColorForHslBackground = (h: number, s: number, l: number): string => {
    // Convert HSL to RGB first
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
      r = c; g = 0; b = x;
    }

    r = r + m;
    g = g + m;
    b = b + m;

    // Calculate relative luminance (WCAG formula)
    const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

    // Use white text for dark backgrounds (luminance < 0.5), black for light backgrounds
    return luminance < 0.5 ? '#FFFFFF' : '#000000';
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
        backgroundColor: team.color ? hsvToHsl(team.color) : '#c207a0',
        color: team.color
          ? getTextColorForHslBackground(
            team.color.h,
            team.color.s,
            team.color.v * (1 - team.color.s / 2)
          )
          : '#FFFFFF'
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <h1 className="text-4xl font-semibold truncate flex-1" title={team.name}>
          {team.name}
        </h1>
        {/* {getStatusIndicator()} */}
      </div>

      <div className="mt-auto text-center">
        <span className="block text-lg font-bold uppercase">Score</span>
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