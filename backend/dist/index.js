"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promise_1 = __importDefault(require("mysql2/promise"));
// Skapa en anslutning till databasen
const pool = promise_1.default.createPool({
    host: "localhost",
    user: "root",
    database: "banksajt",
    port: 3306,
});
const app = (0, express_1.default)();
const port = 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Generera engångslösenord
function generateOTP() {
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
app.post("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, username } = req.body;
    if (!username ||
        typeof username !== "string" ||
        !password ||
        typeof password !== "string") {
        res.status(400).json({
            error: "Användarnamn och lösenord krävs",
        });
        return;
    }
    try {
        yield pool.execute("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
    }
    catch (error) {
        res.status(500).json({
            error: "Något gick fel",
        });
        return;
    }
    try {
        yield pool.execute("INSERT INTO accounts(user_id) values ((SELECT id FROM users WHERE username = ?))", [username]);
    }
    catch (error) {
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
}));
//Logga in (POST): "/sessions"
app.post("/sessions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username ||
        typeof username !== "string" ||
        !password ||
        typeof password !== "string") {
        res.status(400).json({
            error: "Användarnamn och lösenord krävs",
        });
        return;
    }
    let user = null;
    try {
        const [users] = yield pool.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
        user = users[0];
    }
    catch (error) {
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
        yield pool.execute("INSERT INTO sessions (user_id, token) VALUES (?, ?)", [user.id, token]);
    }
    catch (error) {
        res.status(500).json({
            error: "Något gick fel",
        });
        return;
    }
    res.status(201).json({
        token: token,
    });
}));
//Visa salodo (POST): "/me/accounts"
app.post("/me/accounts", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const [sessions] = yield pool.execute("SELECT * FROM sessions WHERE token = ?", [token]);
        session = sessions[0];
    }
    catch (error) {
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
        const [accounts] = yield pool.execute("SELECT * FROM accounts WHERE user_id = ?", [session.user_id]);
        account = accounts[0];
    }
    catch (error) {
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
}));
//Sätt in pengar (POST): "/me/accounts/transactions"
app.post("/me/accounts/transactions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    let session = null;
    try {
        const [sessions] = yield pool.execute("SELECT * FROM sessions WHERE token = ?", [token]);
        session = sessions[0];
    }
    catch (error) {
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
        const [accounts] = yield pool.execute("SELECT * FROM accounts WHERE user_id = ?", [session.user_id]);
        account = accounts[0];
    }
    catch (error) {
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
        yield pool.execute("UPDATE accounts SET balance = ? WHERE user_id = ?", [
            account.balance + absoluteAmount,
            session.user_id,
        ]);
    }
    catch (error) {
        res.status(500).json({
            error: "Något gick fel",
        });
        return;
    }
    res.status(200).json({
        message: account.balance + absoluteAmount,
    });
}));
// Starta servern
const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
