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
      <ul id="left-nav">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Women
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/men"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Men
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/kids"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Kids
          </NavLink>
        </li>
      </ul>
      <ul id="right-nav">
        {isLoggedIn ? (
          <>
            <li>
              <NavLink to="/cart">
                <IconButton
                  id="shopping_cart"
                  sx={{ color: "#8E05C2" }}
                  aria-label="add to shopping cart"
                >
                  <AddShoppingCartIcon />
                </IconButton>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
              <NavLink to="/login" onClick={handleLogout}>
                Logout
              </NavLink>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
