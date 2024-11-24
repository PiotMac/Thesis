import React from "react";
import CategorySquare from "./CategorySquare";

const Men = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare
          imageSrc="/shoe.png"
          text="Obuwie"
          link="/meskie/obuwie"
        />
        <CategorySquare
          imageSrc="/bag.png"
          text="Torby i plecaki"
          link="/meskie/torby"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Spodnie"
          link="/meskie/spodnie"
        />
        <CategorySquare
          imageSrc="/suit.png"
          text="Garnitury"
          link="/meskie/garnitury"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Koszulki"
          link="/meskie/koszulki"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Kurtki"
          link="/meskie/kurtki"
        />
      </div>
    </div>
  );
};

export default Men;
