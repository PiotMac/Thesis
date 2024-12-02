import React from "react";
import CategorySquare from "./CategorySquare";

const Kids = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare imageSrc="/shoe.png" text="Shoes" link="/kids/shoes" />
        <CategorySquare
          imageSrc="/bag.png"
          text="Bags and backpacks"
          link="/kids/bags"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Trousers"
          link="/kids/trousers"
        />
        <CategorySquare
          imageSrc="/pyjamas.png"
          text="Pyjamas"
          link="/kids/pyjamas"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Shirts"
          link="/kids/shirts"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Jackets"
          link="/kids/jackets"
        />
      </div>
    </div>
  );
};

export default Kids;
