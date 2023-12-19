import { container } from '@sapphire/framework';
import type { PlayerData } from 'types/PlayerData';

export async function getPlayerCard(player: PlayerData): Promise<string> {
  let fileId: string;

  if (player.type !== '0') {
    switch (player.type.toUpperCase()) {
      case 'TYPE':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: 'TYPE FOLDER ID',
        });
        break;
    }
  } else {
    switch (player.rank.toUpperCase()) {
      case 'RANK':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: 'RANK FOLDER ID',
        });
        break;
    }
  }

  return `https://lh3.googleusercontent.com/d/${fileId!}`;
}
