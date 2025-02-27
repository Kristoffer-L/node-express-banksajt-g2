import express from "express";
import cors from "cors";

const app = express();
const port = 3000
interface User {
  id: number| string,
  username: string,
  email: string,
  password: string
}

interface Account {
  id: number| string,
  user_id: User["id"]
  balance: number
}

interface Session {
  id: number| string,
  user_id: User["id"]
  token: string
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

const users: User[] = []
const accounts: Account[]  = []
const sessions: Session[] = []

// Din kod här. Skriv dina routes:

//Skapa användare (POST): "/users"
app.post("/users", (req, res) => {
  res.send("users here");
});
//Logga in (POST): "/sessions"
app.post("/sessions", (req, res) => {
  res.json(req.body)
});
//Visa salodo (POST): "/me/accounts"
app.post("/me/accounts", (req, res) => {
  res.send("users here");
});
//Sätt in pengar (POST): "/me/accounts/transactions"
app.post("/me/accounts/transactions", (req, res) => {
  res.send("users here");
});


// Starta servern
app.listen(port, () => {
    console.log(`Bankens backend körs på http://localhost:${port}`);
});
