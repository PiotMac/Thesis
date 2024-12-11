import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const FlaggedDeliveriesPage = ({ setIsLoggedIn }) => {
  const [flaggedDeliveries, setFlaggedDeliveries] = useState([]);
  const [notification, setNotification] = useState(null);
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

  const fetchFlaggedDeliveries = async () => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/flagged-deliveries");
      const data = await response.json();
      console.log(data);
      setFlaggedDeliveries(data);
    } catch (error) {
      console.error("Error fetching flagged deliveries:", error);
    }
  };

  // Handle Accept
  const handleAccept = async (deliveryId) => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8000/approve_delivery?delivery_id=${deliveryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        alert("Delivery approved successfully!");
        fetchFlaggedDeliveries(); // Refresh the list
      } else {
        alert("Failed to approve delivery.");
      }
    } catch (error) {
      console.error("Error approving delivery:", error);
    }
  };

  // Handle Reject
  const handleReject = async (deliveryId) => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8000/reject_delivery?delivery_id=${deliveryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.ok) {
        alert("Delivery rejected successfully!");
        fetchFlaggedDeliveries(); // Refresh the list
      } else {
        alert("Failed to reject delivery.");
      }
    } catch (error) {
      console.error("Error rejecting delivery:", error);
    }
  };

  useEffect(() => {
    fetchFlaggedDeliveries();
  }, []);

  return (
    <div className="flagged-deliveries-page">
      <div className="flagged-deliveries-container">
        <h1>Flagged Deliveries</h1>
        <table className="flagged-deliveries-table">
          <thead>
            <tr>
              <th>Delivery ID</th>
              <th>Inventory ID</th>
              <th>Product ID</th>
              <th>Quantity</th>
              <th>Delivery Price</th>
              <th>Delivery Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flaggedDeliveries.map((delivery) => (
              <tr key={delivery.delivery_id}>
                <td>{delivery.delivery_id}</td>
                <td>{delivery.inventory_id}</td>
                <td>{delivery.product_id}</td>
                <td>{delivery.quantity}</td>
                <td>{delivery.delivery_price}</td>
                <td>{delivery.delivery_date}</td>
                <td>
                  <button
                    className="accept-btn"
                    onClick={() => handleAccept(delivery.delivery_id)}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(delivery.delivery_id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FlaggedDeliveriesPage;
