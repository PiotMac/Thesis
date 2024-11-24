import React, { useState } from "react";
import { Drawer, Box, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

const FilterList = () => {
  const filters = ["Rozmiar", "Cena", "Marka", "Kolor", "Materiał"];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("");
  const { mainCategory, category, subcategory } = useParams();

  //   const toggleDrawer = (open) => (event) => {
  //     if (
  //       event.type === "keydown" &&
  //       (event.key === "Tab" || event.key === "Shift")
  //     ) {
  //       return;
  //     }
  //     console.log(open);
  //     setIsDrawerOpen(open);
  //   };
  const toggleDrawer = (open) => {
    setIsDrawerOpen(open);
  };

  const openDialog = (filter) => {
    setSelectedFilter(filter);
    toggleDrawer(true);
  };

  const sortProducts = () => {
    console.log("sth");
  };

  //   const fetchAllInfoAboutFilters = async () => {
  //     try {
  //       let url = `http://localhost:4000/${mainCategory}/${category}`;
  //       if (subcategory) {
  //         url += `/${subcategory}`;
  //       }
  //       const response = await fetch(url);
  //       const data = await response.json();
  //       //setSizes(data); // Store the sizes from the database in the state
  //     } catch (error) {
  //       console.error("Error fetching sizes:", error);
  //     }
  //   };

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
        onClick={() => sortProducts()}
      >
        Filtruj
      </button>
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
      >
        <Box sx={{ width: 250, padding: 2 }}>
          <Typography variant="h6">{selectedFilter}</Typography>
          <div className="current_filters_container"></div>
        </Box>
      </Drawer>
    </div>
  );
};
export default FilterList;
