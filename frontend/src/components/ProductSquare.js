import React from "react";
import { useNavigate } from "react-router-dom";

const ProductSquare = ({
  product_id,
  brand,
  name,
  price,
  material,
  description,
  imgSrc,
}) => {
  const navigate = useNavigate();

  // Function to handle the click and navigate to the provided link
  const handleClick = () => {
    navigate(`/products/${product_id}`, { state: { image: imgSrc } });
  };

  return (
    <div className="product-square" onClick={handleClick}>
      <h2>{name}</h2>
      <h3>{brand}</h3>
      <img src={imgSrc} alt={name} />
      <p>{price}$</p>
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
