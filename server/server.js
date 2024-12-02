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
    methods: ["GET", "POST", "PUT"],
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

    const isPasswordValid = await bcrypt.compare(password, user.password);

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
  const query = `
    SELECT Users.*, Addresses.*
    FROM Users
    LEFT JOIN Addresses ON Users.address_id = Addresses.address_id
    WHERE Users.email = ?
  `;

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error(err); // Log the error for debugging
      return res.status(500).send("Error fetching profile");
    }

    if (result.length === 0) {
      return res.status(404).send("User not found");
    }

    res.json(result[0]);
  });
});

app.put("/profile", authenticateToken, async (req, res) => {
  const type = req.body.type;
  const email = req.user.email;

  if (type === "basic") {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const query =
      "UPDATE Users SET first_name = ?, surname = ? WHERE email = ?";

    db.query(query, [firstName, lastName, email], (err, result) => {
      if (err) return res.status(500).send("Error updating profile basic info");
      res.json({
        success: true,
        message: "Profile basic info updated successfully",
      });
    });
  } else if (type === "address") {
    if (req.body.address_id) {
      // Update existing address
      const updateAddressQuery = `
        UPDATE Addresses
        SET street = ?, house_nr = ?, appartment_nr = ?, city = ?, zipcode = ?
        WHERE address_id = ?
      `;

      db.query(
        updateAddressQuery,
        [
          req.body.street,
          req.body.house_nr,
          req.body.appartment_nr,
          req.body.city,
          req.body.zipcode,
          req.body.address_id,
        ],
        (err, result) => {
          if (err) return res.status(500).send("Error updating address");

          res.json({
            success: true,
            message: "Address updated successfully",
          });
        }
      );
    } else {
      // Create a new address
      const insertAddressQuery = `
        INSERT INTO Addresses (street, house_nr, appartment_nr, city, zipcode)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        insertAddressQuery,
        [
          req.body.street,
          req.body.house_nr,
          req.body.appartment_nr,
          req.body.city,
          req.body.zipcode,
        ],
        (err, result) => {
          if (err) return res.status(500).send("Error inserting address");
          const newAddressId = result.insertId;

          // Update the user's address_id to the newly created address_id
          const updateUserQuery =
            "UPDATE Users SET address_id = ? WHERE email = ?";
          db.query(
            updateUserQuery,
            [newAddressId, req.body.email],
            (err, result) => {
              if (err)
                return res.status(500).send("Error linking address to user");

              res.json({
                success: true,
                message: "Address created and linked to user successfully",
              });
            }
          );
        }
      );
    }
  } else if (type === "password") {
    const codedPassword = req.body.codedPassword;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;

    const isOldPasswordCorrect = await bcrypt.compare(
      currentPassword,
      codedPassword
    );
    if (!isOldPasswordCorrect) {
      return res.status(401).json({ error: "Incorrect old password!" });
    }

    const hashedNewPassword = await hashPassword(newPassword);

    const query = `UPDATE Users SET password = ? WHERE email = ?`;
    db.query(query, [hashedNewPassword, email], (err, results) => {
      if (err) {
        return res.status(500).send("Error updating a password!");
      }
      res.json({
        success: true,
        message: "Password successfully updated!",
      });
    });
  }
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

// Endpoint to get all the items in the user's cart
app.get("/cart", authenticateToken, (req, res) => {
  const user_id = req.user.userId;

  const query = `
    SELECT 
      c.cart_id, 
      c.quantity, 
      p.product_id, 
      p.name, 
      p.price, 
      p.material, 
      p.description, 
      p.brand,
      i.id AS inventory_id,
      i.color_id,
      i.size_id, 
      i.quantity AS inventory_quantity, 
      c.quantity * p.price AS total_price, 
      c.quantity AS cart_quantity, 
      s.name AS size_name, 
      color.red, 
      color.green, 
      color.blue 
    FROM 
      Carts c
    JOIN 
      Inventory i ON c.inventory_id = i.id
    JOIN 
      Products p ON i.product_id = p.product_id
    JOIN 
      Sizes s ON i.size_id = s.size_id
    JOIN 
      Colors color ON i.color_id = color.color_id
    WHERE 
      c.user_id = ?;
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error during cart info selection!" });
    }

    res.json(results);
  });
});

// Endpoint to edit an item in the user's cart
app.put("/cart", authenticateToken, (req, res) => {
  const user_id = req.user.userId;
  const cart_id = req.body.cartID;
  const newQuantity = req.body.newQuantity;

  if (!user_id) {
    return res.status(500);
  }

  const query = `UPDATE Carts SET quantity = ?
  WHERE cart_id = ?`;

  db.query(query, [newQuantity, cart_id], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error during cart product edition!" });
    }
    return res.json({ success: true, message: "Cart updated!" });
  });
});

// Endpoint to delete an item from the user's cart
app.delete("/cart", authenticateToken, (req, res) => {
  const user_id = req.user.userId;
  const cart_id = req.body.cartID;

  if (!user_id) {
    return res.status(500);
  }

  const query = `DELETE FROM Carts WHERE cart_id = ?`;

  db.query(query, [cart_id], (err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "Database error during cart product deletion!" });
    }
    return res.json({ success: true, message: "Cart product deleted!" });
  });
});

// Endpoint to complete a transaction
app.post("/checkout", authenticateToken, (req, res) => {
  const user_id = req.user.userId;
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  const total = req.body.totalPrice;

  const insertTransactionQuery = `INSERT INTO Transactions (user_id, transaction_date, total_price) VALUES (?, ?, ?)`;
  db.query(
    insertTransactionQuery,
    [user_id, formattedDate, total],
    (err, result) => {
      if (err) {
        console.error("Transaction insertion error: ", err);
        return res.status(500).json({ error: "Transaction insertion error" });
      }

      const transactionId = result.insertId;
      const cartItems = req.body.cartItems;

      const insertProductsQuery = `INSERT INTO TransactionsItems 
    (transaction_id, inventory_id, quantity) VALUES ?`;

      const insertValues = cartItems.map((item) => [
        transactionId,
        item.inventory_id,
        item.quantity,
      ]);

      db.query(insertProductsQuery, [insertValues], (err) => {
        if (err) {
          console.error("TransactionsItems insertion error: ", err);
          return res
            .status(500)
            .json({ error: "TransactionsItems insertion error" });
        }

        // Now update the Inventory for each cartItem
        const updateInventoryQueries = cartItems.map((item) => {
          const updateInventoryQuery = `
          UPDATE Inventory 
          SET quantity = quantity - ? 
          WHERE id = ?`;

          return new Promise((resolve, reject) => {
            db.query(
              updateInventoryQuery,
              [item.quantity, item.inventory_id],
              (err, result) => {
                if (err) {
                  console.error("Inventory update error: ", err);
                  return reject(err);
                }
                resolve(result);
              }
            );
          });
        });

        // Execute all inventory updates in parallel
        Promise.all(updateInventoryQueries)
          .then(() => {
            // After inventory is updated, delete rows from Carts where user_id matches
            const deleteCartItemsQuery = `DELETE FROM Carts WHERE user_id = ?`;

            db.query(deleteCartItemsQuery, [user_id], (err) => {
              if (err) {
                console.error("Error deleting cart items:", err);
                return res
                  .status(500)
                  .json({ error: "Error deleting cart items" });
              }

              // If everything is successful, send a success response
              return res.status(200).json({
                message:
                  "Transaction completed, inventory updated, and cart emptied!",
              });
            });
          })
          .catch((error) => {
            console.error("Error updating inventory:", error);
            return res.status(500).json({ error: "Error updating inventory" });
          });
      });
    }
  );
});

// Endpoint to fetch all user's transactions
app.get("/transactions", authenticateToken, (req, res) => {
  const user_id = req.user.userId;

  const fetchAllTransactionsQuery = `SELECT 
  t.transaction_id,
  t.transaction_date,
  t.total_price,
  ti.inventory_id,
  ti.quantity AS transaction_quantity,
  i.product_id,
  i.quantity AS inventory_quantity,
  p.name AS product_name,
  p.brand AS product_brand,
  p.price AS product_price,
  c.red,
  c.green,
  c.blue,
  s.name AS size_name,
  s.type AS size_type
FROM 
  Transactions t
JOIN 
  TransactionsItems ti ON t.transaction_id = ti.transaction_id
JOIN 
  Inventory i ON ti.inventory_id = i.id
JOIN 
  Products p ON i.product_id = p.product_id
JOIN 
  Colors c ON i.color_id = c.color_id
JOIN 
  Sizes s ON i.size_id = s.size_id
WHERE 
  t.user_id = ?`;
  db.query(fetchAllTransactionsQuery, [user_id], (err, transactions) => {
    if (err) {
      console.error("Error fetching transaction ids:", err);
      return res.status(500).json({ error: "Error fetching transaction ids" });
    }

    const groupedTransactions = transactions.reduce((acc, transaction) => {
      const { transaction_id } = transaction;

      // Initialize transaction group if it doesn't exist
      if (!acc[transaction_id]) {
        acc[transaction_id] = {
          transaction_id,
          transaction_date: transaction.transaction_date,
          total_price: transaction.total_price,
          items: [],
        };
      }

      // Create and add item to the transaction
      const item = {
        inventory_id: transaction.inventory_id,
        transaction_quantity: transaction.transaction_quantity,
        inventory_quantity: transaction.inventory_quantity,
        product: {
          product_id: transaction.product_id,
          name: transaction.product_name,
          brand: transaction.product_brand,
          price: transaction.product_price,
          color: {
            red: transaction.red,
            green: transaction.green,
            blue: transaction.blue,
          },
          size: { name: transaction.size_name, type: transaction.size_type },
        },
      };

      acc[transaction_id].items.push(item);
      return acc;
    }, {});

    res.json(groupedTransactions);
  });
});

// Endpoint to fetch all the product's information
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
        'size', JSON_OBJECT('size_id', s.size_id, 'size_name', s.name),
        'color', JSON_OBJECT('color_id', c.color_id, 'red', c.red, 'green', c.green, 'blue', c.blue),
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

// Adding product to the cart of a user
app.post("/products/:product_id", authenticateToken, (req, res) => {
  const { product_id, color_id, size_id } = req.body;
  const user_id = req.user.userId;

  // Get the inventory ID
  const getInvQuery = `SELECT id, quantity FROM Inventory WHERE product_id = ? AND color_id = ? AND size_id = ?`;
  db.query(getInvQuery, [product_id, color_id, size_id], (err, results) => {
    if (err) {
      return res.status(500).send("Error getting Inventory ID!");
    }

    if (results.length === 0) {
      return res.status(404).send("Inventory not found!");
    }

    // Check if the item already exists in the cart for this user
    const inventoryId = results[0].id;
    const inventoryQuantity = results[0].quantity;

    const checkCartQuery = `
    SELECT * FROM Carts
    WHERE user_id = ? AND inventory_id = ?`;

    db.query(checkCartQuery, [user_id, inventoryId], (err, results) => {
      if (err) {
        return res.status(500).send("Error checking cart!");
      }

      // Item already exists in the cart, update its quantity
      if (results.length > 0) {
        const updateQuery = `UPDATE Carts SET quantity = quantity + ?
         WHERE user_id = ? AND inventory_id = ?`;
        db.query(updateQuery, [1, user_id, inventoryId], (err) => {
          if (err) {
            return res.status(500).send("Error updating cart!");
          }
          return res.json({ success: true, message: "Cart updated!" });
        });
      }
      // Item does not exist, create a new entry
      else {
        const insertCartQuery = `INSERT INTO Carts (user_id, inventory_id, quantity)
        VALUES (?, ?, ?)`;
        db.query(insertCartQuery, [user_id, inventoryId, 1], (err) => {
          if (err) {
            console.log(err);
            return res.status(500).send("Error adding to cart!");
          }
          return res.json({ success: true, message: "Item added to cart!" });
        });
      }
    });
  });
});

// Endpoint to render main page with products
app.get("/:mainCategory/:subcategory/:subsubcategory?", (req, res) => {
  const { mainCategory, subcategory, subsubcategory } = req.params;

  let wrappedCategory =
    mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1);

  // let wrappedCategory = "";
  // switch (mainCategory) {
  //   case "damskie":
  //     wrappedCategory = "Women";
  //     break;
  //   case "meskie":
  //     wrappedCategory = "Men";
  //     break;
  //   case "dzieciece":
  //     wrappedCategory = "Kids";
  //     break;
  //   default:
  //     res.status(500).send("Error fetching category!");
  // }

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
