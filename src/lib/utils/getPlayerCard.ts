import { container } from '@sapphire/framework';
import type { PlayerData } from 'types/PlayerData';
import { parentIds } from '@lib/assets/drive.json';

export async function getPlayerCard(player: PlayerData): Promise<string> {
  let fileId: string;

  if (player.type) {
    fileId = await container.drive.getFileId({
      fileName: `${player.name}.png`,
      parentId: parentIds.types[player.type],
    });
  } else {
    fileId = await container.drive.getFileId({
      fileName: `${player.name}.png`,
      parentId: parentIds.ratings[player.rating.toString()],
    });
  }

  return `https://lh3.googleusercontent.com/d/${fileId!}`;
}
