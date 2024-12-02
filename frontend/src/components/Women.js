import React from "react";
import CategorySquare from "./CategorySquare";

const Women = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare imageSrc="/shoe.png" text="Shoes" link="/women/shoes" />
        <CategorySquare
          imageSrc="/women_bag.png"
          text="Handbags"
          link="/women/handbags"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Trousers"
          link="/women/trousers"
        />
        <CategorySquare
          imageSrc="/dress.png"
          text="Dresses"
          link="/women/dresses"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Shirts"
          link="/women/shirts"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Jackets"
          link="/women/jackets"
        />
      </div>
    </div>
  );
};

export default Women;
