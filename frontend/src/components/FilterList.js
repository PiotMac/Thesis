import React, { useEffect, useState, useRef } from "react";
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
  const filter_values_for_db = ["price", "brand", "material"];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sliderValue, setSliderValue] = useState([minPrice, maxPrice]);

  const [filterData, setFilterData] = useState({
    materials: [],
    prices: [],
    brands: [],
  });

  const [toggledData, setToggledData] = useState({
    material: [],
    brand: [],
    price: [],
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
      // const uniquePrices = Array.from(
      //   new Set(
      //     products.map((product) => product.price).filter((price) => price)
      //   )
      // );
      const uniqueBrands = Array.from(
        new Set(
          products.map((product) => product.brand).filter((brand) => brand)
        )
      );

      // Update the filterData state
      setFilterData({
        materials: uniqueMaterials,
        prices: prices,
        brands: uniqueBrands,
      });
    };
    updateFilterData();
  }, [products]);

  useEffect(() => {
    console.log(toggledData);
  }, [toggledData]);

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue);
  };

  const handleMinPriceChange = (event) => {
    const newMinPrice = event.target.value;
    if (newMinPrice >= minPrice && newMinPrice <= maxPrice) {
      setSliderValue([newMinPrice, sliderValue[1]]);
    }
  };

  const handleMaxPriceChange = (event) => {
    const newMaxPrice = event.target.value;
    if (newMaxPrice >= minPrice && newMaxPrice <= maxPrice) {
      setSliderValue([sliderValue[0], newMaxPrice]);
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
      if (selectedValues.length > 0) {
        filteredProducts = filteredProducts.filter((product) =>
          selectedValues.includes(product[key])
        );
      }
    });

    setProducts(filteredProducts);
  };

  const resetFilters = () => {
    setToggledData({
      material: [],
      brand: [],
      price: [],
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
                style={renderButtonStyle("material", material)}
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
        return <Typography variant="body2">Select a size filter</Typography>;
      case "Cena":
        return (
          <Box sx={{ width: 300 }}>
            {/* <Slider
              value={sliderValue}
              min={minPrice}
              max={maxPrice}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `$${value}`}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Input
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
                value={sliderValue[1]}
                onChange={handleMaxPriceChange}
                inputProps={{
                  step: 1,
                  min: minPrice,
                  max: maxPrice,
                  type: "number",
                }}
              />
            </Box> */}
          </Box>
        );
      case "Marka":
        return (
          <List>
            {filterData.brands.map((brand, index) => (
              <ListItem
                button={true}
                key={index}
                onClick={() => toggleFilter("brand", brand)}
                selected={toggledData.brand.includes(brand)}
              >
                <ListItemText primary={brand} />
              </ListItem>
            ))}
          </List>
        );
      case "Kolor":
        return <Typography variant="body2">Select a color filter</Typography>;
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
