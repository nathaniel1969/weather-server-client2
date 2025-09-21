import React from 'react';
import Searchbar from './Searchbar';
import ToggleSwitch from './ToggleSwitch';

/**
 * Header component containing the search bar and unit toggle switch.
 * @param {object} props - The props for the component.
 * @param {function} props.fetchWeather - Function to fetch weather data.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @param {function} props.onToggle - Function to handle the unit toggle.
 * @returns {JSX.Element} - The rendered component.
 */
function Header({ fetchWeather, isMetric, onToggle }) {
  return (
    <div className="flex items-center justify-between w-full mb-8">
      <div className="flex-grow mr-4">
        <Searchbar fetchWeather={fetchWeather} />
      </div>
      <ToggleSwitch isMetric={isMetric} onToggle={onToggle} />
    </div>
  );
}

export default Header;
