import { model, Schema } from 'mongoose';
import { InventoryData, UserData } from 'types/UserData';
import type { Stats } from 'types/Stats';

const tasksSchema = new Schema<Stats>(
  {
    claims: {
      total: {
        type: Number,
        default: 0,
      },
      players: {
        type: Array,
        default: [],
      },
    },
    matchWins: {
      type: Number,
      default: 0,
    },
    scoredPens: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const inventorySchema = new Schema<InventoryData>({
  packs: Object,
});

const userSchema = new Schema<UserData>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  money: {
    type: Number,
    default: 0,
    required: true,
  },
  club: {
    type: Object,
    default: {},
    required: true,
  },
  starters: {
    type: Object,
    default: {},
    required: true,
  },
  inventory: {
    type: inventorySchema,
    required: true,
    default: () => ({}),
  },
  clubName: {
    type: String,
  },
  language: {
    type: String,
    default: 'en-US',
    required: true,
  },
  stats: {
    type: tasksSchema,
    default: () => ({}),
    required: true,
  },
});

export default model<UserData>('users', userSchema);
