import React from "react";
import { useState } from "react";
import Searchbar from "./Searchbar";
import ToggleSwitch from "./ToggleSwitch";

function CurrentWeatherCard({ fetchWeather, weatherData, locationName }) {
  const [isMetric, setIsMetric] = useState(false);

  const handleUnitToggle = (isMetric) => {
    setIsMetric(isMetric);
  };

  const convertTemperature = (temp) => {
    if (isMetric) {
      return temp;
    }
    return (temp * 9) / 5 + 32;
  };

  const getFormattedDate = () => {
    if (!weatherData) return "";
    const date = new Date();
    return date.toLocaleDateString("en-US", { timeZone: weatherData.timezone });
  };

  const getFormattedTime = () => {
    if (!weatherData) return "";
    const date = new Date();
    return date.toLocaleTimeString("en-US", {
      timeZone: weatherData.timezone,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow mr-4">
          <Searchbar fetchWeather={fetchWeather} />
        </div>
        <ToggleSwitch onToggle={handleUnitToggle} />
      </div>
      {weatherData && (
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-2">{locationName}</h2>
          <p className="text-lg text-gray-600">{getFormattedDate()}</p>
          <p className="text-lg text-gray-600">{getFormattedTime()}</p>
          <div className="flex items-center mt-4">
            <span className="text-5xl font-bold">
              {Math.round(
                convertTemperature(weatherData.current.temperature_2m)
              )}
            </span>
            <span className="text-3xl mt-2">{isMetric ? "°C" : "°F"}</span>
          </div>
          <p className="text-lg mt-2">
            Weather: {weatherData.current.weather_code}
          </p>
        </div>
      )}
    </div>
  );
}

export default CurrentWeatherCard;
