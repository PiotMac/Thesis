import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

function UserProfile({ setIsLoggedIn }) {
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

  // Stan dla danych użytkownika
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    codedPassword: "",
    address_id: "",
    street: "",
    house_nr: "",
    appartment_nr: "",
    city: "",
    zipcode: "",
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [criteria, setCriteria] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

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

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
        navigate("/login");
        return;
      }
      try {
        const response = await fetch("http://localhost:4000/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const transformedData = {
            firstName: data.first_name,
            lastName: data.surname || "",
            email: data.email,
            codedPassword: data.password,
            address_id: data.address_id || "",
            street: data.street || "",
            house_nr: data.house_nr || "",
            appartment_nr: data.appartment_nr || "",
            city: data.city || "",
            zipcode: data.zipcode || "",
          };

          setUserData(transformedData);
        } else {
          console.error("Failed to fetch user data:", response.status);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Obsługa zmiany wartości w formularzu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const validateBasicInfo = () => {
    if (!userData.firstName || userData.firstName.trim() === "") {
      alert("First name cannot be empty!");
      return false;
    }
    if (userData.firstName.length > 100) {
      alert("First name cannot exceed 100 characters!");
      return false;
    }
    if (userData.lastName.length > 100) {
      alert("Last name cannot exceed 100 characters");
      return false;
    }
    return true;
  };

  const validatePasswordChange = () => {
    if (!Object.values(criteria).every(Boolean)) {
      alert("Criteria have to be met!");
      return false;
    }
    if (password !== repeatPassword) {
      alert("Passwords must be the same!");
      return false;
    }
    return true;
  };

  const validateAddressChange = () => {
    if (
      !userData.street ||
      !userData.house_nr ||
      !userData.city ||
      !userData.zipcode
    ) {
      alert("All fields (except appartment number) have to be non-empty!");
      return false;
    }
    if (userData.street.length > 100) {
      alert("Street name cannot exceed 100 characters!");
      return false;
    }
    if (userData.house_nr.length > 5) {
      alert("House number needs cannot exceed 5 characters!");
      return false;
    }
    if (userData.appartment_nr.length > 3) {
      alert("Appartment number needs cannot exceed 3 characters!");
      return false;
    }
    if (userData.city.length > 100) {
      alert("City name cannot exceed 100 characters!");
      return false;
    }
    const zipcodeRegex = /^\d{2}-\d{3}$/;
    if (userData.zipcode && !zipcodeRegex.test(userData.zipcode)) {
      alert("Zipcode has to be in the form of XX-XXX (where X is a digit)!");
      return false;
    }

    return true;
  };

  const saveNewBasicInfo = async () => {
    if (validateBasicInfo()) {
      const token = localStorage.getItem("token");
      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
        navigate("/login");
        return;
      }
      try {
        const response = await fetch("http://localhost:4000/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            type: "basic",
            firstName: userData.firstName,
            lastName: userData.lastName,
          }),
        });

        if (response.ok) {
          console.log("[UPDATE] Successfully updated basic info!");
          alert("Zmiany zapisane!");
        }
      } catch (error) {
        console.error("[UPDATE] Basic info:", error);
        throw new Error("ERROR: update on basic info was NOT successful!");
      }
    }
  };

  const saveNewAddress = async () => {
    if (validateAddressChange()) {
      const token = localStorage.getItem("token");
      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
        navigate("/login");
        return;
      }
      try {
        const response = await fetch("http://localhost:4000/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "address",
            email: userData.email,
            address_id: userData.address_id,
            street: userData.street,
            house_nr: userData.house_nr,
            appartment_nr: userData.appartment_nr,
            city: userData.city,
            zipcode: userData.zipcode,
          }),
        });

        if (response.ok) {
          console.log("[UPDATE] Address saved successfully!");
          alert("Zmiany zapisane!");
        } else {
          console.error("[UPDATE] Failed to save address");
        }
      } catch (error) {
        console.error("[UPDATE] Error:", error);
      }
    }
  };

  const saveNewPassword = async () => {
    if (validatePasswordChange()) {
      const token = localStorage.getItem("token");
      if (!isTokenValid(token)) {
        setIsLoggedIn(false);
        navigate("/login");
        return;
      }
      try {
        const response = await fetch("http://localhost:4000/profile", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "password",
            email: userData.email,
            currentPassword: currentPassword,
            codedPassword: userData.codedPassword,
            newPassword: password,
          }),
        });

        if (response.ok) {
          setCurrentPassword("");
          setPassword("");
          setRepeatPassword("");
          setCriteria({
            length: false,
            lowercase: false,
            uppercase: false,
            number: false,
            specialChar: false,
          });
          console.log("[UPDATE] New password saved successfully!");
          alert("Zmiany zapisane!");
        } else {
          console.error("[UPDATE] Failed to save new password");
          alert("Niepoprawne hasło!");
        }
      } catch (error) {
        console.error("[UPDATE] Error:", error);
      }
    }
  };

  const goToTransactions = () => {
    navigate("/transactions");
  };

  return (
    <div className="profile-container">
      <h1 id="profile-user-header">User's profile</h1>
      <button id="transaction-history-button" onClick={goToTransactions}>
        Transaction history
      </button>
      <div className="profile-basic-info">
        <h3>Modify profile's data</h3>
        <div className="profile-input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            placeholder="Email"
            disabled={true}
          />
        </div>
        <div className="profile-input-group">
          <label>Name</label>
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            placeholder="Name"
            onChange={handleInputChange}
          />
        </div>

        <div className="profile-input-group">
          <label>Surname</label>
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            placeholder="Surname"
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="profile-password">
        <h3>Change password</h3>
        <div className="profile-input-group">
          <input
            type="password"
            name="current_password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="profile-input-group">
          <input
            type="password"
            name="new_password"
            placeholder="New password"
            value={password}
            onChange={handlePasswordCriteria}
          />
        </div>
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
        <div className="profile-input-group">
          <input
            type="password"
            name="new_password_again"
            placeholder="Confirm your password"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="profile-address">
        <h3>Change adress</h3>
        <div className="profile-input-group">
          <label>Street</label>
          <input
            type="text"
            name="street"
            value={userData.street}
            placeholder="Street"
            onChange={handleInputChange}
          />
        </div>
        <div className="profile-input-group">
          <label>House number</label>
          <input
            type="text"
            name="house_nr"
            value={userData.house_nr}
            placeholder="House number"
            onChange={handleInputChange}
          />
        </div>
        <div className="profile-input-group">
          <label>Appartment number</label>
          <input
            type="text"
            name="appartment_nr"
            value={userData.appartment_nr}
            placeholder="Appartment number"
            onChange={handleInputChange}
          />
        </div>
        <div className="profile-input-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={userData.city}
            onChange={handleInputChange}
            placeholder="City"
          />
        </div>
        <div className="profile-input-group">
          <label>Zip code</label>
          <input
            type="text"
            name="zipcode"
            value={userData.zipcode}
            placeholder="Postal code"
            onChange={handleInputChange}
          />
        </div>
      </div>
      <button id="button-info" onClick={saveNewBasicInfo}>
        Save changes
      </button>
      <button id="button-password" onClick={saveNewPassword}>
        Save changes
      </button>
      <button id="button-address" onClick={saveNewAddress}>
        Save changes
      </button>
    </div>
  );
}

export default UserProfile;
