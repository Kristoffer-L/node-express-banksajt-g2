import express, { Application, Request, Response } from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import {
  User,
  Account,
  Session,
  UserRow,
  SessionRow,
  AccountRow,
} from "./types";

// Skapa en anslutning till databasen
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "banksajt",
  port: 3306,
});

const app: Application = express();
const port: number = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Generera engångslösenord
function generateOTP(): string {
  // Generera en sexsiffrig numerisk OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Din kod här. Skriv dina arrayer
/*
const users: User[] = [];
const accounts: Account[] = [];
const sessions: Session[] = [];
*/
// Din kod här. Skriv dina routes:

//Skapa användare (POST): "/users"
app.post(
  "/users",
  async (
    req: Request<
      {},
      {},
      {
        username: string | undefined;
        password: string | undefined;
      },
      {}
    >,
    res: Response<
      | {
          user: { username: string };
          account: { balance: number };
        }
      | { error: string }
    >
  ) => {
    const { password, username } = req.body;

    if (
      !username ||
      typeof username !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        error: "Användarnamn och lösenord krävs",
      });
      return;
    }

    try {
      await pool.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, password]
      );
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    try {
      await pool.execute(
        "INSERT INTO accounts(user_id) values ((SELECT id FROM users WHERE username = ?))",
        [username]
      );
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    res.status(201).json({
      user: {
        username,
      },
      account: {
        balance: 0,
      },
    });
  }
);
//Logga in (POST): "/sessions"
app.post(
  "/sessions",
  async (
    req: Request<
      {},
      {},
      { username: string | undefined; password: string | undefined },
      {}
    >,
    res: Response<{ token: string } | { error: string }>
  ) => {
    const { username, password } = req.body;

    if (
      !username ||
      typeof username !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        error: "Användarnamn och lösenord krävs",
      });
      return;
    }

    let user: User | null = null;

    try {
      const [users] = await pool.query<UserRow[]>(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        [username, password]
      );

      user = users[0];
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    if (!user) {
      res.status(401).json({
        error: "Fel användarnamn eller lösenord",
      });
      return;
    }

    const token = generateOTP();

    try {
      await pool.execute(
        "INSERT INTO sessions (user_id, token) VALUES (?, ?)",
        [user.id, token]
      );
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    res.status(201).json({
      token: token,
    });
  }
);

//Visa salodo (POST): "/me/accounts"
app.post(
  "/me/accounts",
  async (
    req: Request<
      {},
      {},
      {},
      {
        headers: {
          authorization: string | undefined;
        };
      }
    >,
    res: Response<{ balance: number } | { error: string }>
  ) => {
    const bearer = req.headers.authorization;

    if (!bearer) {
      res.status(401).json({
        error: "Du måste logga in för att se ditt saldo",
      });
      return;
    }

    const token = bearer.split(" ")[1];

    if (!token) {
      res.status(401).json({
        error: "Du måste logga in för att se ditt saldo",
      });
      return;
    }

    let session: Session | null = null;

    try {
      const [sessions] = await pool.execute<SessionRow[]>(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );

      session = sessions[0];
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    if (!session) {
      res.status(401).json({
        error: "Ogiltig token",
      });
      return;
    }

    let account: Account | null = null;

    try {
      const [accounts] = await pool.execute<AccountRow[]>(
        "SELECT * FROM accounts WHERE user_id = ?",
        [session.user_id]
      );

      account = accounts[0];
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    if (!account) {
      res.status(404).json({
        error: "Kontot kunde inte hittas",
      });
      return;
    }

    res.status(200).json({
      balance: account.balance,
    });
  }
);

//Sätt in pengar (POST): "/me/accounts/transactions"
app.post(
  "/me/accounts/transactions",
  async (
    req: Request<
      {},
      {},
      { amount: number | undefined },
      {
        headers: {
          authorization: string | undefined;
        };
      }
    >,
    res: Response<{ message: number } | { error: string }>
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: "Du måste logga in för att sätta in pengar",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        error: "Du måste logga in för att sätta in pengar",
      });
      return;
    }

    let session: Session | null = null;

    try {
      const [sessions] = await pool.execute<SessionRow[]>(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
      session = sessions[0];
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    if (!session) {
      res.status(401).json({
        error: "Ogiltig token",
      });
      return;
    }

    let account: Account | null = null;

    try {
      const [accounts] = await pool.execute<AccountRow[]>(
        "SELECT * FROM accounts WHERE user_id = ?",
        [session.user_id]
      );

      account = accounts[0];
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    if (!account) {
      res.status(404).json({
        error: "Kontot kunde inte hittas",
      });
      return;
    }

    const { amount } = req.body;

    if (!amount || typeof amount !== "number") {
      res.status(400).json({
        error: "Kontonummer och belopp krävs",
      });
      return;
    }

    const absoluteAmount = Math.abs(amount);

    try {
      await pool.execute("UPDATE accounts SET balance = ? WHERE user_id = ?", [
        account.balance + absoluteAmount,
        session.user_id,
      ]);
    } catch (error) {
      res.status(500).json({
        error: "Något gick fel",
      });
      return;
    }

    res.status(200).json({
      message: account.balance + absoluteAmount,
    });
  }
);

// Starta servern
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
