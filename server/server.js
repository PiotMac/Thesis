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

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Login Endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // First check if the user is an admin
  const sql_admin = "SELECT user_id, password FROM Admins WHERE email = ?";

  // Then check if it is a common user
  const sql_user = "SELECT user_id, password FROM Users WHERE email = ?";

  const checkUser = (sql) =>
    new Promise((resolve, reject) => {
      db.query(sql, [email], async (err, rows) => {
        if (err) return reject({ status: 500, message: "Database error", err });
        if (rows.length === 0) return resolve(null); // User not found in current table
        resolve(rows[0]); // Return the user data if found
      });
    });

  try {
    let user = await checkUser(sql_admin); // Check admin table first
    let userType = "admin";
    if (!user) {
      // If not admin, check regular Users table
      user = await checkUser(sql_user);
      userType = "user";
    }

    if (!user) {
      // User not found in either table
      return res.status(404).json({ message: "User not found" });
    }

    console.log(password);
    console.log(user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.user_id, email, role: userType },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    return res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error occurred:", error);
    return res
      .status(error.status || 500)
      .json({ message: error.message || "Error occurred", error });
  }
});

app.get("/profile", authenticateToken, (req, res) => {
  const email = req.user.email;
  db.query("SELECT * FROM Users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).send("Error fetching profile");
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
    });
    const token = jwt.sign({ email, role: "user" }, JWT_SECRET, {
      expiresIn: "30m",
    });
    return res
      .status(201)
      .json({ message: "User registered successfully", token });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).send("Error registering user");
  }
});

async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

// Endpoint to get subcategories list
app.get("/:mainCategory/:subcategory", (req, res) => {
  const { mainCategory, subcategory } = req.params;

  let wrappedCategory = "";
  switch (mainCategory) {
    case "damskie":
      wrappedCategory = "Women";
      break;
    case "meskie":
      wrappedCategory = "Men";
      break;
    case "dzieciece":
      wrappedCategory = "Kids";
      break;
    default:
      res.status(500).send("Error fetching category!");
  }

  const query = `SELECT S.name
  FROM Subcategories S
  JOIN Categories C ON S.category_id = C.category_id
  WHERE C.name = ? AND C.section = ?`;

  db.query(query, [subcategory, wrappedCategory], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({ error: "Database error" });
      return;
    }
    res.json(results);
  });
});
