import React from "react";
import CategorySquare from "./CategorySquare";

const Women = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare imageSrc="/shoe.png" text="Obuwie" link="/women" />
        <CategorySquare imageSrc="/women_bag.png" text="Torebki" link="/men" />
        <CategorySquare imageSrc="/trousers.png" text="Spodnie" link="/kids" />
        <CategorySquare
          imageSrc="/dress.png"
          text="Sukienki"
          link="/accessories"
        />
        <CategorySquare imageSrc="/shirt.png" text="Koszulki" link="/shoes" />
        <CategorySquare imageSrc="/jacket.png" text="Kurtki" link="/new" />
      </div>
    </div>
  );
};

export default Women;
