import express, { Request, Response } from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import { User, Account, Session } from "./types";

// Skapa en anslutning till databasen
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "banksajt",
  port: 3306,
});

async function getUsers() {
  const [result] = await pool.query("SELECT * FROM users");
  console.log(result);
}

//getUsers();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// Din kod här. Skriv dina arrayer

const users: User[] = [];
const accounts: Account[] = [];
const sessions: Session[] = [];

// Din kod här. Skriv dina routes:

//Skapa användare (POST): "/users"
app.post(
  "/users",
  (
    req: Request<{}, {}, { username: string; password: string }, {}>,
    res: Response<{ user: User; account: Account } | { error: string }>
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
    }

    const newUser = {
      id: generateOTP(),
      username,
      password,
    } as User;

    users.push(newUser);

    const newAccount = {
      id: generateOTP(),
      user_id: newUser.id,
      balance: 0,
    } as Account;

    accounts.push(newAccount);

    res.status(201).json({
      user: newUser,
      account: newAccount,
    });
  }
);
//Logga in (POST): "/sessions"
app.post(
  "/sessions",
  (
    req: Request<{}, {}, { username: string; password: string }, {}>,
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
    }

    const user = users.find(
      (user) => user.username === username && user.password === password
    );

    if (!user) {
      res.status(401).json({
        error: "Fel användarnamn eller lösenord",
      });
      return;
    }

    const session = {
      id: generateOTP(),
      user_id: user.id,
      token: generateOTP(),
    } as Session;

    sessions.push(session);

    res.status(201).json({
      token: session.token,
    });
  }
);

//Visa salodo (POST): "/me/accounts"
app.post(
  "/me/accounts",
  (
    req: Request<{}, {}, {}, {}>,
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

    const session = sessions.find((session) => session.token === token);

    if (!session) {
      res.status(401).json({
        error: "Ogiltig token",
      });
      return;
    }

    const account = accounts.find(
      (account) => account.user_id === session.user_id
    );

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
  (
    req: Request<
      {},
      {},
      { amount: number },
      {
        headers: {
          Authorization: string;
        };
      }
    >,
    res: Response<{ message: number } | { error: string }>
  ) => {
    const bearer = req.headers.authorization;

    if (!bearer) {
      res.status(401).json({
        error: "Du måste logga in för att sätta in pengar",
      });
      return;
    }

    const token = bearer.split(" ")[1];

    if (!token) {
      res.status(401).json({
        error: "Du måste logga in för att sätta in pengar",
      });
      return;
    }

    const session = sessions.find((session) => session.token === token);

    if (!session) {
      res.status(401).json({
        error: "Ogiltig token",
      });
      return;
    }

    const account = accounts.find(
      (account) => account.user_id === session.user_id
    );

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

    account.balance += amount;

    res.status(200).json({
      message: account.balance,
    });
  }
);

// Starta servern
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
