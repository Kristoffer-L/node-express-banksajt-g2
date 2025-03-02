export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Account {
  id: string;
  user_id: User["id"];
  balance: number;
}

export interface Session {
  id: string;
  user_id: User["id"];
  token: string;
}
