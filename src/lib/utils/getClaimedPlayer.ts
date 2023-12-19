import { claim } from '@lib/assets/probabilities.json';
import type { PlayerData } from 'types/PlayerData';
import { container } from '@sapphire/framework';

export function getClaimedPlayer(): PlayerData {
  const probabilities = claim;
  const plrs = container.players;
  const playersMixed: PlayerData[] = [];

  for (let i = 0; i < Object.keys(probabilities).length; i++) {
    const key = Object.keys(probabilities)[i];
    const ratings = key.split('-');

    const playersData = Object.values(plrs);
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
