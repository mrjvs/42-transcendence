export interface IGame {
  user_id_req: string;
  user_id_acpt: string;
  points_req: number;
  points_acpt: number;
  add_ons?: string;
  game_type?: string;
  winner_id?: string;
}
