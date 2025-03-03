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
  const [result] = await pool.execute("SELECT * FROM users");
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

const users: User[] = [{ id: 101, username: "kristoffer", password: "password" }];
const accounts: Account[] = [{ id: 1, user_id: 101, balance: 100 }];
const sessions: Session[] = [{ id: 1, user_id: 101, token: "" }];

// Din kod här. Skriv dina routes:

//Skapa användare (POST): "/users"
app.post("/users", (req, res) => {
  res.json(req.body.username);
});
//Logga in (POST): "/sessions"
app.post(
  "/sessions",
  async (req: Request<{}, {}, { username: string; password: string }, {}>, res: Response<{ token: string } | { error: string }>) => {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || !password || typeof password !== "string") {
      res.status(400).json({
        error: "Användarnamn och lösenord krävs",
      });
    }

    let user = null;

    try {
      const [result] = await pool.execute("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
      //@ts-ignore
      user = result[0];
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
      const [inserted] = await pool.execute<mysql.ResultSetHeader>(
        "INSERT INTO sessions (user_id, token) VALUES (?, ?)",
        //@ts-ignore
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
app.post("/me/accounts", async (req: Request<{}, {}, {}, {}>, res: Response<{ balance: number } | { error: string }>) => {
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

  let session = null;

  try {
    const [result] = await pool.execute("SELECT * FROM sessions WHERE token = ?", [token]);
    //@ts-ignore
    session = result[0];
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

  let account = null;

  try {
    const [result] = await pool.execute("SELECT * FROM accounts WHERE user_id = ?", [session.user_id]);
    console.log(result);
    //@ts-ignore
    account = result[0];
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
});

//Sätt in pengar (POST): "/me/accounts/transactions"
app.post("/me/accounts/transactions", (req, res) => {
  res.send("users here");
});

// Starta servern
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
