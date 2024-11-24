import React, { useEffect, useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import FilterList from "./FilterList";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";

const CategoryPage = () => {
  const { mainCategory, subcategory, subsubcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `http://localhost:4000/${mainCategory}/${subcategory}`;
        if (subsubcategory) {
          console.log(url);
          url += `/${subsubcategory}`;
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch subcategories");
        }
        const data = await response.json();
        setSubcategories(data.map((item) => item.name));
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchData();
  }, [mainCategory, subcategory, subsubcategory]);

  return (
    <div className="container_page">
      <div className="category_page_header_container">
        <h1 className="category_page_header">
          {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}{" "}
          {subcategory}
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
        <FilterList />
      </div>
      <div className="subcategories_nav_container">
        <div className="subcategories_nav">
          <h1>Kategorie</h1>
          <ul className="subcategories_list">
            {subcategories.map((name, index) => (
              <li
                key={index}
                onClick={() =>
                  navigate(`/${mainCategory}/${subcategory}/${name}`)
                }
              >
                <NavLink to={`${mainCategory}/${subcategory}/${name}`}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
