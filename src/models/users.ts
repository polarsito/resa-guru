import { model, Schema } from 'mongoose';
import { UserData } from '../types/UserData';

export default model<UserData>(
  'users',
  new Schema({
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    money: {
      type: Number,
      default: 0,
    },
    club: {
      type: [String],
      default: [],
    },
    starters: {
      type: Object,
      default: {},
    },
    clubName: {
      type: String,
    },
    language: {
      type: String,
      default: 'en-US',
    },
  })
);
