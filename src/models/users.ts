import { model, Schema } from 'mongoose';
import { UserData } from 'types/UserData';
import type { Stats } from 'types/Stats';

const tasksSchema = new Schema<Stats>(
  {
    claims: {
      total: {
        type: Number,
        default: 0,
      },
      players: {
        type: Schema.Types.Map,
        default: {},
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

const userSchema = new Schema({
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
    type: [String],
    default: [],
    required: true,
  },
  starters: {
    type: Object,
    default: {},
    required: true,
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
