import React, { useState, useEffect } from "react";
import CartProduct from "./CartProduct";
import { jwtDecode } from "jwt-decode";
import { useNavigate, useLocation } from "react-router-dom";

const CartPayPage = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = location.state || {};
  const totalPriceOfProducts = cartItems.reduce((total, item) => {
    return item.inventory_quantity > 0 ? total + item.total_price : total;
  }, 0);

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
        }
      } catch (error) {
        console.error("[UPDATE] Basic info:", error);
        throw new Error("ERROR: update on basic info was NOT successful!");
      }
    } else {
      throw new Error("Validation failed for basic info");
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
        } else {
          console.error("[UPDATE] Failed to save address");
        }
      } catch (error) {
        console.error("[UPDATE] Error:", error);
      }
    } else {
      throw new Error("Validation failed for address info");
    }
  };

  const updateDatabase = async () => {
    const token = localStorage.getItem("token");
    if (!isTokenValid(token)) {
      setIsLoggedIn(false);
      navigate("/login");
      return;
    }
    try {
      const response = await fetch("http://localhost:4000/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cartItems,
          totalPrice: totalPriceOfProducts.toFixed(2),
        }),
      });

      if (response.ok) {
        console.log("[TRANSACTION] Transaction proceeded successfully!");
      } else {
        console.error("[TRANSACTION] Transaction failed!");
      }
    } catch (err) {
      throw new Error("Transaction failed");
    }
  };

  const completeTransaction = async () => {
    try {
      await saveNewBasicInfo();
      await saveNewAddress();
      await updateDatabase();
      alert("Payment successful!");
      navigate("/");
    } catch (error) {
      console.error("Error completing transaction:", error.message);
      alert(`${error.message}. Please try again.`);
    }
  };

  return (
    <div className="pay-page-container">
      <div className="pay-page-product-list">
        <h1 id="your-order-header">Your order</h1>
        {cartItems.map((item) => (
          <CartProduct key={item.cart_id} item={item} showButtons={false} />
        ))}
      </div>
      <div className="pay-page-user-data-container">
        <h1 id="personal-info-header">Personal info</h1>
        <div className="pay-page-user-data">
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
              placeholder="Imię"
              onChange={handleInputChange}
            />
          </div>

          <div className="profile-input-group">
            <label>Surname</label>
            <input
              type="text"
              name="lastName"
              value={userData.lastName}
              placeholder="Nazwisko"
              onChange={handleInputChange}
            />
          </div>

          <div className="profile-input-group">
            <label>Street</label>
            <input
              type="text"
              name="street"
              value={userData.street}
              placeholder="Ulica"
              onChange={handleInputChange}
            />
          </div>
          <div className="profile-input-group">
            <label>House number</label>
            <input
              type="text"
              name="house_nr"
              value={userData.house_nr}
              placeholder="Nr domu"
              onChange={handleInputChange}
            />
          </div>
          <div className="profile-input-group">
            <label>Appartment number</label>
            <input
              type="text"
              name="appartment_nr"
              value={userData.appartment_nr}
              placeholder="Nr lokalu"
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
              placeholder="Miasto"
            />
          </div>
          <div className="profile-input-group">
            <label>Zip code</label>
            <input
              type="text"
              name="zipcode"
              value={userData.zipcode}
              placeholder="Kod pocztowy"
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="pay-button-container-two">
          <h1 id="summary-pay">Summary</h1>
          <div className="pay-button-box">
            <h1>Total:</h1>
            <h1 id="total-pay-price">{totalPriceOfProducts.toFixed(2)}$</h1>
            <div className="paying-button-container">
              <button id="complete-button" onClick={completeTransaction}>
                Complete transaction
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPayPage;
