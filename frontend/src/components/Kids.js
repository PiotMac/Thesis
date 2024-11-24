import React from "react";
import CategorySquare from "./CategorySquare";

const Kids = () => {
  return (
    <div className="app">
      <div className="categories_grid">
        <CategorySquare
          imageSrc="/shoe.png"
          text="Obuwie"
          link="/dzieciece/obuwie"
        />
        <CategorySquare
          imageSrc="/bag.png"
          text="Torby i plecaki"
          link="/dzieciece/torby"
        />
        <CategorySquare
          imageSrc="/trousers.png"
          text="Spodnie"
          link="/dzieciece/spodnie"
        />
        <CategorySquare
          imageSrc="/pyjamas.png"
          text="Piżamy"
          link="/dzieciece/pizamy"
        />
        <CategorySquare
          imageSrc="/shirt.png"
          text="Koszulki"
          link="/dzieciece/koszulki"
        />
        <CategorySquare
          imageSrc="/jacket.png"
          text="Kurtki"
          link="/dzieciece/kurtki"
        />
      </div>
    </div>
  );
};

export default Kids;
