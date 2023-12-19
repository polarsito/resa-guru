import type { PlayerData } from '../../types/PlayerData';
import { container } from '@sapphire/framework';

export async function getTeamChemistry(userId: string): Promise<object> {
  const data = await container.db.getUserData(userId, ['starters']);
  let starters = data.starters;
  if (!starters) starters = {};

  const teamChemistry: object = {};

  Object.keys(starters).forEach((key) => {
    let links: string[] = [];
    const plrData = container.players[starters[key]];
    let playerChem = 0;

    switch (key) {
      case '1':
        if (starters['3']) {
          const data3 = container.players[starters['3']];
          links[0] = getChemistry(plrData, data3);
        }

        if (starters['4']) {
          const data4 = container.players[starters['4']];
          links[1] = getChemistry(plrData, data4);
        }

        if (plrData.position === 'GK') playerChem += 4;
        else playerChem += 1;

        if (links.some((l) => l === 'orange') && links.some((l) => l === 'red'))
          playerChem += 3;
        else if (
          links.some((l) => l === 'orange') &&
          !links.some((l) => l === 'red' || l === 'green')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'orange') &&
          links.some((l) => l === 'green')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'green') &&
          !links.some((l) => l === 'red' || l === 'orange')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'green') &&
          links.some((l) => l === 'red')
        )
          playerChem += 6;
        break;

      case '2':
        if (starters['3']) {
          const data3 = container.players[starters['3']];
          links[0] = getChemistry(plrData, data3);
        }

        if (starters['6']) {
          const data6 = container.players[starters['6']];
          links[1] = getChemistry(plrData, data6);
        }

        if (plrData.position === 'CB') playerChem += 4;
        else playerChem += 1;

        if (links.some((l) => l === 'orange') && links.some((l) => l === 'red'))
          playerChem += 3;
        else if (
          links.some((l) => l === 'orange') &&
          !links.some((l) => l === 'red' || l === 'green')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'orange') &&
          links.some((l) => l === 'green')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'green') &&
          !links.some((l) => l === 'red' || l === 'orange')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'red') &&
          links.some((l) => l === 'green')
        )
          playerChem += 6;
        break;

      case '3':
        if (starters['1']) {
          const data1 = container.players[starters['1']];
          links[0] = getChemistry(plrData, data1);
        }

        if (starters['2']) {
          const data2 = container.players[starters['2']];
          links[1] = getChemistry(plrData, data2);
        }

        if (starters['4']) {
          const data4 = container.players[starters['4']];
          links[2] = getChemistry(plrData, data4);
        }

        if (starters['7']) {
          const data7 = container.players[starters['7']];
          links[3] = getChemistry(plrData, data7);
        }

        if (plrData.position === 'CB') playerChem += 4;
        else playerChem += 1;

        const orange = links.filter((k) => k === 'orange').length;
        const green = links.filter((k) => k === 'green').length;
        const red = links.filter((k) => k === 'red').length;

        if ((orange === 1 && red === 3) || (green === 3 && red === 3))
          playerChem += 3;
        else if (red === 2 && orange === 2) playerChem += 5;
        else if (
          (red === 1 && orange === 3) ||
          orange === 4 ||
          (orange === 3 && green === 1) ||
          (orange === 2 && green === 2) ||
          (orange === 1 && green === 3) ||
          green === 4 ||
          (green === 3 && red === 1) ||
          (green === 2 && red === 2) ||
          (orange === 1 && green === 2 && red === 1) ||
          (orange === 2 && red === 1 && green === 1)
        )
          playerChem += 6;
        break;

      case '4':
        if (starters['1']) {
          const data1 = container.players[starters['1']];
          links[0] = getChemistry(plrData, data1);
        }

        if (starters['3']) {
          const data3 = container.players[starters['3']];
          links[1] = getChemistry(plrData, data3);
        }

        if (starters['5']) {
          const data5 = container.players[starters['5']];
          links[2] = getChemistry(plrData, data5);
        }

        if (starters['7']) {
          const data7 = container.players[starters['7']];
          links[3] = getChemistry(plrData, data7);
        }

        if (plrData.position === 'CB') playerChem += 4;
        else playerChem += 1;

        const orange4 = links.filter((k) => k === 'orange').length;
        const green4 = links.filter((k) => k === 'green').length;
        const red4 = links.filter((k) => k === 'red').length;

        if ((orange4 === 1 && red4 === 3) || (green4 === 3 && red4 === 3))
          playerChem += 3;
        else if (red4 === 2 && orange4 === 2) playerChem += 5;
        else if (
          (red4 === 1 && orange4 === 3) ||
          orange4 === 4 ||
          (orange4 === 3 && green4 === 1) ||
          (orange4 === 2 && green4 === 2) ||
          (orange4 === 1 && green4 === 3) ||
          green4 === 4 ||
          (green4 === 3 && red4 === 1) ||
          (green4 === 2 && red4 === 2) ||
          (orange4 === 1 && green4 === 2 && red4 === 1) ||
          (orange4 === 2 && red4 === 1 && green4 === 1)
        )
          playerChem += 6;
        break;

      case '5':
        if (starters['4']) {
          const data4 = container.players[starters['4']];
          links[0] = getChemistry(plrData, data4);
        }

        if (starters['8']) {
          const data8 = container.players[starters['8']];
          links[1] = getChemistry(plrData, data8);
        }

        if (plrData.position === 'CB') playerChem += 4;
        else playerChem += 1;

        if (links.some((l) => l === 'orange') && links.some((l) => l === 'red'))
          playerChem += 3;
        else if (
          links.some((l) => l === 'orange') &&
          !links.some((l) => l === 'red' || l === 'green')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'orange') &&
          links.some((l) => l === 'green')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'green') &&
          !links.some((l) => l === 'red' || l === 'orange')
        )
          playerChem += 6;
        else if (
          links.some((l) => l === 'red') &&
          links.some((l) => l === 'green')
        )
          playerChem += 6;
        break;

      case '6':
        if (starters['2']) {
          const data2 = container.players[starters['2']];
          links[0] = getChemistry(plrData, data2);
        }

        if (starters['7']) {
          const data7 = container.players[starters['7']];
          links[1] = getChemistry(plrData, data7);
        }

        if (starters['9']) {
          const data9 = container.players[starters['9']];
          links[2] = getChemistry(plrData, data9);
        }

        if (plrData.position === 'CM') playerChem += 4;
        else playerChem += 1;

        const orange6 = links.filter((k) => k === 'orange').length;
        const green6 = links.filter((k) => k === 'green').length;
        const red6 = links.filter((k) => k === 'red').length;

        if ((orange6 === 2 && red6 === 1) || (green6 === 1 && red6 === 2))
          playerChem += 3;
        else if (
          orange6 === 3 ||
          (orange6 === 2 && green6 === 1) ||
          (green6 === 2 && orange6 === 1) ||
          green6 === 3 ||
          (green6 === 2 && red6 === 1) ||
          (green6 === 1 && red6 === 1 && orange6 === 1)
        )
          playerChem += 6;
        break;

      case '7':
        if (starters['3']) {
          const data3 = container.players[starters['3']];
          links[0] = getChemistry(plrData, data3);
        }

        if (starters['4']) {
          const data4 = container.players[starters['4']];
          links[1] = getChemistry(plrData, data4);
        }

        if (starters['6']) {
          const data6 = container.players[starters['6']];
          links[2] = getChemistry(plrData, data6);
        }

        if (starters['8']) {
          const data8 = container.players[starters['8']];
          links[3] = getChemistry(plrData, data8);
        }

        if (starters['10']) {
          const data10 = container.players[starters['10']];
          links[4] = getChemistry(plrData, data10);
        }

        if (plrData.position === 'ST') playerChem += 4;
        else playerChem += 1;

        const orange7 = links.filter((k) => k === 'orange').length;
        const green7 = links.filter((k) => k === 'green').length;
        const red7 = links.filter((k) => k === 'red').length;

        if (orange7 === 1 && red7 === 4) playerChem += 1;
        else if (red7 === 3 && orange7 === 2) playerChem += 2;
        else if (
          (red7 === 2 && orange7 === 3) ||
          (green7 === 1 && red7 === 4) ||
          (red7 === 3 && green7 === 1 && orange7 === 1) ||
          (orange7 === 2 && red7 === 2 && green7 === 1)
        )
          playerChem += 3;
        else if (red7 === 1 && orange7 === 4) playerChem += 5;
        else if (
          orange7 === 5 ||
          (orange7 === 4 && green7 === 1) ||
          (orange7 === 3 && green7 === 2) ||
          (green7 === 3 && orange7 === 2) ||
          (green7 === 4 && orange7 === 1) ||
          green7 === 5 ||
          (green7 === 4 && red7 === 1) ||
          (green7 === 3 && red7 === 2) ||
          (green7 === 2 && red7 === 3) ||
          (green7 === 3 && red7 === 1 && orange7 === 1) ||
          (orange7 === 3 && green7 === 1 && red7 === 1) ||
          (green7 === 2 && red7 === 2 && orange7 === 1) ||
          (green7 === 2 && orange7 === 2 && red7 === 1)
        )
          playerChem += 6;
        break;

      case '8':
        if (starters['5']) {
          const data5 = container.players[starters['5']];
          links[0] = getChemistry(plrData, data5);
        }

        if (starters['7']) {
          const data7 = container.players[starters['7']];
          links[1] = getChemistry(plrData, data7);
        }

        if (starters['11']) {
          const data11 = container.players[starters['11']];
          links[2] = getChemistry(plrData, data11);
        }

        if (plrData.position === 'CM') playerChem += 4;
        else playerChem += 1;

        const orange8 = links.filter((k) => k === 'orange').length;
        const green8 = links.filter((k) => k === 'green').length;
        const red8 = links.filter((k) => k === 'red').length;

        if ((orange8 === 2 && red8 === 1) || (green8 === 1 && red8 === 2))
          playerChem += 3;
        else if (
          orange8 === 3 ||
          (orange8 === 2 && green8 === 1) ||
          (green8 === 2 && orange8 === 1) ||
          green8 === 3 ||
          (green8 === 2 && red8 === 1) ||
          (green8 === 1 && red8 === 1 && orange8 === 1)
        )
          playerChem += 6;
        break;

      case '9':
        if (starters['6']) {
          const data6 = container.players[starters['6']];
          links[0] = getChemistry(plrData, data6);
        }

        if (starters['10']) {
          const data10 = container.players[starters['10']];
          links[1] = getChemistry(plrData, data10);
        }

        if (plrData.position === 'ST') playerChem += 4;
        else playerChem += 1;

        const orange9 = links.filter((k) => k === 'orange').length;
        const green9 = links.filter((k) => k === 'green').length;
        const red9 = links.filter((k) => k === 'red').length;

        if (red9 === 1 && orange9 === 1) playerChem += 3;
        else if (
          orange9 === 2 ||
          (orange9 === 1 && green9 === 1) ||
          green9 === 2 ||
          (green9 === 1 && red9 === 1)
        )
          playerChem += 6;
        break;

      case '10':
        if (starters['9']) {
          const data9 = container.players[starters['9']];
          links[0] = getChemistry(plrData, data9);
        }

        if (starters['7']) {
          const data7 = container.players[starters['7']];
          links[1] = getChemistry(plrData, data7);
        }

        if (starters['11']) {
          const data11 = container.players[starters['11']];
          links[2] = getChemistry(plrData, data11);
        }

        if (plrData.position === 'ST') playerChem += 4;
        else playerChem += 1;

        const orange10 = links.filter((k) => k === 'orange').length;
        const green10 = links.filter((k) => k === 'green').length;
        const red10 = links.filter((k) => k === 'red').length;

        if ((orange10 === 2 && red10 === 1) || (green10 === 1 && red10 === 2))
          playerChem += 3;
        else if (
          orange10 === 3 ||
          (orange10 === 2 && green10 === 1) ||
          (green10 === 2 && orange10 === 1) ||
          green10 === 3 ||
          (green10 === 2 && red10 === 1) ||
          (green10 === 1 && orange10 === 1 && red10 === 1)
        )
          playerChem += 6;
        break;

      case '11':
        if (starters['8']) {
          const data8 = container.players[starters['8']];
          links[0] = getChemistry(plrData, data8);
        }

        if (starters['10']) {
          const data10 = container.players[starters['10']];
          links[1] = getChemistry(plrData, data10);
        }

        if (plrData.position === 'ST') playerChem += 4;
        else playerChem += 1;

        const orange11 = links.filter((k) => k === 'orange').length;
        const green11 = links.filter((k) => k === 'green').length;
        const red11 = links.filter((k) => k === 'red').length;

        if (red11 === 1 && orange11 === 1) playerChem += 3;
        else if (
          orange11 === 2 ||
          (orange11 === 1 && green11 === 1) ||
          green11 === 2 ||
          (green11 === 1 && red11 === 1)
        )
          playerChem += 6;
        break;
    }

    teamChemistry[key] = playerChem;
  });

  function getChemistry(plr1: PlayerData, plr2: PlayerData): string {
    let link: string;

    if (plr1.club === 'ICN' || plr2.club === 'ICN') {
      if (plr1.club === 'ICN' && plr2.club === 'ICN') link = 'green';
      else if (plr1.nation !== plr2.nation) link = 'orange';
      else if (plr1.nation === plr2.nation) link = 'green';
      else link = 'orange';
    } else if (plr1.type === 'HR' || plr2.type === 'HR') {
      if (plr1.tier !== plr2.tier && plr1.nation === plr2.nation)
        link = 'orange';
      else if (plr1.tier === plr2.tier && plr1.nation === plr2.nation)
        link = 'green';
      else if (plr1.nation !== plr2.nation && plr1.tier === plr2.tier)
        link = 'green';
      else link = 'red';
    } else if (
      plr1.club === plr2.club ||
      (plr1.nation === plr2.nation && plr1.tier === plr2.tier)
    )
      link = 'green';
    else if (plr1.nation === plr2.nation || plr1.tier === plr2.tier)
      link = 'orange';
    else link = 'red';

    return link;
  }

  return teamChemistry;
}
