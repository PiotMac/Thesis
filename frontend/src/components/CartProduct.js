import React from "react";

const CartProduct = ({ item, onEdit, onDelete }) => {
  return (
    <div className="cart-product-container">
      <div className="cart-product-left">
        <h1>{item.name}</h1>
        <h2 id="cart-product-brand">{item.brand}</h2>
        <h2>Rozmiar: {item.size_name}</h2>
        <div id="color-cart-product-container">
          <h2>Kolor: </h2>
          <div
            style={{
              height: "80%",
              aspectRatio: "1",
              backgroundColor: `rgb(${item.red},${item.green},${item.blue}`,
              borderRadius: "5px",
              border: "black solid 2px",
            }}
          ></div>
        </div>
        <h2>Ilość: {item.quantity}</h2>
      </div>
      <div className="cart-product-right">
        <div className="cart-product-right-top">
          <h1>{item.total_price.toFixed(2)}zł</h1>
          {item.quantity > 1 && <h2>Za sztukę: {item.price.toFixed(2)}zł</h2>}
        </div>
        <div className="cart-product-right-bottom">
          <div className="product-button-container">
            <button
              id="edit-product-button"
              onClick={() => onEdit(item.cart_id, item.quantity, item.price)}
            >
              Edytuj
            </button>
            <button
              id="delete-product-button"
              onClick={() => onDelete(item.cart_id, item.quantity, item.price)}
            >
              Usuń
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
