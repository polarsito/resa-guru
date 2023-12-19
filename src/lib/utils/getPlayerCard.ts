import { container } from '@sapphire/framework';
import type { PlayerData } from '../../types/PlayerData';

export async function getPlayerCard(player: PlayerData): Promise<string> {
  let fileId: string;

  if (player.type !== '0') {
    switch (player.type.toUpperCase()) {
      case 'BICN': // Base Legend
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1XYBS4C9AkNzBDIBxijmL5MFuAXHY_AIU',
        });
        break;

      case 'MICN': // Mid Legend
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1QDojed4ySM10nMJofyevu8lHMqs38sS2',
        });
        break;

      case 'PICN': // Prime Legend
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1V24HSgpEiVewieVOs3YcTs541iuLMQEM',
        });
        break;

      case 'POTM':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1V24HSgpEiVewieVOs3YcTs541iuLMQEM',
        });
        break;

      case 'HLP': // Helpers
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1Yj6BqMaA0bCR9LTbsjK2PeH1Z4LaWpQ0',
        });
        break;

      case 'FS':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1oST4QAbYjdxIf3WXB6jUx2ldGtbpkwGi',
        });
        break;

      case 'HR':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '11CotedtgABcFQUgG47_KvnNd-aD3Rm7J',
        });
        break;

      case 'HL':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '17NQzDdpPteCzw-ByclUtwmTaFl6W2t26',
        });
        break;

      case 'OTW':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1L54RK5qJJOToi1_Vh1C_ULL3tZe0IxpO',
        });
        break;

      case 'RB':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1Bknu2vGCpNJuqMSechfBmyvS75dJHtdm',
        });
        break;

      case 'BDAY':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1LFh1gFkeNOZpa1Bk6LjD0PETLoSRpsPa',
        });
        break;

      case 'FB':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1SaIbKJYYmjTsb9giq0zjslGcVB1oZ8sS',
        });
        break;

      case 'TOTW1':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1mh4PbycepAuTF2vpumW4ajwKLJxyACiP',
        });
        break;

      case 'TOTW2':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1M0EVlDdAL1iDIF06IENyTMOAsBybHW8z',
        });
        break;

      case 'TOTW3':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1h8cvX38CpcWJ7vJZBfWc77y_NHUwIMRk',
        });
        break;

      case 'TOTW4':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1DPgswlT3RcWXavmvkm7s0wFLoh58QMne',
        });
        break;

      case 'TOTW5':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-2XGbL8gpSLaG8TdOCdLL75ulQfw3b0o',
        });
        break;

      case 'TOTW6':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-4cNLiV4OruhyQu9ML_4CRatve-jRkZc',
        });
        break;

      case 'TOTW7':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-5jx1vjeFmmRekKi4_BpBr8q1GQ7eqLZ',
        });
        break;

      case 'TOTW8':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-GPYsBdgn5r7mCiX1rNRNhLVkFojiby-',
        });
        break;

      case 'TOTW9':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-HPa5Sfmj9BVwt2a4O4ErF_RyZ5NH9o5',
        });
        break;

      case 'TOTW10':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-J5pDPAc_RuqFukXDhCHjJTYr_FeEfLY',
        });
        break;

      case 'TOTW11':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-JAYnXMMvPykjzPk4vkJa3jwqDgg2i38',
        });
        break;

      case 'TOTW12':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-LVsqU6deHFFXz3cjlxNPA8qjrTmzrhV',
        });
        break;

      case 'TOTW13':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-V7wF_n1c_tgM17JZspkreVjcpG1p27_',
        });
        break;

      case 'TOTW14':
        fileId = await container.drive.getFileId({
          fileName: `${player.name}.png`,
          parentId: '1-Y76Qi3RQgHvw8oJHTl-K06XHlW2oDMy',
        });
        break;
    }
  } else {
    if (player.rating < 75)
      // Silvers
      fileId = await container.drive.getFileId({
        fileName: `${player.name}.png`,
        parentId: '1vjF6NxvyPCaSJNKq8uw3IOoS_P0CWJEW',
      });
    else if (player.rating >= 75)
      // Golds
      fileId = await container.drive.getFileId({
        fileName: `${player.name}.png`,
        parentId: '13dqA_vvVL1CntgSnsT_Xi2KrFpARnh7c',
      });
  }
  return `https://lh3.googleusercontent.com/d/${fileId!}`;
}
