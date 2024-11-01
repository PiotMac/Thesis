import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
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
          <NavLink to="/cart">Koszyk</NavLink>
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
