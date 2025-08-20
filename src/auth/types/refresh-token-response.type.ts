import type { User } from "./user.type";

export interface RefreshTokenResponse {
  accessToken: string;
  user: User;
}
