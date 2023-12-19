type Ranks =
  | 'E+'
  | 'D-'
  | 'D'
  | 'D+'
  | 'C-'
  | 'C'
  | 'C+'
  | 'B-'
  | 'B'
  | 'B+'
  | 'A-'
  | 'A'
  | 'A+'
  | 'X-'
  | 'X'
  | 'X+'
  | 'S';

type Tiers = 'T1' | 'T2' | 'T3';
type Positions = 'GK' | 'CB' | 'CM' | 'ST';

export type Players = {
  [key: string]: PlayerData;
};

export type PlayerData = {
  name: string;
  rank: Ranks;
  rating: number;
  tier: Tiers;
  position: Positions;
  nation: string;
  club: string;
  type: string;
  value: number;
  exclusive?: boolean;
};
