import { container } from '@sapphire/framework';
import type { MatchResult } from 'types/MatchResult';
import type { UserData } from 'types/UserData';
import { getTeamChemistry } from './chemistry';

export async function match(
  player1: UserData,
  player2: UserData
): Promise<MatchResult> {
  const data1 = player1.starters;
  const data2 = player2.starters;

  const players = container.players;

  const ratingt1 = Object.values(data1).map((p) => players[p].rating);
  const ratingt2 = Object.values(data2).map((p) => players[p].rating);

  const rating1 = ratingt1.reduce((a, b) => a + b);
  const rating2 = ratingt2.reduce((a, b) => a + b);

  const dataChemistry1 = await getTeamChemistry(player1.userId);
  const dataChemistry2 = await getTeamChemistry(player2.userId);

  const chemistry1 = Object.values(dataChemistry1).reduce((a, b) => a + b);
  const chemistry2 = Object.values(dataChemistry2).reduce((a, b) => a + b);

  const team1Strength = rating1 / 11 + chemistry1 * 5;
  const team2Strength = rating2 / 11 + chemistry2 * 5;
  const totalStrength = team1Strength + team2Strength;

  function calculateProbability(user1Id: string, user2Id: string) {
    const team1Probability = team1Strength / totalStrength;

    return Math.random() < team1Probability ? user1Id : user2Id;
  }

  function determinateScorer(user1Id: string, user2Id: string) {
    const probability = calculateProbability(user1Id, user2Id);
    return probability === user1Id ? user1Id : user2Id;
  }

  const goals = Math.floor(Math.random() * 6) + 1;
  const scores: string[] = [];
  for (let i = 0; i < goals; i++) {
    const scorer = determinateScorer(player1.userId, player2.userId);
    scores.push(scorer);
  }

  const player1Goals = scores.filter((g) => g === player1.userId);
  const player2Goals = scores.filter((g) => g === player2.userId);
  const winner =
    player1Goals === player2Goals
      ? null
      : player1Goals > player2Goals
      ? player1.userId
      : player2.userId;

  const goalsAndTime = {};

  for (let i = 0; i < scores.length; i++) {
    const time = Math.floor(Math.random() * 90) + 1;
    // @ts-ignore
    if (Object.values(goalsAndTime).includes(time)) return i--;
    if (!goalsAndTime[scores[i]]) goalsAndTime[scores[i]] = [time];
    else goalsAndTime[scores[i]] = [time, ...goalsAndTime[scores[i]]];
  }

  return {
    winner: winner,
    goals: goalsAndTime,
  };
}
