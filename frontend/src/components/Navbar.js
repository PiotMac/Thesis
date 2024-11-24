import React, { useState, useEffect } from "react";
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
            Kobiety
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/men"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Mężczyźni
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/kids"
            className={({ isActive }) => (isActive ? "active-link" : "")}
          >
            Dzieci
          </NavLink>
        </li>
      </ul>
      <ul id="right-nav">
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
        {isLoggedIn ? (
          <>
            <li>
              <NavLink to="/profile">Profil</NavLink>
            </li>
            <li>
              <NavLink to="/login" onClick={handleLogout}>
                Wyloguj się
              </NavLink>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login">Zaloguj się</NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
