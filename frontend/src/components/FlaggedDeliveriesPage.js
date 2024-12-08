// import React, { useState, useEffect } from "react";

// const FlaggedDeliveriesPage = () => {
//   const [flaggedDeliveries, setFlaggedDeliveries] = useState([]);

//   // Fetch flagged deliveries
//   useEffect(() => {
//     const fetchFlaggedDeliveries = async () => {
//       try {
//         const response = await fetch(
//           "http://localhost:8000/flagged_deliveries"
//         );
//         const data = await response.json();
//         setFlaggedDeliveries(data);
//       } catch (error) {
//         console.error("Error fetching flagged deliveries:", error);
//       }
//     };

//     fetchFlaggedDeliveries();
//   }, []);

//   // Approve a delivery
//   const approveDelivery = async (deliveryId) => {
//     try {
//       await fetch(`http://localhost:8000/approve_delivery/${deliveryId}`, {
//         method: "POST",
//       });
//       setFlaggedDeliveries((prev) =>
//         prev.filter((delivery) => delivery.delivery_id !== deliveryId)
//       );
//     } catch (error) {
//       console.error("Error approving delivery:", error);
//     }
//   };

//   // Reject a delivery
//   const rejectDelivery = async (deliveryId) => {
//     try {
//       await fetch(`http://localhost:8000/reject_delivery/${deliveryId}`, {
//         method: "POST",
//       });
//       setFlaggedDeliveries((prev) =>
//         prev.filter((delivery) => delivery.delivery_id !== deliveryId)
//       );
//     } catch (error) {
//       console.error("Error rejecting delivery:", error);
//     }
//   };

//   return (
//     <div className="flagged-deliveries">
//       <h1>Flagged Deliveries</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Delivery ID</th>
//             <th>Product Name</th>
//             <th>Quantity</th>
//             <th>Price</th>
//             <th>Delivery Date</th>
//             <th>Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {flaggedDeliveries.map((delivery) => (
//             <tr key={delivery.delivery_id}>
//               <td>{delivery.delivery_id}</td>
//               <td>{delivery.product_name}</td>
//               <td>{delivery.quantity}</td>
//               <td>${delivery.delivery_price.toFixed(2)}</td>
//               <td>{new Date(delivery.delivery_date).toLocaleDateString()}</td>
//               <td>{delivery.status}</td>
//               <td>
//                 <button onClick={() => approveDelivery(delivery.delivery_id)}>
//                   Approve
//                 </button>
//                 <button onClick={() => rejectDelivery(delivery.delivery_id)}>
//                   Reject
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default FlaggedDeliveriesPage;

import React, { useState, useEffect } from "react";

const FlaggedDeliveriesPage = () => {
  const [flaggedDeliveries, setFlaggedDeliveries] = useState([]);
  const [notification, setNotification] = useState(null);

  const fetchFlaggedDeliveries = async () => {
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
    try {
      const response = await fetch(
        `http://localhost:8000/approve_delivery/?delivery_id=${deliveryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_id: deliveryId, status: "approved" }),
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
    try {
      const response = await fetch(
        `http://localhost:8000/reject_delivery/?delivery_id=${deliveryId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_id: deliveryId, status: "rejected" }),
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

  // const listenForNotifications = () => {
  //   // WebSocket example
  //   const ws = new WebSocket("ws://localhost:6000/notifications");

  //   ws.onmessage = (event) => {
  //     const message = JSON.parse(event.data);
  //     if (
  //       message.type === "status_change" &&
  //       message.new_status === "flagged"
  //     ) {
  //       setNotification(`Delivery ID ${message.delivery_id} flagged!`);
  //       fetchFlaggedDeliveries(); // Refresh flagged deliveries
  //     }
  //   };

  //   ws.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //   };

  //   return () => ws.close();
  // };

  useEffect(() => {
    fetchFlaggedDeliveries();
    // const unsubscribe = listenForNotifications();
    // return unsubscribe; // Cleanup WebSocket on unmount
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
              <th>Quantity</th>
              <th>Delivery Price</th>
              <th>Anomaly Score</th>
              <th>Delivery Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {flaggedDeliveries.map((delivery) => (
              <tr key={delivery.delivery_id}>
                <td>{delivery.delivery_id}</td>
                <td>{delivery.inventory_id}</td>
                <td>{delivery.quantity}</td>
                <td>{delivery.delivery_price}</td>
                <td>{delivery.anomaly_score}</td>
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
