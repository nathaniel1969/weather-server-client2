/**
 * Searchbar.jsx
 * Location search input with autocomplete suggestions for weather app.
 * Uses debounced input to fetch location suggestions from backend geocode API.
 */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useDebounce from "../hooks/useDebounce";

/**
 * Searchbar component
 * @param {Object} props
 * @param {function} props.fetchWeather - Function to fetch weather data for a location
 * @param {string} props.searchTerm - The current search term
 * @param {function} props.setSearchTerm - Function to set the search term
 * @returns {JSX.Element} Searchbar UI
 */
function Searchbar({ fetchWeather, searchTerm, setSearchTerm }) {
  // Suggestions for location autocomplete
  const [suggestions, setSuggestions] = useState([]);
  // Controls whether suggestions dropdown is shown
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Debounced search term for API requests
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const inputRef = useRef(null);
  // Suppress suggestion fetch after selection
  const [suppressSuggestions, setSuppressSuggestions] = useState(false);

  // Fetch location suggestions from backend when debounced term changes
  useEffect(() => {
    if (suppressSuggestions) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length > 2) {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/geocode?query=${debouncedSearchTerm}`
          );
          setSuggestions(
            response.data.results.map((item) => ({
              ...item,
              // Use a unique key based on lat/lng and formatted address
              id: `${item.geometry.lat}-${item.geometry.lng}-${item.formatted}`,
            })) || []
          );
          setShowSuggestions(true);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearchTerm, suppressSuggestions]);

  // Hide dropdown only when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Handles click on a location suggestion.
   * Sets search term and fetches weather for selected location.
   * @param {object} suggestion - The selected location suggestion.
   * @param {React.MouseEvent} e - The mouse event.
   */
  const handleSuggestionMouseDown = (suggestion, e) => {
    e.preventDefault(); // Prevent input blur
    setSearchTerm(suggestion.formatted);
    setSuppressSuggestions(true);
    setSuggestions([]);
    setShowSuggestions(false);
    fetchWeather(suggestion);
  };

  /**
   * Handles form submission for search.
   * Fetches weather for the entered search term.
   * @param {React.FormEvent} e - The form submit event.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      fetchWeather(searchTerm);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  /**
   * Handles input change in search bar.
   * Shows suggestions and updates search term.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Reset lastSelected and suppression when user types a new value
    setSuppressSuggestions(false);
    setShowSuggestions(true);
  };

  return (
    <div className="relative">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex" autoComplete="off">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Search for a location..."
          className="w-full p-2 rounded-l-md border-r-0 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md"
        >
          Search
        </button>
      </form>
      {/* Location suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1">
          {suggestions.slice(0, 10).map((suggestion) => (
            <li
              key={suggestion.id}
              className="p-2 cursor-pointer hover:bg-gray-200 flex items-center"
              style={{ pointerEvents: "auto" }}
              onMouseDown={(e) => handleSuggestionMouseDown(suggestion, e)}
            >
              <span className="mr-2">{suggestion.flag}</span>
              <span>{suggestion.formatted}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Searchbar;
