import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
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
import { useParams } from "react-router-dom";

const FilterList = ({ products, setProducts, originalProducts }) => {
  const theme = createTheme({
    typography: {
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    },
  });

  const filters = ["Rozmiar", "Cena", "Marka", "Kolor", "Materiał"];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sliderValue, setSliderValue] = useState([minPrice, maxPrice]);

  const [filterData, setFilterData] = useState({
    materials: [],
    brands: [],
    colors: [],
    sizes: [],
  });

  const [toggledData, setToggledData] = useState({
    material: [],
    brand: [],
    color: [],
    size: [],
    minFilterPrice: minPrice,
    maxFilterPrice: maxPrice,
  });

  useEffect(() => {
    const updateFilterData = () => {
      const uniqueMaterials = Array.from(
        new Set(
          products
            .map((product) => product.material)
            .filter((material) => material)
        )
      );

      const prices = products.map((product) => product.price);
      setMinPrice(Math.min(...prices));
      setMaxPrice(Math.max(...prices));
      setSliderValue([minPrice, maxPrice]);

      const uniqueBrands = Array.from(
        new Set(
          products.map((product) => product.brand).filter((brand) => brand)
        )
      );

      // Extract unique colors by checking if 'colors' exists
      const uniqueColors = Array.from(
        new Set(
          products.flatMap(
            (product) =>
              product.colors?.map((color) =>
                JSON.stringify({
                  red: color.red,
                  green: color.green,
                  blue: color.blue,
                })
              ) || [] // If colors is undefined, return an empty array
          )
        )
      ).map((color) => {
        const { red, green, blue } = JSON.parse(color);
        return `rgb(${red}, ${green}, ${blue})`; // Convert back to rgb string
      });

      // Extract unique sizes by checking if 'sizes' exists
      const uniqueSizes = Array.from(
        new Set(
          products.flatMap(
            (product) => product.sizes?.map((size) => size.name) || []
          ) // If sizes is undefined, return an empty array
        )
      );

      console.log("Unique sizes: ", uniqueSizes);

      // Update the filterData state
      setFilterData({
        materials: uniqueMaterials,
        brands: uniqueBrands,
        colors: uniqueColors,
        sizes: uniqueSizes,
      });
    };
    updateFilterData();
  }, [products]);

  useEffect(() => {
    console.log(toggledData);
  }, [toggledData]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
    setToggledData((prev) => ({
      ...prev,
      minFilterPrice: newValue[0],
      maxFilterPrice: newValue[1],
    }));
  };

  const handleMinPriceChange = (event) => {
    const newMinPrice = event.target.value;
    if (newMinPrice >= minPrice && newMinPrice <= maxPrice) {
      setSliderValue([newMinPrice, sliderValue[1]]);
      setToggledData((prev) => ({
        ...prev,
        minFilterPrice: newMinPrice,
      }));
    }
  };

  const handleMaxPriceChange = (event) => {
    const newMaxPrice = event.target.value;
    if (newMaxPrice >= minPrice && newMaxPrice <= maxPrice) {
      setSliderValue([sliderValue[0], newMaxPrice]);
      setToggledData((prev) => ({
        ...prev,
        maxFilterPrice: newMaxPrice,
      }));
    }
  };

  const toggleFilter = (chosenFilter, item) => {
    setToggledData((prev) => {
      const updatedItems = prev[chosenFilter].includes(item)
        ? prev[chosenFilter].filter((i) => i !== item)
        : [...prev[chosenFilter], item];

      return { ...prev, [chosenFilter]: updatedItems };
    });
  };

  const toggleDrawer = (open) => {
    setIsDrawerOpen(open);
  };

  const openDialog = (filter) => {
    setSelectedFilter(filter);
    toggleDrawer(true);
  };

  const filterProducts = () => {
    let filteredProducts = products;

    Object.keys(toggledData).forEach((key) => {
      const selectedValues = toggledData[key];
      if (key === "minFilterPrice" || key === "maxFilterPrice") {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.price >= toggledData.minFilterPrice &&
            product.price <= toggledData.maxFilterPrice
        );
      } else if (key === "color" && selectedValues.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          product.colors.some((color) =>
            selectedValues.includes(
              `rgb(${color.red}, ${color.green}, ${color.blue})`
            )
          )
        );
      } else if (key === "size" && selectedValues.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          product.sizes.some((size) => selectedValues.includes(size.name))
        );
      } else if (selectedValues.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          selectedValues.includes(product[key])
        );
      }
    });

    if (filteredProducts.length > 0) {
      const prices = filteredProducts.map((product) => product.price);
      const newMinPrice = Math.min(...prices);
      const newMaxPrice = Math.max(...prices);

      setMinPrice(newMinPrice);
      setMaxPrice(newMaxPrice);
      setSliderValue([newMinPrice, newMaxPrice]);
    }

    setProducts(filteredProducts);
  };

  const resetFilters = () => {
    setToggledData({
      material: [],
      brand: [],
      color: [],
      size: [],
    });
    setProducts(originalProducts);
  };

  const renderButtonStyle = (chosenFilter, item) => {
    // Check if the item is selected in the toggledData for the chosen filter
    return toggledData[chosenFilter].includes(item)
      ? { backgroundColor: "#8E05C2", border: "1px solid #ccc" }
      : {};
  };

  const renderDrawerContent = () => {
    switch (selectedFilter) {
      case "Materiał":
        return (
          <List>
            {filterData.materials.map((material, index) => (
              <ListItem
                button="true"
                key={index}
                onClick={() => toggleFilter("material", material)}
                style={{
                  ...renderButtonStyle("material", material),
                  cursor: "pointer",
                }}
              >
                <ListItemText
                  disableTypography
                  primary={material}
                  style={{
                    color: "gold",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                />
              </ListItem>
            ))}
          </List>
        );
      case "Rozmiar":
        return (
          <List>
            {filterData.sizes.map((size, index) => (
              <ListItem
                button="true"
                key={index}
                onClick={() => toggleFilter("size", size)}
                style={{
                  ...renderButtonStyle("size", size),
                  cursor: "pointer",
                }}
              >
                <ListItemText
                  disableTypography
                  primary={size}
                  style={{
                    color: "gold",
                    fontWeight: "bold",
                    fontSize: "20px",
                    textAlign: "center",
                  }}
                />
              </ListItem>
            ))}
          </List>
        );
      case "Cena":
        return (
          <Box
            sx={{
              width: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Slider
              sx={{ width: "80%", color: "gold" }}
              value={sliderValue}
              min={minPrice}
              max={maxPrice}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "80%",
              }}
            >
              <Input
                sx={{
                  width: "fit-content",
                  color: "white",
                  fontWeight: "bold",
                }}
                value={sliderValue[0]}
                onChange={handleMinPriceChange}
                inputProps={{
                  step: 1,
                  min: minPrice,
                  max: maxPrice,
                  type: "number",
                }}
              />
              <Input
                sx={{
                  width: "fit-content",
                  color: "white",
                  fontWeight: "bold",
                }}
                value={sliderValue[1]}
                onChange={handleMaxPriceChange}
                inputProps={{
                  step: 1,
                  min: minPrice,
                  max: maxPrice,
                  type: "number",
                }}
              />
            </Box>
          </Box>
        );
      case "Marka":
        return (
          <List>
            {filterData.brands.map((brand, index) => (
              <ListItem
                button="true"
                key={index}
                onClick={() => toggleFilter("brand", brand)}
                style={{
                  ...renderButtonStyle("brand", brand),
                  cursor: "pointer",
                }}
              >
                <ListItemText
                  disableTypography
                  primary={brand}
                  style={{
                    color: "gold",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                />
              </ListItem>
            ))}
          </List>
        );
      case "Kolor":
        return (
          <List
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, 80px)", // Automatically fills the row with as many squares as fit
              gridGap: "5px", // Space between the squares
              padding: 0, // Remove default padding
            }}
          >
            {filterData.colors.map((color, index) => (
              <ListItem
                button
                key={index}
                onClick={() => toggleFilter("color", color)}
                style={{
                  ...renderButtonStyle("color", color),
                  cursor: "pointer",
                }}
              >
                {/* Square div with background color */}
                <div
                  style={{
                    width: "50px", // Adjust the size of the square
                    height: "50px",
                    backgroundColor: color, // color here is already in rgb(r, g, b) format
                    borderRadius: "5px", // Optional: add rounded corners
                    border: "black solid 2px",
                  }}
                ></div>
              </ListItem>
            ))}
          </List>
        );
      default:
        return (
          <Typography variant="body2">Select a filter to apply</Typography>
        );
    }
  };

  return (
    <div className="filters_container">
      {filters.map((filter, index) => (
        <button
          key={index}
          className="filter"
          onClick={() => openDialog(filter)}
        >
          {filter}
        </button>
      ))}
      <button
        id="sort_button"
        className="filter"
        onClick={() => filterProducts()}
      >
        Filtruj
      </button>
      <button
        id="reset_button"
        className="filter"
        onClick={() => resetFilters()}
      >
        Reset
      </button>
      <ThemeProvider theme={theme}>
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => toggleDrawer(false)}
          sx={{
            "& .MuiDrawer-paper": {
              backgroundColor: "#700B97",
              padding: "20px",
              borderRadius: "30px 0px 0px 0px",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", color: "white" }}
            >
              {selectedFilter}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 250,
              padding: 2,
            }}
          >
            <div className="current_filters_container">
              {renderDrawerContent()}
            </div>
          </Box>
        </Drawer>
      </ThemeProvider>
    </div>
  );
};
export default FilterList;
