import { model, Schema } from 'mongoose';
import { CooldownData } from '../types/CooldownData';

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
    },
    daily: {
      type: Object,
      default: {},
    },
    friendly: {
      type: Object,
      default: {},
    },
  })
);
