import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const sections = [
    { label: "Analyze Products", route: "/admin/analyze-products", icon: "📊" },
    {
      label: "Flagged Deliveries",
      route: "/admin/flagged-deliveries",
      icon: "🚩",
    },
    { label: "Inventory Management", route: "/admin/inventory", icon: "📦" },
    {
      label: "Delivery Insights",
      route: "/admin/delivery-insights",
      icon: "📈",
    },
  ];

  return (
    <div className="admin-dashboard">
      <h1 id="admin-panel-header">Admin Panel</h1>
      <div className="dashboard-grid">
        {sections.map((section) => (
          <div
            key={section.label}
            className="dashboard-card"
            onClick={() => navigate(section.route)}
          >
            <div className="icon">{section.icon}</div>
            <div className="label">{section.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
