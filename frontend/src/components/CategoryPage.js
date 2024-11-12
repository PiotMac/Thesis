import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CategoryPage = () => {
  const { mainCategory, subcategory } = useParams(); // Get mainCategory and subcategory from URL
  const [products, setProducts] = useState([]);

  //   useEffect(() => {
  //     // Fetch or filter products based on mainCategory and subcategory
  //     // Assuming you have an API endpoint or a function to get products by category
  //     const fetchProducts = async () => {
  //       const response = await fetch(
  //         `http://localhost:4000/${mainCategory}/${subcategory}`
  //       );
  //       //setProducts(response.data);
  //     };

  //     fetchProducts();
  //   }, [mainCategory, subcategory]);

  return (
    <div>
      <h1>
        {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}'s{" "}
        {subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}
      </h1>
      {/* <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price}</p>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default CategoryPage;
