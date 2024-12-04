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

async function insertProduct(
  subcategory_id,
  brand,
  name,
  price,
  material,
  description
) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO Products (subcategory_id, brand, name, price, material, description)
      VALUES (?, ?, ?, ?, ?, ?)`;
    db.query(
      query,
      [subcategory_id, brand, name, price, material, description],
      (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      }
    );
  });
}

async function generateProducts() {
  let categories;
  let subcategories;

  const clothingBrands = [
    "Gucci",
    "Louis Vuitton",
    "Prada",
    "Chanel",
    "Burberry",
    "Versace",
    "Armani",
    "Hermès",
    "Ralph Lauren",
    "Calvin Klein",
    "Tommy Hilfiger",
    "Hugo Boss",
    "Zara",
    "H&M",
    "Uniqlo",
    "Mango",
    "Banana Republic",
    "GAP",
    "Levi's",
    "Wrangler",
    "Diesel",
    "Dockers",
    "J.Crew",
    "Patagonia",
    "The North Face",
    "Balenciaga",
    "Givenchy",
    "Dior",
    "Yves Saint Laurent (YSL)",
    "Fendi",
    "Bottega Veneta",
    "Alexander McQueen",
    "Off-White",
    "Supreme",
    "Palm Angels",
    "Balmain",
    "Kenzo",
    "Stone Island",
    "Carhartt WIP",
    "Stüssy",
    "A.P.C.",
    "Acne Studios",
    "Moncler",
    "Canada Goose",
    "Columbia",
    "Champion",
    "Fila",
    "Superdry",
    "Abercrombie & Fitch",
    "Hollister",
  ];

  const shoeBrands = [
    "Nike",
    "Adidas",
    "Puma",
    "Reebok",
    "New Balance",
    "Asics",
    "Under Armour",
    "Skechers",
    "Converse",
    "Vans",
    "Timberland",
    "Dr. Martens",
    "Clarks",
    "Salomon",
    "Merrell",
    "Birkenstock",
    "Crocs",
    "UGG",
    "Toms",
    "Cole Haan",
    "Johnston & Murphy",
    "Allen Edmonds",
    "Stuart Weitzman",
    "Jimmy Choo",
    "Christian Louboutin",
    "Balenciaga",
    "Alexander McQueen",
    "Golden Goose",
    "Saucony",
    "Brooks",
    "Hoka One One",
    "On Running",
    "Altra",
    "Topo Athletic",
    "Inov-8",
    "La Sportiva",
    "KEEN",
    "ECCO",
    "Geox",
    "Mephisto",
    "Rockport",
    "Blundstone",
    "Hunter",
    "Sam Edelman",
    "Steve Madden",
    "Kenneth Cole",
    "Aldo",
    "Rieker",
    "Pikolinos",
    "Tory Burch",
  ];

  const clothingMaterials = [
    "Cotton",
    "Wool",
    "Silk",
    "Linen",
    "Polyester",
    "Nylon",
    "Rayon",
    "Acrylic",
    "Spandex",
    "Denim",
    "Leather",
    "Suede",
    "Velvet",
    "Cashmere",
    "Chiffon",
    "Organza",
    "Taffeta",
    "Tweed",
    "Fleece",
    "Hemp",
    "Jersey",
    "Corduroy",
    "Satin",
    "Canvas",
    "Bamboo",
    "Modal",
    "Viscose",
    "Lyocell",
    "Chambray",
    "Seersucker",
    "Crepe",
    "Georgette",
    "Lace",
    "Tulle",
    "Merino Wool",
    "Alpaca",
    "Mohair",
    "Angora",
    "Microfiber",
    "Velour",
    "Neoprene",
    "Pashmina",
    "Terrycloth",
    "Flannel",
  ];

  const shoeMaterials = [
    "Leather",
    "Suede",
    "Canvas",
    "Rubber",
    "Mesh",
    "Nylon",
    "Polyester",
    "Gore-Tex",
    "PU Leather",
    "Textile",
    "Felt",
    "Microfiber",
    "Cotton",
    "Denim",
    "Wool",
    "Satin",
    "Velvet",
    "PVC",
    "EVA Foam",
    "TPU",
    "Latex",
    "Memory Foam",
    "Neoprene",
    "Cork",
    "Hemp",
    "Plastic",
    "Knitted Fabric",
    "Flyknit",
    "Cloth",
    "Vinyl",
    "Polyurethane",
    "Pebbled Leather",
    "Snake Leather",
    "Crocodile Leather",
    "Patent Leather",
    "Nubuck",
    "Thermoplastic Rubber",
    "Carbon Fiber",
    "Sheepskin",
    "Faux Fur",
    "Natural Rubber",
    "Elastic",
  ];

  function pluralToSingular(categoryName) {
    if (
      categoryName === "trousers" ||
      categoryName === "pyjamas" ||
      categoryName === "shoes"
    ) {
    } else if (categoryName.endsWith("es")) {
      categoryName = categoryName.slice(0, -2);
    } else if (categoryName.endsWith("s")) {
      categoryName = categoryName.slice(0, -1);
    }
    return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  }

  // Retrieving all categories
  try {
    const categoryRes = await getCategories();
    categories = categoryRes.map((row) => ({
      id: row.category_id,
      name: row.name,
      section: row.section,
      type: row.type,
    }));
  } catch (err) {
    console.error("Error retrieving categories:", err);
    return; // Exit if there's an error with categories
  }

  for (let i = 0; i < 1000; i++) {
    // Choosing random category
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    let subcategory_id;
    try {
      // Retrieving according subcategories for the selected category
      const subcategoryRes = await getSubcategories(randomCategory.id);
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

    let properBrands;
    let properMaterials;

    if (randomCategory.type === "Shoes") {
      properBrands = shoeBrands;
      properMaterials = shoeMaterials;
    } else {
      properBrands = clothingBrands;
      properMaterials = clothingMaterials;
    }

    // Choosing random brand
    const brand = properBrands[Math.floor(Math.random() * properBrands.length)];
    // Choosing random name (adverb + adjective + category)
    const randomAdverb = faker.word.adverb();
    const randomAdjective = faker.word.adjective();
    const name =
      randomAdverb.charAt(0).toUpperCase() +
      randomAdverb.slice(1) +
      " " +
      randomAdjective.charAt(0).toUpperCase() +
      randomAdjective.slice(1) +
      " " +
      pluralToSingular(randomCategory.name);
    // Choosing random price
    const price = faker.commerce.price({ min: 50, max: 900, dec: 2 });
    // Choosing random material
    const material =
      properMaterials[Math.floor(Math.random() * properMaterials.length)];
    // Choosing random description
    const description = faker.commerce.productDescription();

    insertProduct(subcategory_id, brand, name, price, material, description);
  }
  db.end();
}

// generateProducts();

async function populateInventory() {
  return new Promise((resolve, reject) => {
    // Step 1: Query all colors
    db.query("SELECT color_id FROM Colors", (err, colors) => {
      if (err) return reject(err);

      // Step 2: Query all sizes
      db.query("SELECT size_id, type FROM Sizes", (err, sizes) => {
        if (err) return reject(err);

        // Step 3: Query all products
        db.query(
          "SELECT product_id, subcategory_id FROM Products",
          (err, products) => {
            if (err) return reject(err);

            // Query subcategories to find product types
            const subcategoryQuery = `
              SELECT sc.subcategory_id, cat.type 
              FROM Subcategories sc 
              JOIN Categories cat ON sc.category_id = cat.category_id
            `;
            db.query(subcategoryQuery, (err, subcategories) => {
              if (err) return reject(err);

              // Map subcategories to their types
              const subcategoryTypes = subcategories.reduce((map, sc) => {
                map[sc.subcategory_id] = sc.type;
                return map;
              }, {});

              // Step 4: Populate inventory for each product
              const inventoryData = [];
              products.forEach((product) => {
                const productType = subcategoryTypes[product.subcategory_id];

                // Filter sizes based on product type
                const matchingSizes = sizes.filter(
                  (size) => size.type === productType
                );

                // Randomly select 2–6 colors
                const selectedColors = colors
                  .sort(() => 0.5 - Math.random())
                  .slice(0, Math.floor(2 + Math.random() * 5));

                // Create inventory entries for the product
                selectedColors.forEach((color) => {
                  const selectedSizes = matchingSizes
                    .sort(() => 0.5 - Math.random())
                    .slice(
                      0,
                      Math.floor(3 + Math.random() * matchingSizes.length)
                    );
                  selectedSizes.forEach((size) => {
                    inventoryData.push([
                      product.product_id,
                      color.color_id,
                      size.size_id,
                      Math.floor(Math.random() * 16),
                    ]);
                  });
                });
              });

              // Step 5: Insert into Inventory
              const query = `
                INSERT INTO Inventory (product_id, color_id, size_id, quantity) 
                VALUES ?`;
              db.query(query, [inventoryData], (err, result) => {
                if (err) return reject(err);
                resolve(result);
              });
            });
          }
        );
      });
    });
  });
}

async function generateInventory() {
  await populateInventory()
    .then(() => console.log("Inventory populated successfully!"))
    .catch((err) => console.error(err));
  db.end();
}

generateInventory();

async function createInventoryQuantity() {
  return new Promise((resolve, reject) => {
    db.query(
      `UPDATE Inventory
    SET quantity = FLOOR(RAND() * 16)`,
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

async function generateInventoryQuantity() {
  await createInventoryQuantity()
    .then(() => console.log("Inventory's quantity populated successfully!"))
    .catch((err) => console.log(err));
  db.end();
}

// generateInventoryQuantity();

// async function generateInventory() {
//   try {
//     const categoryRes = await getCategories();
//     categories = categoryRes.map((row) => ({
//       id: row.category_id,
//       name: row.name,
//       section: row.section,
//     }));
//     console.log("Categories loaded:", categories.length);
//   } catch (err) {
//     console.error("Error retrieving categories:", err);
//     return; // Exit if there's an error with categories
//   }

//   for (let i = 0; i < 1000; i++) {
//     // Choosing random category
//     const category_id = Math.floor(Math.random() * categories.length + 1);
//     let subcategory_id;
//     try {
//       // Retrieving according subcategories for the selected category
//       const subcategoryRes = await getSubcategories(category_id);
//       subcategories = subcategoryRes.map((row) => ({
//         id: row.subcategory_id,
//         name: row.name,
//         section: row.category_id,
//       }));

//       // Choosing random subcategory
//       const randomSubcategory =
//         subcategories[Math.floor(Math.random() * subcategories.length)];
//       subcategory_id = randomSubcategory.id;
//     } catch (err) {
//       console.error("Error retrieving subcategories:", err);
//     }

//   }
//   db.end();
// }

// generateInventory();
