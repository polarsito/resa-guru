import { TasksProgress } from './Stats';

export interface UserData {
  userId: string;
  money: number;
  club: string[];
  starters: object;
  clubName?: string;
  language?: string;
  tasks: TasksProgress;
}
