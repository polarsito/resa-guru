import type { PlayerData } from '../../types/PlayerData';
import { container } from '@sapphire/framework';

export async function hasPlayer(
  userId: string,
  player: string
): Promise<boolean> {
  const userData = await container.db.getUserData(userId, ['club']);

  return userData!.club?.some((p) => p === player);
}

export function playerExists(name: string): boolean {
  const players = Object.keys(container.players);
  const allPlayers = players;
  return allPlayers.some(
    (p) =>
      p.toLowerCase() === name.toLowerCase() ||
      (p.includes('*') && p.toLowerCase().includes(name.toLowerCase()))
  );
}

export function getPlayerData(name: string): PlayerData[] {
  const players = container.players;
  const allPlayers = Object.keys(players);
  const entries = allPlayers.filter((p) =>
    p.toLowerCase().includes(name.toLowerCase())
  );

  const data: PlayerData[] = entries.map((ent) => players[ent]);
  return data;
}

export function getPlayerKey(name: string, type: string): string {
  return type !== '0' ? `${name}*${type.toLowerCase()}` : name;
}
