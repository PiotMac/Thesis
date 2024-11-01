import React from "react";
import CategorySquare from "./CategorySquare";

const Kids = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare imageSrc="/shoe.png" text="Obuwie" link="/women" />
        <CategorySquare
          imageSrc="/bag.png"
          text="Torby i plecaki"
          link="/men"
        />
        <CategorySquare imageSrc="/trousers.png" text="Spodnie" link="/kids" />
        <CategorySquare
          imageSrc="/pyjamas.png"
          text="Piżamy"
          link="/accessories"
        />
        <CategorySquare imageSrc="/shirt.png" text="Koszulki" link="/shoes" />
        <CategorySquare imageSrc="/jacket.png" text="Kurtki" link="/new" />
      </div>
    </div>
  );
};

export default Kids;
