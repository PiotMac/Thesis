import React from "react";
import CategorySquare from "./CategorySquare";

const Men = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare imageSrc="/shoe.png" text="Obuwie" link="/men/shoes" />
        <CategorySquare
          imageSrc="/bag.png"
          text="Torby i plecaki"
          link="/men/bags"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Spodnie"
          link="/men/trousers"
        />
        <CategorySquare
          imageSrc="/suit.png"
          text="Garnitury"
          link="/men/suits"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Koszulki"
          link="/men/shirts"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Kurtki"
          link="/men/jackets"
        />
      </div>
    </div>
  );
};

export default Men;
