import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Logo from "./components/Logo";
import Footer from "./components/Footer";
import Women from "./components/Women";
import Men from "./components/Men";
import Kids from "./components/Kids";
import Login from "./components/Login";
import Register from "./components/Register";
import UserProfile from "./components/UserProfile";
import CategoryPage from "./components/CategoryPage";
import ProductPage from "./components/ProductPage";
import CartPage from "./components/CartPage";
import CartPayPage from "./components/CartPayPage";
import TransactionHistoryPage from "./components/TransactionHistoryPage";
import AdminDashboard from "./components/AdminDashboard";
import AnalyzeProductsPage from "./components/AnalyzeProductsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import FlaggedDeliveriesPage from "./components/FlaggedDeliveriesPage";
import DeliveryInsightsPage from "./components/DeliveryInsightsPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;
        if (payload.exp > currentTime) {
          setIsLoggedIn(true);
          setCurrentRole(payload.role || "user");
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          setIsLoggedIn(false);
          setCurrentRole("");
        }
      }
    };

    checkToken();
  }, [isLoggedIn]);

  return (
    <Router>
      <MainContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );

  function MainContent({ isLoggedIn, setIsLoggedIn }) {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
      <div className="app">
        <div className="main_page">
          {isAdminRoute ? (
            <Routes>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role={currentRole}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analyze-products"
                element={
                  <ProtectedRoute role={currentRole}>
                    <AnalyzeProductsPage setIsLoggedIn={setIsLoggedIn} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/flagged-deliveries"
                element={
                  <ProtectedRoute role={currentRole}>
                    <FlaggedDeliveriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/delivery-insights"
                element={
                  <ProtectedRoute role={currentRole}>
                    <DeliveryInsightsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          ) : (
            <>
              <header>
                <Logo />
                <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
              </header>
              <div className="categories">
                <Routes>
                  <Route exact path="/" element={<Women />} />
                  <Route exact path="/men" element={<Men />} />
                  <Route exact path="/kids" element={<Kids />} />
                  <Route
                    path="/login"
                    element={<Login setIsLoggedIn={setIsLoggedIn} />}
                  />
                  <Route
                    path="/register"
                    element={<Register setIsLoggedIn={setIsLoggedIn} />}
                  />
                  <Route
                    path="/profile"
                    element={<UserProfile setIsLoggedIn={setIsLoggedIn} />}
                  />
                  <Route
                    path="/:mainCategory/:subcategory/:subsubcategory?"
                    element={<CategoryPage />}
                  />
                  <Route
                    path="/products/:product_id"
                    element={<ProductPage />}
                  />
                  <Route
                    path="/checkout"
                    element={<CartPayPage setIsLoggedIn={setIsLoggedIn} />}
                  />
                  <Route
                    path="/cart"
                    element={<CartPage setIsLoggedIn={setIsLoggedIn} />}
                  />
                  <Route
                    path="/transactions"
                    element={
                      <TransactionHistoryPage setIsLoggedIn={setIsLoggedIn} />
                    }
                  />
                </Routes>
              </div>
              <Footer />
            </>
          )}
        </div>
      </div>
    );
  }
}

export default App;
