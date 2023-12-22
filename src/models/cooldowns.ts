import { model, Schema } from 'mongoose';
import { CooldownData } from 'types/CooldownData';

export const cooldowns = model(
  'cooldowns',
  new Schema<CooldownData>({
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    claim: {
      type: Object,
      default: {},
      required: true,
    },
    daily: {
      type: Object,
      default: {},
      required: true,
    },
    friendly: {
      type: Object,
      default: {},
      required: true,
    },
  })
);
