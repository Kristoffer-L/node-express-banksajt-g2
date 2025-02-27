// import express from "express";
// import bodyParser from "body-parser";
// import mysql from "mysql2/promise";

// const app = express();
// const port = 3001;

// // middleware
// app.use(bodyParser.json());

// // Databas uppkoppling
// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     password: "root",
//     database: "banksajt",
//     port: 3306, // Obs! 3306 för windowsanvändare
//   });

//  // Funktion för att göra förfrågan till databas
// async function query(sql, params) {
//     const [results] = await pool.execute(sql, params);
//     return results;
//   }

// app.listen(port, () => {
//   console.log("Listening on port: " + port);
// });