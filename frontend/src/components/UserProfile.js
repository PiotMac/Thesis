import React, { useState, useEffect } from "react";

function UserProfile() {
  // Stan dla danych użytkownika
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

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
            firstName: data.first_name || "",
            lastName: data.surname || "",
            email: data.email || "",
            password: "",
            phone: data.phone || "",
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

  // Obsługa zapisu danych
  const handleSave = () => {
    // Tutaj można wywołać API do zapisu danych
    console.log("Dane zapisane:", userData);
    setIsEditing(false);
  };

  return (
    <div className="profile-container">
      <h2>Profil użytkownika</h2>

      <div className="profile-input-group">
        <label>Imię:</label>
        <input
          type="text"
          name="firstName"
          value={userData.firstName}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      <div className="profile-input-group">
        <label>Nazwisko:</label>
        <input
          type="text"
          name="lastName"
          value={userData.lastName}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      <div className="profile-input-group">
        <label>Hasło:</label>
        <input
          type="password"
          name="password"
          value={userData.password}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      <div className="profile-input-group">
        <label>Numer Telefonu:</label>
        <input
          type="tel"
          name="phone"
          value={userData.phone}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      <div className="profile-input-group">
        <label>Adres:</label>
        <input
          type="text"
          name="address"
          value={userData.address}
          onChange={handleInputChange}
          disabled={!isEditing}
        />
      </div>

      {!isEditing ? (
        <button onClick={() => setIsEditing(true)}>Edytuj</button>
      ) : (
        <div>
          <button onClick={handleSave}>Zapisz</button>
          <button onClick={() => setIsEditing(false)}>Anuluj</button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
