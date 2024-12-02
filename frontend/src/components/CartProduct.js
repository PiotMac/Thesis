import React from "react";

const CartProduct = ({ item, onEdit, onDelete, showButtons }) => {
  const isOutOfStock = item.inventory_quantity === 0;
  return (
    <div className="cart-product-container">
      <div className="cart-product-left">
        <h1>{item.name}</h1>
        <h2 id="cart-product-brand">{item.brand}</h2>
        <h2>Size: {item.size_name}</h2>
        <div id="color-cart-product-container">
          <h2>Color: </h2>
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
        <h2>Quantity: {item.quantity}</h2>
        {isOutOfStock && (
          <h3 style={{ color: "red", fontWeight: "bold" }}>
            PRODUCT UNAVAILABLE
          </h3>
        )}
      </div>
      <div className="cart-product-right">
        <div className="cart-product-right-top">
          <h1>{item.total_price.toFixed(2)}$</h1>
          {item.quantity > 1 && <h2>Per piece: {item.price.toFixed(2)}$</h2>}
        </div>
        {showButtons && (
          <div className="cart-product-right-bottom">
            <div className="product-button-container">
              <button
                id="edit-product-button"
                onClick={() =>
                  onEdit(
                    item.cart_id,
                    item.quantity,
                    item.price,
                    item.inventory_quantity
                  )
                }
              >
                Edit
              </button>
              <button
                id="delete-product-button"
                onClick={() =>
                  onDelete(item.cart_id, item.quantity, item.price)
                }
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartProduct;
