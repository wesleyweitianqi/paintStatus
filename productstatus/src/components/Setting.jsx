import React, { useState, useEffect } from "react";
import {
  loadDescriptionList,
  loadLocationList,
  addDescription,
  removeDescription,
  addLocation,
  removeLocation
} from "../utils/constants";

const Setting = () => {
  const [descriptions, setDescriptions] = useState(loadDescriptionList());
  const [locations, setLocations] = useState(loadLocationList());
  const [newDescription, setNewDescription] = useState("");
  const [newLocation, setNewLocation] = useState("");

  // Update lists when changes happen
  useEffect(() => {
    setDescriptions(loadDescriptionList());
    setLocations(loadLocationList());
  }, []);

  // Add new description
  const handleAddDescription = () => {
    if (newDescription.trim() && !descriptions.includes(newDescription)) {
      addDescription(newDescription);
      setDescriptions(loadDescriptionList());  // Refresh the list from localStorage
      setNewDescription("");
    }
  };

  // Delete description
  const handleDeleteDescription = (description) => {
    removeDescription(description);
    setDescriptions(loadDescriptionList());  // Refresh the list from localStorage
  };

  // Add new location
  const handleAddLocation = () => {
    if (newLocation.trim() && !locations.includes(newLocation)) {
      addLocation(newLocation);
      setLocations(loadLocationList());  // Refresh the list from localStorage
      setNewLocation("");
    }
  };

  // Delete location
  const handleDeleteLocation = (location) => {
    removeLocation(location);
    setLocations(loadLocationList());  // Refresh the list from localStorage
  };

  return (
    <div>
      <h4>Setting</h4>

      {/* Description Section */}
      <div>
        <p>Description Collection</p>
        <ul>
          {descriptions.map((description, index) => (
            <li key={index}>
              {description}
              <button
                onClick={() => handleDeleteDescription(description)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Add new description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button onClick={handleAddDescription}>Add</button>
      </div>

      <hr />

      {/* Location Section */}
      <div>
        <p>Location Collection</p>
        <ul>
          {locations.map((location, index) => (
            <li key={index}>
              {location}
              <button
                onClick={() => handleDeleteLocation(location)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Add new location"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
        />
        <button onClick={handleAddLocation}>Add</button>
      </div>
    </div>
  );
};

export default Setting;
