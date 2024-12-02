import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const LoginForm = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        const decodedToken = jwtDecode(data.token);
        const userRole = decodedToken.role; // either 'admin' or 'user'
        localStorage.setItem("role", userRole);
        setIsLoggedIn(true);
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/profile");
        }
      } else {
        setErrorMessage("Login failed");
      }
    } catch (error) {
      setErrorMessage("An error occurred");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Login</h2>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <button type="submit" className="login-button">
          Log in
        </button>
        <NavLink id="register_in_log" to="/register">
          You are not registered? Create an account!
        </NavLink>
      </form>
    </div>
  );
};

export default LoginForm;
