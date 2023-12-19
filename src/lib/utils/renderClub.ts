import { createCanvas, loadImage } from 'canvas';
import { AttachmentBuilder } from 'discord.js';
import { join } from 'path';
import type { PlayerData } from '../../types/PlayerData';
import players from '@lib/assets/players.json';
import specialPlayers from '@lib/assets/special_players.json';
import { abbreviateNumber } from './abbreviateNumber';

export async function renderClub(plrs: string[]): Promise<AttachmentBuilder[]> {
  let canvas = createCanvas(774, 645);
  let ctx = canvas.getContext('2d');

  let background = await loadImage(
    join(process.cwd(), 'images', 'club-background.png')
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px Calibri';

  let line = await loadImage(
    join(process.cwd(), 'images', 'club-table-line.png')
  );

  const pages =
    Math.floor(plrs.length / 10) * 10 < plrs.length
      ? Math.floor(plrs.length / 10) + 1
      : Math.floor(plrs.length / 10);

  let y: number = 190;
  const attachments: AttachmentBuilder[] = [];
  let t = 0;
  let addedPageMessage = false;
  for (let i = 1; i <= plrs.length; i++) {
    ctx.textAlign = 'start';
    const data: PlayerData = plrs[i - 1].includes('*')
      ? specialPlayers[plrs[i - 1]]
      : players[plrs[i - 1]];
    const actualPage = Math.floor(i / 10) + 1;

    if (!addedPageMessage) {
      addedPageMessage = true;

      ctx.font = 'bold 18px Calibri';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Page ${actualPage.toLocaleString()}/${pages.toLocaleString()}`,
        canvas.width / 2 - 15,
        115
      );
      ctx.font = 'bold 16px Calibri';
      ctx.textAlign = 'start';
    }

    if (i === 1) {
      ctx.fillText(
        data.name.length > 12 ? data.name.slice(0, 13) + '...' : data.name,
        122,
        y
      );
      ctx.textAlign = 'center';

      ctx.fillText(i.toString(), 100, y);
      ctx.fillText(data.league, 287, y);
      ctx.fillText(data.position, 377, y);
      ctx.fillText(data.rating.toString(), 465, y);
      ctx.fillText(abbreviateNumber(data.value), 541, y);
      ctx.fillText(abbreviateNumber(Math.round(data.value * 0.55)), 603, y);
      ctx.fillText(data.type, 662, y);

      y += 14;
      if (plrs.length > i + 1) ctx.drawImage(line, 77, y, 621, 1);
      t++;
    } else {
      y += 26;
      ctx.fillText(data.name, 122, y);
      ctx.textAlign = 'center';

      ctx.fillText(i.toString(), 100, y);
      ctx.fillText(data.league, 287, y);
      ctx.fillText(data.position, 377, y);
      ctx.fillText(data.rating.toString(), 465, y);
      ctx.fillText(abbreviateNumber(data.value), 541, y);
      ctx.fillText(abbreviateNumber(Math.round(data.value * 0.55)), 603, y);
      ctx.fillText(data.type, 662, y);

      y += 14;
      if (plrs.length > i && i % 10 !== 0) ctx.drawImage(line, 77, y, 621, 1);
      t++;
    }

    if (t === 10) {
      attachments.push(
        new AttachmentBuilder(canvas.toBuffer(), {
          name: 'club.png',
        })
      );

      t = 0;
      y = 190 - 26;
      addedPageMessage = false;
      canvas = createCanvas(774, 645);
      ctx = canvas.getContext('2d');

      background = await loadImage(
        join(process.cwd(), 'images', 'club-background.png')
      );
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Calibri';

      line = await loadImage(
        join(process.cwd(), 'images', 'club-table-line.png')
      );
    } else if (i === plrs.length) {
      attachments.push(
        new AttachmentBuilder(canvas.toBuffer(), {
          name: 'club.png',
        })
      );
    }
  }

  return attachments;
}
