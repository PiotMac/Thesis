import React from "react";
import CategorySquare from "./CategorySquare";

const Women = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare
          imageSrc="/shoe.png"
          text="Obuwie"
          link="/women/shoes"
        />
        <CategorySquare
          imageSrc="/women_bag.png"
          text="Torebki"
          link="/women/bags"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Spodnie"
          link="/women/trousers"
        />
        <CategorySquare
          imageSrc="/dress.png"
          text="Sukienki"
          link="/women/dresses"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Koszulki"
          link="/women/shirts"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Kurtki"
          link="/women/jackets"
        />
      </div>
    </div>
  );
};

export default Women;
