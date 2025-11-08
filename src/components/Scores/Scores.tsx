import { Col, Flex, Row, Typography } from "antd";
import type { Team } from "../../types/game";
import goldMedalImg from '../../assets/gold_medal.png';
import silverMedalImg from '../../assets/silver_medal.png';
import bronzeMedalImg from '../../assets/bronze_medal.png';

interface ScoresProps {
  teams: Team[];
}

const Scores: React.FC<ScoresProps> = ({ teams }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  return <Flex vertical justify="center" align="center" gap="16px" className="w-full">
    <Typography.Text className="text-center my-4 font-bold !text-6xl !text-[#ffcc00]">Final Scores</Typography.Text>

    {/* Top 3 with medals */}
    {sortedTeams && (
      <Flex justify="center" align="center" className="w-full !px-16">
        {/* 2nd place */}
        {sortedTeams[1] && <Flex align="center" className="!mt-20 w-[30%]">
          <img src={silverMedalImg} alt="Silver Medal" className="h-50 mr-2" />
          <Flex vertical gap="small" className="text-[#ffcc00]">
            <span className="text-5xl font-bold">{sortedTeams[1]?.name}</span>
            <span className="text-4xl font-semibold">{sortedTeams[1]?.score} pt{sortedTeams[1]?.score !== 1 ? 's' : ''}</span>
          </Flex>
        </Flex>}

        {/* 1st place */}
        {sortedTeams[0] && <Flex align="center" className="w-[30%]">
          <img src={goldMedalImg} alt="Gold Medal" className="h-50 mr-2" />
          <Flex vertical gap="small" className="text-[#ffcc00]">
            <span className="text-5xl font-bold">{sortedTeams[0]?.name}</span>
            <span className="text-4xl font-semibold">{sortedTeams[0]?.score} pt{sortedTeams[0]?.score !== 1 ? 's' : ''}</span>
          </Flex>
        </Flex>}

        {/* 3rd place */}
        {sortedTeams[2] && <Flex align="center" className="!mt-40 w-[30%]">
          <img src={bronzeMedalImg} alt="Bronze Medal" className="h-50 mr-2" />
          <Flex vertical gap="small" className="text-[#ffcc00]">
            <span className="text-5xl font-bold">{sortedTeams[2]?.name}</span>
            <span className="text-4xl font-semibold">{sortedTeams[2]?.score} pt{sortedTeams[2]?.score !== 1 ? 's' : ''}</span>
          </Flex>
        </Flex>}
      </Flex>
    )}

    {/* Remaining teams in 3-column grid */}
    {sortedTeams.length > 3 && (
      <Row gutter={[16, 16]} className="w-full !px-32">
        {sortedTeams.slice(3).map((team, index) => (
          <Col span={8} key={team.id}>
            <Flex justify="space-between" align="center" className="bg-neutral-800/50 !p-4 rounded-lg text-white">
              <span className="text-3xl font-bold">{index + 4}. {team.name}</span>
              <span className="text-3xl font-semibold">{team.score} pt{team.score !== 1 ? 's' : ''}</span>
            </Flex>
          </Col>
        ))}
      </Row>
    )}
  </Flex>;
}

export default Scores;
