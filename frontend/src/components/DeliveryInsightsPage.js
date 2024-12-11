import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const DeliveryInsightsPage = ({ setIsLoggedIn }) => {
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [dragging, setDragging] = useState(false);
  const selectedRowsRef = useRef(new Set());
  const [newDelivery, setNewDelivery] = useState({
    inventory_id: "",
    quantity: "",
    delivery_price: "",
    delivery_date: "",
  });

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

  // Fetch pending deliveries
  const fetchPendingDeliveries = async () => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/pending_deliveries");
      const data = await response.json();
      setPendingDeliveries(data);
    } catch (error) {
      console.error("Error fetching pending deliveries:", error);
    }
  };

  // Create a new delivery
  const createNewDelivery = async () => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    const queryParams = new URLSearchParams(newDelivery).toString();
    try {
      const response = await fetch(
        `http://localhost:8000/create_delivery?${queryParams}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        alert("New delivery created successfully!");
        setNewDelivery({
          inventory_id: "",
          quantity: "",
          delivery_price: "",
          delivery_date: "",
        });
        fetchPendingDeliveries(); // Refresh pending deliveries
      } else {
        alert("Failed to create new delivery.");
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
    }
  };

  // Submit selected deliveries for analysis
  const submitForAnalysis = async () => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    const queryString = selectedDeliveries
      .map((id) => `delivery_ids=${id}`)
      .join("&");
    console.log(queryString);

    try {
      const response = await fetch(
        `http://localhost:8000/analyze_deliveries?${queryString}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // body: JSON.stringify({ delivery_ids: selectedDeliveries }),
        }
      );
      if (response.ok) {
        const results = await response.json();
        const anomalyCount = results.filter(
          (result) => result.result === -1
        ).length;
        const totalDeliveries = results.length;
        alert(
          `${anomalyCount} out of ${totalDeliveries} deliveries were classified as anomalies.`
        );
        fetchPendingDeliveries(); // Refresh pending deliveries
        setSelectedDeliveries([]); // Clear selections
      } else {
        alert("Failed to submit deliveries for analysis.");
      }
    } catch (error) {
      console.error("Error submitting deliveries for analysis:", error);
    }
  };

  const handleMouseDown = (deliveryId) => {
    setDragging(true);
    selectedRowsRef.current = new Set(selectedDeliveries);
    toggleSelection(deliveryId);
  };

  const handleMouseEnter = (deliveryId) => {
    if (dragging) {
      toggleSelection(deliveryId);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setSelectedDeliveries(Array.from(selectedRowsRef.current));
  };

  const toggleSelection = (deliveryId) => {
    if (selectedRowsRef.current.has(deliveryId)) {
      selectedRowsRef.current.delete(deliveryId);
    } else {
      selectedRowsRef.current.add(deliveryId);
    }
  };

  useEffect(() => {
    fetchPendingDeliveries();
  }, []);

  return (
    <div className="delivery-insights-page">
      <div className="delivery-insights-container">
        <h1>Delivery Insights</h1>

        {/* Pending Deliveries Section */}
        <div className="pending-deliveries-section">
          <h2>Pending Deliveries</h2>
          <table
            className="pending-deliveries-table"
            onMouseLeave={() => setDragging(false)}
          >
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Inventory ID</th>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Delivery Price</th>
                <th>Delivery Date</th>
              </tr>
            </thead>
            <tbody>
              {pendingDeliveries.map((delivery) => (
                <tr
                  key={delivery.delivery_id}
                  className={
                    selectedDeliveries.includes(delivery.delivery_id)
                      ? "selected"
                      : ""
                  }
                  onMouseDown={() => handleMouseDown(delivery.delivery_id)}
                  onMouseEnter={() => handleMouseEnter(delivery.delivery_id)}
                  onMouseUp={handleMouseUp}
                >
                  <td>{delivery.delivery_id}</td>
                  <td>{delivery.inventory_id}</td>
                  <td>{delivery.product_id}</td>
                  <td>{delivery.quantity}</td>
                  <td>{delivery.delivery_price}</td>
                  <td>{delivery.delivery_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={submitForAnalysis}
            disabled={selectedDeliveries.length === 0}
          >
            Submit Selected for Analysis
          </button>
        </div>

        {/* Create New Delivery Section */}
        <div className="new-delivery-section">
          <h2>Create New Delivery</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createNewDelivery();
            }}
          >
            <label>
              Inventory ID:
              <input
                type="number"
                value={newDelivery.inventory_id}
                onChange={(e) =>
                  setNewDelivery({
                    ...newDelivery,
                    inventory_id: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Quantity:
              <input
                type="number"
                value={newDelivery.quantity}
                onChange={(e) =>
                  setNewDelivery({ ...newDelivery, quantity: e.target.value })
                }
                required
              />
            </label>
            <label>
              Delivery Price:
              <input
                type="number"
                step="0.01"
                value={newDelivery.delivery_price}
                onChange={(e) =>
                  setNewDelivery({
                    ...newDelivery,
                    delivery_price: e.target.value,
                  })
                }
                required
              />
            </label>
            <label>
              Delivery Date:
              <input
                type="date"
                value={newDelivery.delivery_date}
                onChange={(e) =>
                  setNewDelivery({
                    ...newDelivery,
                    delivery_date: e.target.value,
                  })
                }
                required
              />
            </label>
            <button type="submit">Create Delivery</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryInsightsPage;
