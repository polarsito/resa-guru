import { createCanvas, loadImage } from 'canvas';
import { AttachmentBuilder } from 'discord.js';
import { join } from 'path';
import type { PlayerData } from '../../types/PlayerData';
import players from '@lib/assets/players.json';
import specialPlayers from '@lib/assets/special_players.json';
import { getPlayerCard } from './getPlayerCard';
import { getPlayerKey } from './players';
import { toLocaleString } from './toLocaleString';
import { getTeamChemistry } from './chemistry';

export async function renderXI(
  userId: string,
  username: string,
  starters: object
): Promise<AttachmentBuilder> {
  const canvas = createCanvas(869, 806);
  const ctx = canvas.getContext('2d');

  const background = await loadImage(
    join(process.cwd(), 'images', 'xi-background.png')
  );
  ctx.drawImage(background, 0, 0);

  ctx.font = 'italic bold 18px Arial';
  ctx.fillStyle = '#000';

  ctx.fillText(
    username.length > 12 ? username.slice(0, 13) + '...' : username,
    60,
    35
  );

  const keys: string[] = Object.keys(starters);
  const values: string[] = Object.values(starters);

  // @ts-ignore
  const ovrValue = toLocaleString(
    values
      .map((k) => (k.includes('*') ? specialPlayers[k] : players[k])?.value!)
      .reduce((a, b) => a + b)
  );

  const ovrRating = toLocaleString(
    values
      .map((k) => (k.includes('*') ? specialPlayers[k] : players[k])?.rating!)
      .reduce((a, b) => a + b)
  );

  ctx.textAlign = 'center';
  ctx.fillText(ovrValue ?? '?', 288, 45);
  ctx.fillText(ovrRating ?? '?', 577, 45);

  const teamChemistry = await getTeamChemistry(userId);
  const teamChemistryValue = Object.values(teamChemistry).reduce(
    (a, b) => a + b
  );

  ctx.fillText(teamChemistryValue > 100 ? 100 : teamChemistryValue, 718, 45);

  const startersData: object = {};
  keys.forEach((key) => {
    if (starters[key])
      startersData[key] = starters[key].includes('*')
        ? specialPlayers[starters[key]]
        : players[starters[key]];
  });

  const startersKeys = Object.keys(startersData);
  let chemPoints = 0;
  chemPoints = chemPoints;

  ctx.lineWidth = 5;
  const cards: object = {};
  const bases: object = {};
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const playerName = starters[key];
    const playerData: PlayerData = Object.values(startersData).find(
      (p) => getPlayerKey(p.name, p.type) === playerName
    );
    if (!playerData) continue;

    const cardImage = await getPlayerCard(playerData);
    const card = await loadImage(cardImage);
    switch (key) {
      case '1':
        if (startersKeys.includes('3')) {
          const player3 = startersData['3'];
          let plrPoints = checkChemistry(startersData['1'], player3);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;

          ctx.moveTo(362 + 75, 598 + 205 - 11);
          ctx.lineTo(210 + 75, 562 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        if (startersKeys.includes('4')) {
          const player4 = startersData['4'];
          let plrPoints = checkChemistry(startersData['1'], player4);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(362 + 75, 598 + 205 - 11);
          ctx.lineTo(508 + 75, 562 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['1'] = { img: card, x: 362, y: 598 };
        break;

      case '2':
        if (startersKeys.includes('3')) {
          const player3 = startersData['3'];
          let plrPoints = checkChemistry(startersData['2'], player3);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(28 + 75, 562 + 205 - 11);
          ctx.lineTo(210 + 75, 562 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        if (startersKeys.includes('6')) {
          const player6 = startersData['6'];
          let plrPoints = checkChemistry(startersData['2'], player6);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(28 + 75, 562 + 205 - 11);
          ctx.lineTo(140 + 75, 354 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['2'] = { img: card, x: 28, y: 562 };
        break;

      case '3':
        if (startersKeys.includes('4')) {
          const player4 = startersData['4'];
          let plrPoints = checkChemistry(startersData['3'], player4);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(210 + 75, 562 + 205 - 11);
          ctx.lineTo(508 + 75, 562 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        if (startersKeys.includes('7')) {
          const player7 = startersData['7'];
          let plrPoints = checkChemistry(startersData['3'], player7);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(210 + 75, 562 + 205 - 11);
          ctx.lineTo(362 + 75, 356 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['3'] = { img: card, x: 210, y: 562 };
        break;

      case '4':
        if (startersKeys.includes('7')) {
          const player7 = startersData['7'];
          let plrPoints = checkChemistry(startersData['4'], player7);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(508 + 75, 562 + 205 - 11);
          ctx.lineTo(362 + 75, 356 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        if (startersKeys.includes('5')) {
          const player5 = startersData['5'];
          let plrPoints = checkChemistry(startersData['4'], player5);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(508 + 75, 562 + 205 - 11);
          ctx.lineTo(688 + 75, 562 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['4'] = { img: card, x: 508, y: 562 };
        break;

      case '5':
        if (startersKeys.includes('8')) {
          const player8 = startersData['8'];
          let plrPoints = checkChemistry(startersData['5'], player8);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(688 + 75, 562 + 205 - 11);
          ctx.lineTo(580 + 75, 354 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['5'] = { img: card, x: 688, y: 562 };
        break;

      case '6':
        if (startersKeys.includes('7')) {
          const player7 = startersData['7'];
          let plrPoints = checkChemistry(startersData['6'], player7);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(140 + 75, 354 + 205 - 11);
          ctx.lineTo(362 + 75, 356 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        if (startersKeys.includes('9')) {
          const player9 = startersData['9'];
          let plrPoints = checkChemistry(startersData['6'], player9);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowBlur = 5;
          ctx.shadowColor = color;
          ctx.moveTo(140 + 75, 354 + 205 - 11);
          ctx.lineTo(39 + 75, 148 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['6'] = { img: card, x: 140, y: 354 };
        break;

      case '7':
        if (startersKeys.includes('8')) {
          const player8 = startersData['8'];
          let plrPoints = checkChemistry(startersData['7'], player8);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowBlur = 5;
          ctx.shadowColor = color;
          ctx.moveTo(362 + 75, 356 + 205 - 11);
          ctx.lineTo(580 + 75, 354 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        if (startersKeys.includes('10')) {
          const player10 = startersData['10'];
          let plrPoints = checkChemistry(startersData['7'], player10);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(362 + 75, 356 + 205 - 11);
          ctx.lineTo(362 + 75, 103 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['7'] = { img: card, x: 362, y: 356 };
        break;

      case '8':
        if (startersKeys.includes('11')) {
          const player11 = startersData['11'];
          let plrPoints = checkChemistry(startersData['8'], player11);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 5;
          ctx.moveTo(580 + 75, 354 + 205 - 11);
          ctx.lineTo(681 + 75, 148 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['8'] = { img: card, x: 580, y: 354 };
        break;

      case '9':
        if (startersKeys.includes('10')) {
          const player10 = startersData['10'];
          let plrPoints = checkChemistry(startersData['9'], player10);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.shadowBlur = 5;
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.moveTo(39 + 75, 148 + 205 - 11);
          ctx.lineTo(362 + 75, 103 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['9'] = { img: card, x: 39, y: 148 };
        break;

      case '10':
        if (startersKeys.includes('11')) {
          const player11 = startersData['11'];
          let plrPoints = checkChemistry(startersData['10'], player11);
          chemPoints += plrPoints;

          ctx.beginPath();
          let color =
            plrPoints === 1 ? '#f59622' : plrPoints === 0 ? '#c32643' : 'green';
          ctx.strokeStyle = color;
          ctx.shadowBlur = 5;
          ctx.shadowColor = color;
          ctx.moveTo(362 + 75, 103 + 205 - 11);
          ctx.lineTo(681 + 75, 148 + 205 - 11);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.shadowBlur = 0;
        cards['10'] = { img: card, x: 362, y: 103 };
        break;

      case '11':
        ctx.shadowBlur = 0;
        cards['11'] = { img: card, x: 681, y: 148 };
        break;
    }

    for (let x = 0; x < 11; x++) {
      const pos = await loadImage(
        join(process.cwd(), 'images', 'positions', `${x + 1}.png`)
      );

      switch (x + 1) {
        case 1:
          bases['1'] = { img: pos, x: -3.5, y: 0 };
          break;

        case 2:
          bases['2'] = { img: pos, x: -2, y: 0 };
          break;

        case 3:
          bases['3'] = { img: pos, x: -2.5, y: 2 };
          break;

        case 4:
          bases['4'] = { img: pos, x: 0.5, y: 2 };
          break;

        case 5:
          bases['5'] = { img: pos, x: -3, y: 2 };
          break;

        case 6:
          bases['6'] = { img: pos, x: -0.7, y: 5.5 };
          break;

        case 7:
          bases['7'] = { img: pos, x: -1, y: 6.5 };
          break;

        case 8:
          bases['8'] = { img: pos, x: 0.2, y: 5.5 };
          break;

        case 9:
          bases['9'] = { img: pos, x: -1, y: -1 };
          break;

        case 10:
          bases['10'] = { img: pos, x: 1, y: 2.5 };
          break;

        case 11:
          bases['11'] = { img: pos, x: -2.5, y: -2.5 };
          break;
      }
    }
  }

  Object.values(bases).forEach((base) => {
    ctx.drawImage(base.img, base.x, base.y, 869, 806);
  });

  Object.values(cards).forEach((card) => {
    ctx.drawImage(card.img, card.x, card.y, 150, 205);
  });

  const attachment = new AttachmentBuilder(canvas.toBuffer(), {
    name: 'XI.png',
  });
  return attachment;
}

function checkChemistry(plr1: PlayerData, plr2: PlayerData): number {
  let plrPoints = 0;

  if (plr1.club === 'ICN' || plr2.club === 'ICN') {
    if (plr1.club === 'ICN' && plr2.club === 'ICN') plrPoints += 3;
    else if (plr1.nation === plr2.nation) plrPoints += 3;
    else plrPoints++;
  } else if (plr1.type === 'HR' || plr2.type === 'HR') {
    if (plr1.nation === plr2.nation && plr1.league !== plr2.league) plrPoints++;
    else if (plr1.nation === plr2.nation && plr1.league === plr2.league)
      plrPoints += 3;
    else if (plr1.league === plr2.league && plr1.nation !== plr2.nation)
      plrPoints += 3;
  } else {
    if (plr1.league === plr2.league) plrPoints++;
    if (plr1.nation === plr2.nation) plrPoints++;
    if (plr1.club === plr2.club) plrPoints++;
  }

  return plrPoints;
}
