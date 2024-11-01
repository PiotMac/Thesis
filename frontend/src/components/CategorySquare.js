import React from "react";
import { useNavigate } from "react-router-dom";

const CategorySquare = ({ imageSrc, text, link }) => {
  const navigate = useNavigate();

  // Function to handle the click and navigate to the provided link
  const handleClick = () => {
    navigate(link);
  };

  return (
    <div className="category-square" onClick={handleClick}>
      <img src={imageSrc} alt={text} className="square-image" />
      <p className="square-text">{text}</p>
    </div>
  );
};

export default CategorySquare;
