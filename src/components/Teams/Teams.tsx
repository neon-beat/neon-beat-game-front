import React from 'react';
import './Teams.css';
import type { Team as TeamType } from '../../types/game';
import Team from './Team';

interface TeamsProps {
  teams: TeamType[];
  renderTeamTile?: (team: TeamType) => React.ReactNode; // optional override
  onTeamClick?: (team: TeamType) => void; // optional click handler
  className?: string;
  teamBuzzing?: string;
  currentTeamPairing?: string | null;
}

/**
 * Teams scoreboard – displays each team as a tile with:
 *  - name
 *  - score
 *  - buzzing status (boolean) affecting style
 */
const Teams: React.FC<TeamsProps> = ({ teams, renderTeamTile, onTeamClick, className = '', teamBuzzing, currentTeamPairing }) => {
  if (!teams?.length) {
    return (
      <div className={`teams-wrapper text-sm text-neutral-400 ${className}`}>No teams</div>
    );
  }

  return (
    <div className={`teams-wrapper flex justify-center gap-4 ${className}`} data-testid="teams-wrapper">
      {teams.map(team => {
        if (renderTeamTile) {
          return <React.Fragment key={team.id}>{renderTeamTile(team)}</React.Fragment>;
        }

        const isBuzzing = teamBuzzing === team.id || false;
        const isPairing = currentTeamPairing === team.id;

        return (
          <Team
            key={team.id}
            team={team}
            isBuzzing={isBuzzing}
            isPairing={isPairing}
            onClick={onTeamClick}
          />
        );
      })}
    </div>
  );
};

export default Teams;

