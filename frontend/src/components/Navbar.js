import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav id="main-nav">
      <div id="left-nav">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Women
        </NavLink>
        <NavLink
          to="/men"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Men
        </NavLink>
        <NavLink
          to="/kids"
          className={({ isActive }) => (isActive ? "active-link" : "")}
        >
          Kids
        </NavLink>
      </div>
      <div id="right-nav">
        {isLoggedIn ? (
          <>
            <NavLink to="/cart">
              <IconButton
                id="shopping_cart"
                sx={{
                  color: "gold",
                  fontSize: "inherit",
                  padding: "10px",
                  height: "auto",
                }}
                aria-label="add to shopping cart"
              >
                <AddShoppingCartIcon />
              </IconButton>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Profile
            </NavLink>
            <NavLink
              to="/login"
              onClick={handleLogout}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Logout
            </NavLink>
          </>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
