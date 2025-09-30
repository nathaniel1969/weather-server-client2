/**
 * Header.jsx
 * Displays the app header with a search bar and unit toggle switch.
 * Allows users to search for locations and switch between metric/imperial units.
 */
import React from "react";
import Searchbar from "./Searchbar";
import ToggleSwitch from "./ToggleSwitch";

/**
 * Header component
 * @param {Object} props
 * @param {function} props.fetchWeather - Function to fetch weather data
 * @param {boolean} props.isMetric - If true, display metric units; otherwise, imperial
 * @param {function} props.onToggle - Function to handle the unit toggle
 * @param {string} props.searchTerm - The current search term
 * @param {function} props.setSearchTerm - Function to set the search term
 * @returns {JSX.Element} Header UI
 */
function Header({
  fetchWeather,
  isMetric,
  onToggle,
  searchTerm,
  setSearchTerm,
}) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      {/* Search bar for location input */}
      <div className="flex-grow mr-4">
        <Searchbar
          fetchWeather={fetchWeather}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>
      {/* Toggle switch for metric/imperial units */}
      <ToggleSwitch isMetric={isMetric} onToggle={onToggle} />
    </div>
  );
}

export default Header;
