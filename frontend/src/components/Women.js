import React from "react";
import CategorySquare from "./CategorySquare";

const Women = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare
          imageSrc="/shoe.png"
          text="Obuwie"
          link="/damskie/obuwie"
        />
        <CategorySquare
          imageSrc="/women_bag.png"
          text="Torebki"
          link="/damskie/torebki"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Spodnie"
          link="/damskie/spodnie"
        />
        <CategorySquare
          imageSrc="/dress.png"
          text="Sukienki"
          link="/damskie/sukienki"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Koszulki"
          link="/damskie/koszulki"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Kurtki"
          link="/damskie/kurtki"
        />
      </div>
    </div>
  );
};

export default Women;
