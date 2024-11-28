import React from "react";

const ProductSquare = ({
  brand,
  name,
  price,
  material,
  description,
  imgSrc,
}) => {
  return (
    <div className="product-square">
      <h2>{name}</h2>
      <h3>{brand}</h3>
      <img src={imgSrc} alt={name} />
      <p>{price}zł</p>
      {/* <p>
        <strong>Price:</strong> ${price}
      </p>
      <p>
        <strong>Material:</strong> {material}
      </p>
      <p>{description}</p> */}
    </div>
  );
};

export default ProductSquare;
