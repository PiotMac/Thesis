import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;
        if (payload.exp > currentTime) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      }
    };

    checkToken();
  }, []);

  return (
    <div className="app">
      <Router>
        <div className="main_page">
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
              <Route path="/profile" element={<UserProfile />} />
              <Route
                path="/:mainCategory/:subcategory/:subsubcategory?"
                element={<CategoryPage />}
              />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </div>
  );
}

export default App;
