import { container } from '@sapphire/framework';
import { bot } from '@config';
import { toLocaleString } from './toLocaleString';

export const getTaskProgress = async (
  userId: string,
  amount: number,
  target: number
) => {
  const splits = Math.floor(target / 5);
  const progress = amount <= target ? Math.floor(amount / splits) : target;
  let progressBar = '';

  const emojis = bot.emojis;
  const { start, bar, right_border, no_bar } = emojis.progress_bar;
  for (let i = 1; i <= progress; i++) {
    switch (i) {
      case 5:
        progressBar += right_border;
        break;

      default:
        progressBar += bar;
    }
  }

  if (progress < 5) {
    for (let i = 0; i < 5 - progress; i++) {
      progressBar += no_bar;
    }
  }
  let percentage: string | number = ((amount / target) * 100).toFixed();
  percentage =
    percentage.split('.')[1] === '0' ? percentage.split('.')[0] : percentage;
  percentage = Number(percentage.split('.')[0]) > 100 ? 100 : percentage;

  let result = `${
    emojis.union
  }${start}${progressBar}${no_bar}\`${toLocaleString(amount)}/${toLocaleString(
    target
  )} (${percentage}%)\``;
  if (percentage === 100) result += ' *(Completed)*';

  return result;
};

export const getClaimedRanksB = async (userId: string, claims: number) => {
  const data = await container.db.getPlayerTasks(userId);
  const players = data.claims.players;
  const ranks = ['B', 'B+', 'A-', 'A', 'A+', 'X-', 'X', 'X+', 'S'];

  const claimed = Object.keys(players)
    .filter((ra) => ranks.includes(ra))
    .map((k) => players[k])
    .reduce((a, b) => a + b);

  return claimed;
};
