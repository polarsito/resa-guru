import { Ranks } from './PlayerData';

export type TasksClaimsPlayers = {
  [key in Ranks]: number;
};

export interface Stats {
  claims: {
    total: number;
    players: {
      [key in Ranks]: number;
    };
  };
  matchWins: number;
  scoredPens: number;
}
