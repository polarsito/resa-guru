import type { PlayerData } from '../../types/PlayerData';
import players from '@lib/assets/players.json';
import specialPlayers from '@lib/assets/special_players.json';
import { container } from '@sapphire/framework';

export async function hasPlayer(
  userId: string,
  player: string
): Promise<boolean> {
  const userData = await container.db.getUserData(userId, ['club']);

  return userData!.club?.some((p) => p === player);
}

export function playerExists(name: string): boolean {
  const allPlayers = [...Object.keys(players), ...Object.keys(specialPlayers)];
  return allPlayers.some(
    (p) =>
      p.toLowerCase() === name.toLowerCase() ||
      (p.includes('*') && p.toLowerCase().includes(name.toLowerCase()))
  );
}

export function getPlayerData(name: string): PlayerData[] {
  const allPlayers = [...Object.keys(players), ...Object.keys(specialPlayers)];
  const entries = allPlayers.filter((p) =>
    p.toLowerCase().includes(name.toLowerCase())
  );

  const data: PlayerData[] = entries.map((ent) =>
    ent.includes('*') ? specialPlayers[ent] : players[ent]
  );

  return data;
}

export function getPlayerKey(name: string, type: string): string {
  return type !== '0' ? `${name}*${type.toLowerCase()}` : name;
}
