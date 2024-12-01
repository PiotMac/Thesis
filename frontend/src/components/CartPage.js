import React, { useEffect, useState } from "react";
import CartProduct from "./CartProduct";
import { useNavigate } from "react-router-dom";
import { List, ListItem, ListItemText } from "@mui/material";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchAllItems = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/cart", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch cart's products!");
        }
        const data = await response.json();
        const totalPriceOfProducts = data.reduce((total, item) => {
          return total + item.total_price;
        }, 0);

        setCartItems(data);
        setTotalPrice(totalPriceOfProducts);
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
    };

    fetchAllItems();
  }, []);

  const editProduct = async (cart_id, currentQuantity, itemPrice) => {
    const newQuantity = parseInt(
      prompt("Enter the new quantity:", currentQuantity),
      10
    );
    // TODO: Add inventory.quantity as maximum
    if (!newQuantity || newQuantity <= 0) {
      alert("Invalid quantity!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`http://localhost:4000/cart`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartID: cart_id, newQuantity: newQuantity }),
      });

      if (!response.ok) {
        alert("Failed to update quantity!");
        return;
      }

      const newItemTP = parseFloat((itemPrice * newQuantity).toFixed(2));

      setCartItems((prev) =>
        prev.map((item) =>
          item.cart_id === cart_id
            ? {
                ...item,
                quantity: newQuantity,
                total_price: newItemTP,
              }
            : item
        )
      );
      const newTotalPrice = parseFloat(
        (totalPrice + (newQuantity - currentQuantity) * itemPrice).toFixed(2)
      );

      setTotalPrice(newTotalPrice);
    } catch (error) {
      console.error("Error updating product: ", error);
    }
  };

  const deleteProduct = async (cart_id, currentQuantity, itemPrice) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await fetch(`http://localhost:4000/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cartID: cart_id }),
      });

      if (!response.ok) {
        alert("Failed to delete a product!");
        return;
      }

      setCartItems((prev) => prev.filter((item) => item.cart_id !== cart_id));

      const newTotalPrice = parseFloat(
        (totalPrice - currentQuantity * itemPrice).toFixed(2)
      );

      setTotalPrice(newTotalPrice);
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  return (
    <div className="cart-page-container">
      <div className="cart-product-list">
        {cartItems.map((item) => (
          <CartProduct
            key={item.cart_id}
            item={item}
            onEdit={editProduct}
            onDelete={deleteProduct}
          />
        ))}
      </div>
      <div className="cart-price-button-container">
        <h1>Podsumowanie</h1>
        <div className="price-sum-container">
          <h2>Łącznie: </h2>
          <h2 id="total-price-header">{totalPrice}zł</h2>
        </div>
        <div className="pay-button-container">
          <button>Zapłać</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
