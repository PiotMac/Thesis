import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const RegisterForm = ({ setIsLoggedIn }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [criteria, setCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });
  const navigate = useNavigate();

  const handlePasswordCriteria = (e) => {
    const value = e.target.value;
    setPassword(value);

    setCriteria({
      length: value.length >= 8,
      lowercase: /[a-z]/.test(value),
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[\W_]/.test(value),
    });
  };

  //   const checkRepeatedPassword = (e) => {
  //     if (!Object.values(criteria).every(Boolean)) {
  //         setErrorMessage("Criteria have to be met!");
  //         return;
  //     }
  //     if (!password !== repeatPassword) {
  //       setErrorMessage("Passwords must be the same!");
  //       return;
  //     }
  //     setErrorMessage("");
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Object.values(criteria).every(Boolean)) {
      setErrorMessage("Criteria have to be met!");
      return;
    }
    if (password !== repeatPassword) {
      setErrorMessage("Passwords must be the same!");
      return;
    }
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        navigate("/profile");
      } else {
        setErrorMessage("Registration failed");
      }
    } catch (error) {
      setErrorMessage("An error occurred");
      console.error("Registration error:", error);
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2 className="register-title">Rejestracja</h2>

        <div className="input-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Wpisz swoje imię"
          />
        </div>

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Wpisz swój adres email"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordCriteria}
            required
            placeholder="Wpisz swoje hasło"
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            id="repeat-password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
            placeholder="Wpisz ponownie swoje hasło"
          />
        </div>

        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        <div className="password-criteria">
          <ul>
            <li className={criteria.length ? "valid" : "invalid"}>
              {criteria.length ? "\u2705" : "\u274C"} Minimum 8 characters
            </li>
            <li className={criteria.lowercase ? "valid" : "invalid"}>
              {criteria.lowercase ? "\u2705" : "\u274C"} At least one lowercase
              letter
            </li>
            <li className={criteria.uppercase ? "valid" : "invalid"}>
              {criteria.uppercase ? "\u2705" : "\u274C"} At least one uppercase
              letter
            </li>
            <li className={criteria.number ? "valid" : "invalid"}>
              {criteria.number ? "\u2705" : "\u274C"} At least one number
            </li>
            <li className={criteria.specialChar ? "valid" : "invalid"}>
              {criteria.specialChar ? "\u2705" : "\u274C"} At least one special
              character
            </li>
          </ul>
        </div>

        <button type="submit" className="register-button">
          Załóż konto
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
