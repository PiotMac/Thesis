import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ChartTrendline from "chartjs-plugin-trendline";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { fontWeight } from "@mui/system";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ChartTrendline,
  Title,
  Tooltip,
  Legend
);

const AnalyzeProductsPage = ({ setIsLoggedIn }) => {
  const [productId, setProductId] = useState(1);
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2023-12-31");
  const [priceData, setPriceData] = useState([]);
  const [quantityData, setQuantityData] = useState([]);

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

  const fetchPricePerUnit = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/price_per_unit?product_id=${productId}&start_date=${startDate}&end_date=${endDate}`
      );
      const data = await response.json();
      setPriceData(data);
    } catch (error) {
      console.error("Error fetching price per unit:", error);
    }
  };

  const fetchAverageQuantity = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/average_quantity?product_id=${productId}&start_date=${startDate}&end_date=${endDate}`
      );
      const data = await response.json();
      setQuantityData(data);
    } catch (error) {
      console.error("Error fetching average quantity:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    fetchPricePerUnit();
    fetchAverageQuantity();
  }, [productId, startDate, endDate]);

  const chartData = (label, dataset, yLabel) => ({
    labels: dataset.map((d) => d.delivery_date),
    datasets: [
      {
        label: label,
        data: dataset.map((d) => d[yLabel]),
        borderColor: "orange",
        backgroundColor: "orange",
        borderWidth: 3,
        // fill: false,
        pointRadius: 2,
      },
      {
        label: `${label} Trendline`,
        data: dataset.map((d) => d[yLabel]),
        trendlineLinear: {
          colorMin: "red",
          colorMax: "red",
          lineStyle: "solid",
          width: 5,
          legend: {
            text: "Trendline",
            strokeStyle: "red",
            fillStyle: "red",
            lineCap: "round",
            lineDash: [5, 5],
            lineWidth: 2,
          },
        },
        borderWidth: 0,
        pointRadius: 0,
        fill: false,
        tooltip: {
          enabled: false,
        },
      },
    ],
  });

  const options = (label) => ({
    plugins: {
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark tooltip
      },
      legend: {
        labels: {
          boxHeight: 1,
          color: "black",
          generateLabels: (chart) => {
            const labels = chart.data.datasets.map((dataset, i) => ({
              text: dataset.label,
              strokeStyle:
                dataset.label === `${label} Trendline`
                  ? "red" // Manually set the legend color for the trendline
                  : dataset.borderColor,
              lineWidth:
                dataset.label === `${label} Trendline`
                  ? 2
                  : dataset.borderWidth,
              hidden: !chart.isDatasetVisible(i),
              datasetIndex: i,
            }));
            return labels;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "black", // Black X-axis labels
          maxTicksLimit: 10, // Show only 10 ticks
        },
        grid: {
          color: "rgba(0, 0, 0, 0.3)", // Light gridlines
        },
      },
      y: {
        ticks: {
          color: "black", // Black Y-axis labels
          font: {
            size: 16, // Font size
            weight: "bold", // Font weight
            family: "Arial", // Font family
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.3)", // Light gridlines
        },
      },
    },
  });

  return (
    <div className="admin-products-analysis-container">
      <h1>Analyze Products</h1>
      <div className="form-container">
        <label>Product ID:</label>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="chart-container">
        <h2>Price Per Unit Over Time</h2>
        <Line
          data={chartData("Price Per Unit", priceData, "price_per_unit")}
          options={options("Price Per Unit")}
        />
      </div>
      <div className="chart-container">
        <h2>Average Quantity Over Time</h2>
        <Line
          data={chartData("Average Quantity", quantityData, "avg_quantity")}
          options={options("Average Quantity")}
        />
      </div>
    </div>
  );
};

export default AnalyzeProductsPage;
