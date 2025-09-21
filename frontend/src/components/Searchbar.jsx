import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import useDebounce from "../hooks/useDebounce";

function Searchbar({ fetchWeather }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchTerm.length > 2) {
        try {
          // Use backend proxy endpoint for geocoding suggestions
          const response = await axios.get(
            `/api/geocode?query=${debouncedSearchTerm}`
          );
          setSuggestions(response.data.results || []);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion.formatted);
    setSuggestions([]);
    fetchWeather(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm) {
      fetchWeather(searchTerm);
      setSuggestions([]);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a location..."
          className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 mt-2 mr-2 px-4 py-1 bg-blue-500 text-white rounded-md"
        >
          Search
        </button>
      </form>
      {suggestions.length > 0 && (
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
