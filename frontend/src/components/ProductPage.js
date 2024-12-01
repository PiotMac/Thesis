import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { List, ListItem, ListItemText } from "@mui/material";

const ProductPage = () => {
  const { product_id } = useParams();
  const location = useLocation();

  const [productData, setProductData] = useState({
    product_id: null,
    name: "",
    price: 0,
    material: "",
    description: "",
    brand: "",
    available_variations: [],
  });

  const [toggledData, setToggledData] = useState({
    color_id: "",
    color: "",
    size_id: "",
    size: "",
  });

  const [uniqueColors, setUniqueColors] = useState([]);
  const [sizesForColor, setSizesForColor] = useState([]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/products/${product_id}`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.log("Error response:", errorText);
          throw new Error("Failed to fetch a product");
        }
        const data = await response.json();

        setProductData({
          product_id: data.product_id,
          name: data.name,
          price: data.price,
          material: data.material,
          description: data.description,
          brand: data.brand,
          available_variations: data.available_variations,
        });

        const uniqueColors = [
          ...new Map(
            data.available_variations.map((variation) => [
              variation.color.color_id,
              {
                color_id: variation.color.color_id,
                red: variation.color.red,
                green: variation.color.green,
                blue: variation.color.blue,
              },
            ])
          ).values(),
        ];

        const uniqueSizes = [
          ...new Map(
            data.available_variations.map((variation) => [
              variation.size.size_id,
              {
                size_id: variation.size.size_id,
                size_name: variation.size.size_name,
              },
            ])
          ).values(),
        ];

        const sortedUniqueSizes = uniqueSizes.some(
          (size) => !isNaN(Number(size.size_name))
        )
          ? uniqueSizes.sort(
              (a, b) => Number(a.size_name) - Number(b.size_name)
            )
          : uniqueSizes;

        const defaultColor = uniqueColors[0];

        const sizesForColor = data.available_variations
          .filter(
            (variation) => variation.color.color_id === defaultColor.color_id
          )
          .map((variation) => ({
            size_id: variation.size.size_id,
            size_name: variation.size.size_name,
          }));

        setUniqueColors(uniqueColors);
        setSizesForColor(sizesForColor);
        setToggledData({
          color_id: defaultColor.color_id,
          color: `${defaultColor.red},${defaultColor.green},${defaultColor.blue}`,
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [product_id]);

  const handleColorChange = (selectedColor) => {
    setToggledData((prev) => ({
      ...prev,
      color_id: selectedColor.color_id,
      color: `${selectedColor.red},${selectedColor.green},${selectedColor.blue}`,
    }));

    // Filter sizes corresponding to the selected color
    const sizesForColor = productData.available_variations
      .filter(
        (variation) => variation.color.color_id === selectedColor.color_id
      )
      .map((variation) => ({
        size_id: variation.size.size_id,
        size_name: variation.size.size_name,
      }));

    // Update the state with filtered sizes
    setSizesForColor(sizesForColor);
  };

  const renderButtonStyle = (chosenFilter, item) => {
    // Check if the item is selected in the toggledData for the chosen filter
    return toggledData[chosenFilter] === item
      ? { backgroundColor: "#8E05C2", border: "1px solid #ccc" }
      : {};
  };

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Log in to add items to the cart!");
      return;
    }
    // const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!toggledData.size) {
      alert("Pick a size!");
      return;
    }
    const newItem = {
      product_id: productData.product_id,
      color_id: toggledData.color_id,
      size_id: toggledData.size_id,
    };

    try {
      const response = await fetch(
        `http://localhost:4000/products/${product_id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newItem),
        }
      );

      if (response.ok) {
        alert("Item added to the cart!");
      } else {
        const errorData = await response.json();
        console.log(errorData);
        alert("Failed to add item to the cart...");
      }
    } catch (error) {
      console.error("[CART] Error adding item:", error);
      alert("An error occurred while adding the item to the cart.");
    }
  };

  return (
    <div className="product-page-container">
      <div className="product-page-header-container">
        <h1>{productData.name}</h1>
      </div>
      <div className="product-image-and-button-container">
        <div className="product-image-container">
          <img src={location.state.image} alt={productData.name} />
        </div>
        <button onClick={addToCart}>Add to cart</button>
      </div>
      <div className="product-info-container">
        <div className="product-info">
          <h1 id="product-brand">{productData.brand}</h1>
          <h1 id="product-price">{productData.price}zł</h1>
        </div>
      </div>
      <div className="product-filters">
        <div className="product-colors-container">
          <h2>Colors</h2>
          <List
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr", // Automatically fills the row with as many squares as fit
              gridGap: "5px", // Space between the squares
              padding: 0, // Remove default padding
              backgroundColor: "#700B97",
              borderRadius: "10px",
            }}
          >
            {uniqueColors.map((color, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleColorChange(color)}
                style={{
                  ...renderButtonStyle(
                    "color",
                    `${color.red},${color.green},${color.blue}`
                  ),
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: `rgb(${color.red},${color.green},${color.blue}`,
                    borderRadius: "5px",
                    border: "black solid 2px",
                  }}
                ></div>
              </ListItem>
            ))}
          </List>
        </div>

        <div className="product-sizes-container">
          <h2>Sizes</h2>
          <List
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gridGap: "20px",
              padding: "10px",
              backgroundColor: "#700B97",
              borderRadius: "10px",
            }}
          >
            {sizesForColor.map((size, index) => (
              <ListItem
                button
                key={index}
                onClick={() =>
                  setToggledData((prev) => ({
                    ...prev,
                    size_id: size.size_id,
                    size: size.size_name,
                  }))
                }
                style={{
                  ...renderButtonStyle("size", size.size_name),
                  //   border: "black solid 2px",
                  //   borderRadius: "5px",
                  //   minWidth: "fit-content",
                  //   height: "100px",
                  //   backgroundColor: "#8E05C2",
                  cursor: "pointer",
                }}
              >
                <ListItemText
                  disableTypography
                  primary={size.size_name}
                  style={{
                    color: "gold",
                    fontWeight: "bold",
                    fontSize: "50px",
                    textAlign: "center",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
