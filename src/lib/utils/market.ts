import { container } from '@sapphire/framework';
import type { PlayerData } from 'types/PlayerData';
import { getPlayerKey } from './players';
import { DailyMarketPlayer } from 'types/Configuration';
import { getPlayerCard } from './getPlayerCard';

export const refreshMarket = async () => {
  const players = Object.values(container.players).filter(
    (p) => p.rating >= 85
  );

  const pickedPlayers = [];
  for (let i = 0; i < 5; i++) {
    const plr = players[Math.floor(Math.random() * players.length)];
    if (pickedPlayers.includes(plr)) return i--;
    else pickedPlayers.push(plr);
  }

  const marketPlayers = pickedPlayers.map(async (p: PlayerData) => {
    const card = await getPlayerCard(p);

    return {
      price: p.value,
      discount: 15,
      player: getPlayerKey(p.name, p.type),
      image: card,
    };
  });

  container.db.updateDailyMarket(await Promise.all(marketPlayers));
};

export const getMarketPlayers = async (): Promise<DailyMarketPlayer[]> => {
  const data = await container.db.getBotConfigurationData(
    container.client.user.id,
    ['dailyMarket']
  );

  return data.dailyMarket;
};
