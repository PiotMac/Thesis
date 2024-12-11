import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const InventoryManagementPage = ({ setIsLoggedIn }) => {
  const [productId, setProductId] = useState("");
  const [inventory, setInventory] = useState([]);
  const navigate = useNavigate();

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

  const fetchInventory = async () => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    if (!productId) return;
    try {
      const response = await fetch(
        `http://localhost:8000/inventory?product_id=${productId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    if (productId) fetchInventory();
  }, [productId]);

  return (
    <div className="inventory-management-page">
      <div className="inventory-management">
        <h1 className="inventory-title">Inventory Management</h1>
        <div className="inventory-form">
          <label className="inventory-label">
            Product ID:
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="inventory-input"
            />
          </label>
          <button onClick={fetchInventory} className="inventory-button">
            Fetch Inventory
          </button>
        </div>

        <table className="inventory-table">
          <thead>
            <tr>
              <th className="inventory-table-header">Size</th>
              <th className="inventory-table-header">Color (RGB)</th>
              <th className="inventory-table-header">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item, index) => (
              <tr key={index} className="inventory-table-row">
                <td className="inventory-table-cell">{item.size_name}</td>
                <td className="inventory-table-cell">
                  <div
                    className="color-block"
                    style={{
                      backgroundColor: `rgb(${item.red}, ${item.green}, ${item.blue})`,
                    }}
                  ></div>
                </td>
                <td className="inventory-table-cell">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManagementPage;
