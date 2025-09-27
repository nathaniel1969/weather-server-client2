import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import useDebounce from "../hooks/useDebounce";

/**
 * Searchbar component for location input and suggestions.
 * Uses debounced input to fetch location suggestions from backend geocode API.
 * @param {object} props - The props for the component.
 * @param {function} props.fetchWeather - Function to fetch weather data for a location.
 * @param {string} props.searchTerm - The current search term.
 * @param {function} props.setSearchTerm - Function to set the search term.
 * @returns {JSX.Element} - The rendered component.
 */
function Searchbar({ fetchWeather, searchTerm, setSearchTerm }) {
  // Suggestions for location autocomplete
  const [suggestions, setSuggestions] = useState([]);
  // Controls whether suggestions dropdown is shown
  const [showSuggestions, setShowSuggestions] = useState(true);
  // Debounced search term for API requests
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Fetch location suggestions from backend when debounced term changes
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length > 2) {
        try {
          const response = await axios.get(
            `http://localhost:3001/api/geocode?query=${debouncedSearchTerm}`
          );
          setSuggestions(response.data.results || []);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
      }
    };
    if (showSuggestions) {
      fetchSuggestions();
    }
  }, [debouncedSearchTerm, showSuggestions]);

  /**
   * Handles click on a location suggestion.
   * Sets search term and fetches weather for selected location.
   * @param {object} suggestion - The selected location suggestion.
   */
  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.formatted);
    setShowSuggestions(false);
    setSuggestions([]);
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
      setSearchTerm("");
    }
  };

  /**
   * Handles input change in search bar.
   * Shows suggestions and updates search term.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleInputChange = (e) => {
    setShowSuggestions(true);
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <input
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
          {suggestions.slice(0, 10).map((suggestion, idx) => {
            return (
              <li
                key={suggestion.id || idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="p-2 cursor-pointer hover:bg-gray-200 flex items-center"
              >
                <span className="mr-2">{suggestion.flag}</span>
                <span>{suggestion.formatted}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default Searchbar;
