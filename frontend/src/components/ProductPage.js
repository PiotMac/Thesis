import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ProductPage = () => {
  const { product_id } = useParams();

  const [productData, setProductData] = useState({
    product_id: null,
    name: "",
    price: 0,
    material: "",
    description: "",
    brand: "",
    available_variations: [],
  });

  // Fetch product data from the server when component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/products/${product_id}`
        );
        if (!response.ok) {
          const errorText = await response.text(); // Get the response text
          console.log("Error response:", errorText);
          throw new Error("Failed to fetch a product");
        }
        console.log("here!!!");
        const data = await response.json();
        console.log("here2!!!");
        console.log(data.product_id);
        setProductData({
          product_id: data.product_id,
          name: data.name,
          price: data.price,
          material: data.material,
          description: data.description,
          brand: data.brand,
          available_variations: data.available_variations,
        });
        console.log(productData);
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [product_id]);

  return (
    <div className="product-page">
      <h2>{productData.name}</h2>
      <h3>{productData.brand}</h3>
      {/* <img src={imgSrc} alt={name} /> */}
      <p>{productData.price}zł</p>

      {/* Product details */}
      <p>
        <strong>Material:</strong> {productData.material}
      </p>
      <p>{productData.description}</p>

      {/* Display available size, color, and quantity variations */}
      <div className="product-variations">
        {productData.available_variations &&
        productData.available_variations.length > 0 ? (
          <ul>
            {productData.available_variations.map((variation, index) => (
              <li key={index}>
                <strong>Size:</strong> {variation.size} &nbsp;
                <strong>Color:</strong>{" "}
                <span
                  style={{
                    backgroundColor: `rgb(${variation.color.red}, ${variation.color.green}, ${variation.color.blue})`,
                    width: "20px",
                    height: "20px",
                    display: "inline-block",
                    borderRadius: "50%",
                  }}
                ></span>{" "}
                <strong>Quantity:</strong> {variation.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>No variations available</p>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
