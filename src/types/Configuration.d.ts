export interface DailyMarketPlayer {
  price: number;
  discount: number;
  player: string;
  image: string;
}

export interface BotConfiguration {
  clientId: string;
  dailyMarket: DailyMarketPlayer[];
}
