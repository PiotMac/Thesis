import React, { useEffect, useState } from "react";
import CartProduct from "./CartProduct";
import { useNavigate } from "react-router-dom";
import { List, ListItem, ListItemText } from "@mui/material";
import { jwtDecode } from "jwt-decode";

const CartPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch (error) {
      console.error("Invalid token:", error);
      return false;
    }
  };

  useEffect(() => {
    const fetchAllItems = async () => {
      const token = localStorage.getItem("token");

      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
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
          return item.inventory_quantity > 0 ? total + item.total_price : total;
        }, 0);

        setCartItems(data);
        setTotalPrice(totalPriceOfProducts);
      } catch (error) {
        console.error("Error fetching cart data: ", error);
      }
    };

    fetchAllItems();
  }, []);

  const editProduct = async (
    cart_id,
    currentQuantity,
    itemPrice,
    itemInventoryQuantity
  ) => {
    const newQuantity = parseInt(
      prompt(
        `Enter the new quantity (maximum ${itemInventoryQuantity}):`,
        currentQuantity
      ),
      10
    );

    if (
      !newQuantity ||
      newQuantity <= 0 ||
      newQuantity > itemInventoryQuantity
    ) {
      alert("Invalid quantity!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
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
      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
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

  const payForProducts = async () => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    navigate("/checkout", { state: { cartItems } });
  };

  return (
    <div className="cart-page-container">
      {cartItems.length === 0 ? (
        <div className="empty-cart-container">
          <h1>Your cart is empty!</h1>
        </div>
      ) : (
        <>
          <div className="cart-product-list">
            {cartItems.map((item) => (
              <CartProduct
                key={item.cart_id}
                item={item}
                onEdit={editProduct}
                onDelete={deleteProduct}
                showButtons={true}
              />
            ))}
          </div>
          <div className="cart-price-button-container">
            <h1>Summary</h1>
            <div className="price-sum-container">
              <h2>Total: </h2>
              <h2 id="total-price-header">{totalPrice.toFixed(2)}$</h2>
            </div>
            <div className="pay-button-container">
              <button onClick={payForProducts}>Pay</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
