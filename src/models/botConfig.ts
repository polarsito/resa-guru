import { Schema, model } from 'mongoose';
import { BotConfiguration, DailyMarketPlayer } from 'types/Configuration';

const dailyMarketPlayerSchema = new Schema<DailyMarketPlayer>({
  price: { type: Number, required: true },
  discount: { type: Number, required: true },
  player: { type: String, required: true },
});

export default model<BotConfiguration>(
  'botConfig',
  new Schema({
    clientId: {
      type: String,
      unique: true,
      required: true,
    },
    dailyMarket: {
      type: [dailyMarketPlayerSchema],
      default: [],
      required: true,
    },
  })
);
