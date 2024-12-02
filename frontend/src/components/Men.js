import React from "react";
import CategorySquare from "./CategorySquare";

const Men = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare imageSrc="/shoe.png" text="Shoes" link="/men/shoes" />
        <CategorySquare
          imageSrc="/bag.png"
          text="Bags and backpacks"
          link="/men/bags"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Trousers"
          link="/men/trousers"
        />
        <CategorySquare imageSrc="/suit.png" text="Suits" link="/men/suits" />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Shirts"
          link="/men/shirts"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Jackets"
          link="/men/jackets"
        />
      </div>
    </div>
  );
};

export default Men;
