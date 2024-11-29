import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Slider,
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Input,
} from "@mui/material";

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

  const [filterData, setFilterData] = useState({
    colors: [],
    sizes: [],
  });

  const [toggledData, setToggledData] = useState({
    color: "",
    size: "",
  });

  const [uniqueColors, setUniqueColors] = useState([]);
  const [uniqueSizes, setUniqueSizes] = useState([]);
  const [sizesForColor, setSizesForColor] = useState([]);

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
          ...new Set(
            data.available_variations.map(
              (variation) =>
                `${variation.color.red},${variation.color.green},${variation.color.blue}`
            )
          ),
        ];

        console.log("Colors: ", uniqueColors);

        const uniqueSizes = [
          ...new Set(
            data.available_variations.map((variation) => variation.size)
          ),
        ];

        const sortedUniqueSizes = uniqueSizes.some(
          (size) => !isNaN(Number(size))
        )
          ? uniqueSizes.sort((a, b) => Number(a) - Number(b))
          : uniqueSizes;

        console.log("Sizes: ", uniqueSizes);
        console.log("Options: ", data.available_variations);

        const [red, green, blue] = uniqueColors[0].split(",");
        const sizesForColor = data.available_variations
          .filter(
            (variation) =>
              variation.color.red == red &&
              variation.color.green == green &&
              variation.color.blue == blue
          )
          .map((variation) => variation.size);

        console.log("Chosen color: ", uniqueColors[0]);
        console.log("Avail: ", sizesForColor);

        setUniqueColors(uniqueColors);
        setSizesForColor(sizesForColor);
        setToggledData({
          color: uniqueColors[0],
        });
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProductData();
  }, [product_id]);

  useEffect(() => {
    console.log(toggledData);
  }, [toggledData]);

  const handleColorChange = (selectedColor) => {
    const [red, green, blue] = selectedColor.split(",");

    setToggledData({ color: selectedColor });

    console.log("Chosen color: ", selectedColor);
    console.log("Avail: ", productData.available_variations);

    // Filter sizes corresponding to the selected color
    const sizesForColor = productData.available_variations
      .filter(
        (variation) =>
          variation.color.red == red &&
          variation.color.green == green &&
          variation.color.blue == blue
      )
      .map((variation) => variation.size);

    console.log(sizesForColor);

    // // Update the state with filtered sizes
    setSizesForColor(sizesForColor);
  };

  const renderButtonStyle = (chosenFilter, item) => {
    // Check if the item is selected in the toggledData for the chosen filter
    return toggledData[chosenFilter] === item
      ? { backgroundColor: "#8E05C2", border: "1px solid #ccc" }
      : {};
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
        <button>Add to cart</button>
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
                  ...renderButtonStyle("color", color),
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: `rgb(${color})`,
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
                  setToggledData((prev) => ({ ...prev, size: size }))
                }
                style={{
                  ...renderButtonStyle("size", size),
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
                  primary={size}
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
