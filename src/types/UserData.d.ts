import { Stats } from './Stats';

interface PlayerStats {
  level: number;
  xp: number;
}

export interface ClubData {
  [key: string]: PlayerStats;
}

export interface UserData {
  userId: string;
  money: number;
  club: ClubData;
  inventory: InventoryData;
  starters: object;
  clubName?: string;
  language?: string;
  stats: Stats;
}

export interface InventoryData {
  packs: object;
}
