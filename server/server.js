const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL Database");
});

// Login Endpoint
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT user_id, password FROM Users WHERE email = ?";
  db.query(sql, [email], async (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Database error", err });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const userId = rows[0].id;
    const hashedPassword = rows[0].password;

    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "30m" });

    return res.status(200).json({ message: "Login successful", token });
  });
});

app.get("/profile", authenticateToken, (req, res) => {
  const email = req.user.email;
  db.query("SELECT * FROM Users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).send("Error fetching profile");
    console.log(result[0]);
    res.json(result[0]);
  });
});

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// Registration Endpoint
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the user with the hashed password
    const sql =
      "INSERT INTO Users (first_name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        return res.status(500).send("Error registering user");
      }
      res.status(201).send("User registered successfully");
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).send("Error registering user");
  }
});

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
