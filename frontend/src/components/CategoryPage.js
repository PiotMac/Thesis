import React, { useEffect, useState } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import FilterList from "./FilterList";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import ProductSquare from "./ProductSquare";

const CategoryPage = () => {
  const { mainCategory, subcategory, subsubcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [originalProducts, setOriginalProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [imagePath, setImagePath] = useState("");

  const imageMap = {
    obuwie: "/shoe.png",
    koszulki: "/shirt.png",
    spodnie: "/trousers.png",
    kurtki: "/jacket.png",
    sukienki: "/dress.png",
    torebki: "/women_bag.png",
    torby: "/bag.png",
    pizamy: "/pyjamas.png",
    garnitury: "/suit.png",
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let url = `http://localhost:4000/${mainCategory}/${subcategory}`;
        if (subsubcategory) {
          url += `/${subsubcategory}`;
          console.log(url);
        }
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch subcategories");
        }
        const data = await response.json();
        setSubcategories(data.subcategories.map((item) => item.name));
        const productsData = data.products.map((item) => ({
          product_id: item.product_id,
          brand: item.brand,
          name: item.name,
          price: item.price,
          material: item.material,
          description: item.description,
          colors: item.colors,
          sizes: item.sizes,
        }));

        setProducts(productsData);
        setOriginalProducts(productsData);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchData();
  }, [mainCategory, subcategory, subsubcategory]);

  // Change the photo of products
  useEffect(() => {
    const changeImage = () => {
      setImagePath(imageMap[subcategory]);
    };
    changeImage();
  }, [subcategory]);

  return (
    <div className="container_page">
      <div className="category_page_header_container">
        <h1 className="category_page_header">
          {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}{" "}
          {subcategory}
        </h1>
        <FilterList
          products={products}
          setProducts={setProducts}
          originalProducts={originalProducts}
        />
      </div>
      <div className="products_container">
        {products.map((product, index) => (
          <ProductSquare
            key={index}
            product_id={product.product_id}
            brand={product.brand}
            name={product.name}
            price={product.price}
            material={product.material}
            description={product.description}
            imgSrc={imagePath}
          />
        ))}
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
                <NavLink
                  to={`${mainCategory}/${subcategory}/${name}`}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
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
