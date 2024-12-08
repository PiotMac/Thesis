import React, { useState, useEffect } from "react";

const FlaggedDeliveriesPage = () => {
  const [flaggedDeliveries, setFlaggedDeliveries] = useState([]);

  // Fetch flagged deliveries
  useEffect(() => {
    const fetchFlaggedDeliveries = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/flagged_deliveries"
        );
        const data = await response.json();
        setFlaggedDeliveries(data);
      } catch (error) {
        console.error("Error fetching flagged deliveries:", error);
      }
    };

    fetchFlaggedDeliveries();
  }, []);

  // Approve a delivery
  const approveDelivery = async (deliveryId) => {
    try {
      await fetch(`http://localhost:8000/approve_delivery/${deliveryId}`, {
        method: "POST",
      });
      setFlaggedDeliveries((prev) =>
        prev.filter((delivery) => delivery.delivery_id !== deliveryId)
      );
    } catch (error) {
      console.error("Error approving delivery:", error);
    }
  };

  // Reject a delivery
  const rejectDelivery = async (deliveryId) => {
    try {
      await fetch(`http://localhost:8000/reject_delivery/${deliveryId}`, {
        method: "POST",
      });
      setFlaggedDeliveries((prev) =>
        prev.filter((delivery) => delivery.delivery_id !== deliveryId)
      );
    } catch (error) {
      console.error("Error rejecting delivery:", error);
    }
  };

  return (
    <div className="flagged-deliveries">
      <h1>Flagged Deliveries</h1>
      <table>
        <thead>
          <tr>
            <th>Delivery ID</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Delivery Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {flaggedDeliveries.map((delivery) => (
            <tr key={delivery.delivery_id}>
              <td>{delivery.delivery_id}</td>
              <td>{delivery.product_name}</td>
              <td>{delivery.quantity}</td>
              <td>${delivery.delivery_price.toFixed(2)}</td>
              <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
              <td>{delivery.status}</td>
              <td>
                <button onClick={() => approveDelivery(delivery.delivery_id)}>
                  Approve
                </button>
                <button onClick={() => rejectDelivery(delivery.delivery_id)}>
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FlaggedDeliveriesPage;
