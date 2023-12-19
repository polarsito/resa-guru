interface CooldownOptions {
  cooldown: boolean;
  date: number;
}

export interface CooldownData {
  userId: string;
  claim: CooldownOptions;
  daily: CooldownOptions;
  friendly: CooldownOptions;
}
