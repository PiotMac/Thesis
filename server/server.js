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

app.get("/products/:product_id", (req, res) => {
  const { product_id } = req.params;
  const query = `SELECT p.product_id, 
  p.name, 
  p.price, 
  p.material, 
  p.description, 
  p.brand,
  JSON_ARRAYAGG(
    JSON_OBJECT(
        'size', s.name,
        'color', JSON_OBJECT('red', c.red, 'green', c.green, 'blue', c.blue),
        'quantity', i.quantity
    )
) AS available_variations
FROM 
Products p
JOIN 
Inventory i ON p.product_id = i.product_id
JOIN 
Sizes s ON i.size_id = s.size_id
JOIN 
Colors c ON i.color_id = c.color_id
WHERE 
p.product_id = ?;`;

  db.query(query, [product_id], (err, product) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Extract the product data from the query result
    const productData = product[0];

    // Parse available variations (it's a JSON string from MySQL)
    // const availableVariations = JSON.parse(productData.available_variations);

    // Return the product data along with its available variations
    res.json({
      product_id: productData.product_id,
      name: productData.name,
      price: productData.price,
      material: productData.material,
      description: productData.description,
      brand: productData.brand,
      available_variations: JSON.parse(productData.available_variations),
    });
  });
});

// Endpoint to render main page with products
app.get("/:mainCategory/:subcategory/:subsubcategory?", (req, res) => {
  const { mainCategory, subcategory, subsubcategory } = req.params;

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

  // Get all the subcategories for the page
  const query = `SELECT S.subcategory_id, S.name
  FROM Subcategories S
  JOIN Categories C ON S.category_id = C.category_id
  WHERE C.name = ? AND C.section = ?`;

  db.query(query, [subcategory, wrappedCategory], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).json({ error: "Database error" });
      return;
    }
    // Querying products
    // 1. Subsection is specified
    let query_get_products;
    if (subsubcategory) {
      const get_category_id = `SELECT category_id FROM Categories WHERE name = ? AND section = ?`;
      db.query(
        get_category_id,
        [subcategory, wrappedCategory],
        (err, cat_id) => {
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "CategoryID not found!" });
          }
          const get_subcategory_id = `SELECT subcategory_id FROM Subcategories WHERE name = ? AND category_id = ?`;
          db.query(
            get_subcategory_id,
            [subsubcategory, cat_id[0].category_id],
            (err, sub_id) => {
              if (err) {
                console.error("Database query error:", err);
                return res
                  .status(500)
                  .json({ error: "SubcategoryID not found!" });
              }
              query_get_products = `
              SELECT 
                  p.product_id,
                  p.brand, 
                  p.name, 
                  p.price, 
                  p.material, 
                  p.description,
                  JSON_ARRAYAGG(
                    JSON_OBJECT('red', c.red, 'green', c.green, 'blue', c.blue)
                ) AS colors,
                JSON_ARRAYAGG(
                    JSON_OBJECT('name', s.name)
                ) AS sizes
              FROM 
                  Products p
              JOIN 
                  Inventory i ON p.product_id = i.product_id
              JOIN 
                  Colors c ON i.color_id = c.color_id
              JOIN 
                  Sizes s ON i.size_id = s.size_id
              WHERE 
                  p.subcategory_id = ?
              GROUP BY 
                  p.product_id;
            `;
              db.query(
                query_get_products,
                [sub_id[0].subcategory_id],
                (err, products) => {
                  if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).json({ error: "Database error" });
                  }

                  // Remove duplicates from colors and sizes
                  const parsedProducts = products.map((row) => {
                    // Parse the colors and sizes JSON strings
                    const colors = JSON.parse(row.colors);
                    const sizes = JSON.parse(row.sizes);

                    // Remove duplicates from colors using Set and JSON.stringify
                    const uniqueColors = Array.from(
                      new Set(colors.map((c) => JSON.stringify(c))) // Unique color objects
                    ).map((e) => JSON.parse(e)); // Convert back to objects

                    const orderedColors = uniqueColors.map((color) => {
                      return {
                        red: color.red,
                        green: color.green,
                        blue: color.blue,
                      };
                    });

                    // Remove duplicates from sizes using Set and JSON.stringify
                    const uniqueSizes = Array.from(
                      new Set(sizes.map((s) => JSON.stringify(s))) // Unique size objects
                    ).map((e) => JSON.parse(e)); // Convert back to objects

                    return {
                      product_id: row.product_id,
                      brand: row.brand,
                      name: row.name,
                      price: row.price,
                      material: row.material,
                      description: row.description,
                      colors: orderedColors, // Unique colors
                      sizes: uniqueSizes, // Unique sizes
                    };
                  });

                  res.json({
                    subcategories: results,
                    products: parsedProducts || [],
                  });
                }
              );
            }
          );
        }
      );
      // 2. Subsection is NOT specified
    } else {
      const subcategoryIds = results.map((row) => row.subcategory_id);
      query_get_products = `
      SELECT 
          p.product_id,
          p.brand, 
          p.name, 
          p.price, 
          p.material, 
          p.description,
          JSON_ARRAYAGG(
            JSON_OBJECT('red', c.red, 'green', c.green, 'blue', c.blue)
        ) AS colors,
        JSON_ARRAYAGG(
            JSON_OBJECT('name', s.name)
        ) AS sizes
      FROM 
          Products p
      JOIN 
          Inventory i ON p.product_id = i.product_id
      JOIN 
          Colors c ON i.color_id = c.color_id
      JOIN 
          Sizes s ON i.size_id = s.size_id
      WHERE 
          p.subcategory_id IN (?)
      GROUP BY 
          p.product_id;
    `;
      db.query(query_get_products, [subcategoryIds], (err, products) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        // Remove duplicates from colors and sizes
        const parsedProducts = products.map((row) => {
          // Parse the colors and sizes JSON strings
          const colors = JSON.parse(row.colors);
          const sizes = JSON.parse(row.sizes);

          // Remove duplicates from colors using Set and JSON.stringify
          const uniqueColors = Array.from(
            new Set(colors.map((c) => JSON.stringify(c))) // Unique color objects
          ).map((e) => JSON.parse(e)); // Convert back to objects

          const orderedColors = uniqueColors.map((color) => {
            return {
              red: color.red,
              green: color.green,
              blue: color.blue,
            };
          });

          // Remove duplicates from sizes using Set and JSON.stringify
          const uniqueSizes = Array.from(
            new Set(sizes.map((s) => JSON.stringify(s))) // Unique size objects
          ).map((e) => JSON.parse(e)); // Convert back to objects

          return {
            product_id: row.product_id,
            brand: row.brand,
            name: row.name,
            price: row.price,
            material: row.material,
            description: row.description,
            colors: orderedColors, // Unique colors
            sizes: uniqueSizes, // Unique sizes
          };
        });

        res.json({
          subcategories: results,
          products: parsedProducts || [],
          subcategoryIds: subcategoryIds,
        });
      });
    }
  });
});
