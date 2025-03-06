import express, { Response, Request } from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();

//Uppkoppling mot databasen
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
});

const app = express();
const port = 3000;
interface User {
  id: number | string;
  username: string;
  password: string;
}

interface Account {
  id: number | string;
  user_id: User["id"];
  balance: number;
}

interface Session {
  id: number | string;
  user_id: User["id"];
  token: number | string;
}

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

const users: User[] = [
  { id: 101, username: "kristoffer", password: "password" },
];
const accounts: Account[] = [{ id: 1, user_id: 101, balance: 100 }];
const sessions: Session[] = [];

// Din kod här. Skriv dina routes:

//Skapa användare (POST): "/users"
app.post("/users", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const [result] = await pool.query(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      [username, password]
    );

    const newUser: User = {
      id: users.length + 1,
      username: username,
      password: password,
    };

    const [accountResult] = await pool.query(
      "INSERT INTO accounts (user_id, balance) VALUES (?, ?)",
      [newUser.id, 0]
    );

    const newAccount: Account = {
      id: accounts.length + 1,
      user_id: newUser.id,
      balance: 0,
    };

    users.push(newUser);
    accounts.push(newAccount);

    res.json({ newAccount, newUser });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Error creating user" });
  }

  // users.push(newUser);

  // const newAccount: Account = {
  //   id: accounts.length + 1,
  //   user_id: newUser.id,
  //   balance: 0,
  // };
  // accounts.push(newAccount);
});

//Logga in (POST): "/sessions"
app.post("/sessions", (req, res) => {
  users.forEach((user) => {
    if (
      req.body.username === user.username &&
      req.body.password === user.password
    ) {
      const newSession: Session = {
        id: sessions.length + 1,
        user_id: user.id,
        token: generateOTP(),
      };
      sessions.push(newSession);
      res.json({
        message: "Inloggning lyckades",
        token: newSession.token,
      });
      return;
    }
  });
  res.status(401).json({
    message: "Fel användarnamn eller lösenord",
  });
});

//Visa salodo (POST): "/me/accounts"
app.post(
  "/me/accounts",
  (
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
    const bearerAndToken = req.headers.authorization;

    const token = bearerAndToken?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        error: "Du är inte inloggad",
      });
      return;
    }

    const session = sessions.find((session) => session.token === token);

    if (!session) {
      res.status(401).json({
        error: "Du är inte inloggad",
      });
      return;
    }

    const account = accounts.find(
      (account) => account.user_id === session.user_id
    );

    if (!account) {
      res.status(404).json({
        error: "Kontot hittades inte",
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
  "/me/account/transaction",
  (
    req: Request<
      {},
      {},
      {
        amount: number;
      },
      {
        headers: {
          authorization: string | undefined;
        };
      }
    >,
    res: Response<{ message: number } | { error: string }>
  ) => {
    const bearerAndToken = req.headers.authorization;

    const token = bearerAndToken?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        error: "Du är inte inloggad",
      });
      return;
    }

    const session = sessions.find((session) => session.token === token);

    if (!session) {
      res.status(401).json({
        error: "Du är inte inloggad",
      });
      return;
    }

    const account = accounts.find(
      (account) => account.user_id === session.user_id
    );

    if (!account) {
      res.status(404).json({
        error: "Kontot hittades inte",
      });
      return;
    }
    account.balance += req.body.amount;

    res.status(200).json({
      message: account.balance,
    });
  }
);

// Starta servern
app.listen(port, () => {
  console.log(`Bankens backend körs på http://localhost:${port}`);
});
