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

async function getCategories() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM Categories";
    db.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

async function getSubcategories(category_id) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM Subcategories WHERE category_id = ?";
    db.query(query, [category_id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

async function generateProducts() {
  let categories;
  let subcategories;

  // Retrieving all categories
  try {
    const categoryRes = await getCategories();
    categories = categoryRes.map((row) => ({
      id: row.category_id,
      name: row.name,
      section: row.section,
    }));
    console.log("Categories loaded:", categories.length);
  } catch (err) {
    console.error("Error retrieving categories:", err);
    return; // Exit if there's an error with categories
  }

  for (let i = 0; i < 5; i++) {
    // Choosing random category
    const category_id = Math.floor(Math.random() * categories.length + 1);
    let subcategory_id;
    try {
      // Retrieving according subcategories for the selected category
      const subcategoryRes = await getSubcategories(category_id);
      subcategories = subcategoryRes.map((row) => ({
        id: row.subcategory_id,
        name: row.name,
        section: row.category_id,
      }));

      // Choosing random subcategory
      const randomSubcategory =
        subcategories[Math.floor(Math.random() * subcategories.length)];
      subcategory_id = randomSubcategory.id;
    } catch (err) {
      console.error("Error retrieving subcategories:", err);
    }

    // Choosing random brand
    const brand = faker.company.name();
    // Choosing random name
    const name = faker.commerce.productName();
    // Choosing random price
    const price = faker.commerce.price({ min: 50, max: 900, dec: 2 });
    // Choosing random material
    const material = faker.commerce.productMaterial();
    // Choosing random description
    const description = faker.commerce.productDescription();

    console.log("PRODUCT #", i + 1);
    console.log("Category: ", category_id);
    console.log("Subcategory: ", subcategory_id);
    console.log("Brand: ", brand);
    console.log("Name: ", name);
    console.log("Price: ", price);
    console.log("Material: ", material);
    console.log("Description: ", description);
  }
  db.end();
}

generateProducts();
