import { RowDataPacket } from "mysql2";

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

export interface UserRow extends RowDataPacket {
  id: User["id"];
  username: User["username"];
  password: User["password"];
}

export interface AccountRow extends RowDataPacket {
  id: Account["id"];
  user_id: Account["user_id"];
  balance: Account["balance"];
}

export interface SessionRow extends RowDataPacket {
  id: Session["id"];
  user_id: Session["user_id"];
  token: Session["token"];
}
