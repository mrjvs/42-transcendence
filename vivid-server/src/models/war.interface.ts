import { IWarTime } from './war_time.interface';

export interface IWar {
  requestingGuild: string;
  acceptingGuild: string;
  start_date: Date;
  end_date: Date;
  prize_points: number;
  war_time: IWarTime[];
  time_to_answer: number;
  max_unanswered: number;
  add_on: string;
}
