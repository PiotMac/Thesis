import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import Transaction from "./Transaction";

const TransactionHistoryPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

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
    const fetchUserTransactions = async () => {
      const token = localStorage.getItem("token");
      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:4000/transactions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user's transactions!");
        }

        const data = await response.json();
        console.log(Object.values(data));
        setTransactions(Object.values(data));
      } catch (error) {
        console.error("Error fetching user's transactions':", error);
      }
    };

    fetchUserTransactions();
  }, []);

  return (
    <div className="transaction-page-container">
      {transactions.length === 0 ? (
        <div className="empty-transactions-container">
          <h1>Your transaction history is empty!</h1>
        </div>
      ) : (
        <>
          <div className="transaction-list-container">
            {transactions.map((transaction, index) => (
              <Transaction index={index} transaction={transaction} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
