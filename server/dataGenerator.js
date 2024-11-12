const mysql = require("mysql");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

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

// const ITER_COLORS = 1000;
// generateColors();

// function generateColors() {
//   for (let i = 0; i < ITER_COLORS; i++) {
//     const color = faker.color.rgb({ format: "decimal" });
//     const red = color[0];
//     const green = color[1];
//     const blue = color[2];

//     const query = "INSERT INTO Colors (red, green, blue) VALUES (?, ?, ?)";

//     db.query(query, [red, green, blue], (err, results) => {
//       if (err) throw err;
//     });
//   }
// }

// for (let i = 0; i < 100; i++) {
//   const name = faker.commerce.productName();
//   const price = parseFloat(faker.commerce.price());
//   const size = faker.random.arrayElement(["S", "M", "L", "XL"]);
//   const brand = faker.company.companyName();
//   const model = faker.random.word();
//   const material = faker.commerce.productMaterial();

//   const query =
//     "INSERT INTO Products (name, price, size, brand, model, material) VALUES (?, ?, ?, ?, ?, ?)";
//   connection.query(
//     query,
//     [name, price, size, brand, model, material],
//     (err, results) => {
//       if (err) throw err;
//     }
//   );
// }

db.end();
