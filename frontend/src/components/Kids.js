import React from "react";
import CategorySquare from "./CategorySquare";

const Kids = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare imageSrc="/shoe.png" text="Obuwie" link="/kids/shoes" />
        <CategorySquare
          imageSrc="/bag.png"
          text="Torby i plecaki"
          link="/kids/bags"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Spodnie"
          link="/kids/trousers"
        />
        <CategorySquare
          imageSrc="/pyjamas.png"
          text="Piżamy"
          link="/kids/pyjamas"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Koszulki"
          link="/kids/shirts"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Kurtki"
          link="/kids/jackets"
        />
      </div>
    </div>
  );
};

export default Kids;
