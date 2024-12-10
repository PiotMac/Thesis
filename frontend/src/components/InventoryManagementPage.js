import React, { useState, useEffect } from "react";

const InventoryManagementPage = () => {
  const [productId, setProductId] = useState("");
  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () => {
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
