import { container } from '@sapphire/framework';
import { PlayerData } from 'types/PlayerData';
import { ratings } from '@lib/assets/players.json';

export async function hasPlayer(
  userId: string,
  player: string
): Promise<boolean> {
  const userData = await container.db.getUserData(userId, ['club']);

  return Object.keys(userData!.club!).some((p) => p === player);
}

export function playerExists(name: string): boolean {
  const players = Object.keys(container.players);

  return players.some(
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
  return type ? `${name}*${type.toUpperCase()}` : name;
}
