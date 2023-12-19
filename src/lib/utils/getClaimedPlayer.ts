import { claim } from '@lib/assets/probabilities.json';
import plrs from '@lib/assets/players.json';
import specialPlrs from '@lib/assets/special_players.json';
import type { PlayerData } from '../../types/PlayerData';

export function getClaimedPlayer(): PlayerData {
  const probabilities = claim;

  const playersMixed: PlayerData[] = [];
  for (let i = 0; i < Object.keys(probabilities).length; i++) {
    const key = Object.keys(probabilities)[i];
    const ratings = key.split('-');

    const playersData = [...Object.values(plrs), ...Object.values(specialPlrs)];
    const players: PlayerData[] = [];
    for (let t = 0; t < playersData.length; t++) {
      const player = playersData[t];
      if (
        player.rating >= Number(ratings[0]) &&
        player.rating <= Number(ratings[1])
      )
        players.push(player);
    }

    for (let x = 0; x < Math.floor(probabilities[key] / 0.05); x++) {
      players.forEach((plr: PlayerData) => {
        playersMixed.push(plr);
      });
    }
  }

  const claimedPlayer: PlayerData =
    playersMixed[Math.floor(Math.random() * playersMixed.length)];

  return claimedPlayer;
}
