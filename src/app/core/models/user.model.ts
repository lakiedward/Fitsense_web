export interface User {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
}
