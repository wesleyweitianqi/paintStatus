// Default values for descriptions and locations
const defaultDescriptionList = ["Enclosure", "Part", "Body", "Base", "Bracket"];
const defaultLocationList = ["45 Leading Rd", "85 Basaltic Rd", "65 Basaltic Rd"];

// Load from localStorage or use default values
const loadDescriptionList = () => {
  return JSON.parse(localStorage.getItem("descriptionList")) || defaultDescriptionList;
};

const loadLocationList = () => {
  return JSON.parse(localStorage.getItem("locationList")) || defaultLocationList;
};

// Save to localStorage
const saveDescriptionList = (list) => {
  localStorage.setItem("descriptionList", JSON.stringify(list));
};

const saveLocationList = (list) => {
  localStorage.setItem("locationList", JSON.stringify(list));
};

// Functions to modify the lists
const addDescription = (description) => {
  let descriptions = loadDescriptionList();
  if (!descriptions.includes(description)) {
    descriptions.push(description);
    saveDescriptionList(descriptions);
  }
};

const removeDescription = (description) => {
  let descriptions = loadDescriptionList();
  descriptions = descriptions.filter((item) => item !== description);
  saveDescriptionList(descriptions);
};

const addLocation = (location) => {
  let locations = loadLocationList();
  if (!locations.includes(location)) {
    locations.push(location);
    saveLocationList(locations);
  }
};

const removeLocation = (location) => {
  let locations = loadLocationList();
  locations = locations.filter((item) => item !== location);
  saveLocationList(locations);
};

// Export everything for use in your components
export {
  loadDescriptionList,
  loadLocationList,
  addDescription,
  removeDescription,
  addLocation,
  removeLocation
};
