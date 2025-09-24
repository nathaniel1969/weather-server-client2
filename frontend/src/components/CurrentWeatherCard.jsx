import React from "react";
import {
  convertTemperature,
  getWeatherDescription,
  convertSpeed,
  convertPrecipitation,
  convertPressure,
} from "../utils/helpers";

/**
 * Displays the current weather information.
 * @param {object} props - The props for the component.
 * @param {object} props.weatherData - The weather data from the API.
 * @param {string} props.locationName - The name of the location.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @returns {JSX.Element} - The rendered component.
 */
function CurrentWeatherCard({ weatherData, locationName, isMetric }) {
  const getFormattedDate = () => {
    if (!weatherData) return "";
    const date = new Date();
    // Format: September 24th, 2025
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    // Add ordinal suffix to day
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"],
        v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    return `${month} ${day}${getOrdinal(day)}, ${year}`;
  };

  const getFormattedTime = () => {
    if (!weatherData) return "";
    const date = new Date();
    return date.toLocaleTimeString("en-US", {
      timeZone: weatherData.timezone,
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="card">
      {weatherData && (
        <div>
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">{locationName}</h2>
            <p className="text-lg text-gray-600">{getFormattedDate()}</p>
            <p className="text-lg text-gray-600">{getFormattedTime()}</p>
            <div className="flex items-center justify-center mt-4 space-x-2">
              <span className="text-5xl font-bold">
                {Math.round(
                  isMetric
                    ? weatherData.current.temperature_2m
                    : convertTemperature(weatherData.current.temperature_2m)
                )}
              </span>
              <span className="text-3xl mt-2">{isMetric ? "°C" : "°F"}</span>
              <i
                className={`qi-${weatherData.current.weather_code} qi text-5xl`}
                aria-label="Weather icon"
              ></i>
            </div>
            <p className="text-lg mt-2">
              {getWeatherDescription(weatherData.current.weather_code)}
            </p>
            <p className="text-lg mt-2">
              <strong>Daylight:</strong>{" "}
              {weatherData.current.is_day ? "Day" : "Night"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p>
                <strong>Apparent Temperature:</strong>{" "}
                {Math.round(
                  isMetric
                    ? weatherData.current.apparent_temperature
                    : convertTemperature(
                        weatherData.current.apparent_temperature
                      )
                )}
                {isMetric ? "°C" : "°F"}
              </p>
              <p>
                <strong>Humidity:</strong>{" "}
                {weatherData.current.relative_humidity_2m}%
              </p>
              <p>
                <strong>Precipitation:</strong>{" "}
                {isMetric
                  ? weatherData.current.precipitation.toFixed(2) + " mm"
                  : convertPrecipitation(
                      weatherData.current.precipitation
                    ).toFixed(2) + " in"}
              </p>
              <p>
                <strong>Cloud Cover:</strong> {weatherData.current.cloud_cover}%
              </p>
              <p>
                <strong>Surface Pressure:</strong>{" "}
                {isMetric
                  ? weatherData.current.surface_pressure.toFixed(2) + " hPa"
                  : convertPressure(
                      weatherData.current.surface_pressure
                    ).toFixed(2) + " inHg"}
              </p>
              <p>
                <strong>MSL Pressure:</strong>{" "}
                {isMetric
                  ? weatherData.current.pressure_msl.toFixed(2) + " hPa"
                  : convertPressure(weatherData.current.pressure_msl).toFixed(
                      2
                    ) + " inHg"}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p>
                <strong>Wind Speed:</strong>{" "}
                {isMetric
                  ? weatherData.current.wind_speed_10m.toFixed(2) + " km/h"
                  : convertSpeed(weatherData.current.wind_speed_10m).toFixed(
                      2
                    ) + " mph"}
              </p>
              <p>
                <strong>Wind Direction:</strong>{" "}
                {weatherData.current.wind_direction_10m}°
              </p>
              <p>
                <strong>Wind Gusts:</strong>{" "}
                {isMetric
                  ? weatherData.current.wind_gusts_10m.toFixed(2) + " km/h"
                  : convertSpeed(weatherData.current.wind_gusts_10m).toFixed(
                      2
                    ) + " mph"}
              </p>
              <p>
                <strong>Rain:</strong>{" "}
                {isMetric
                  ? weatherData.current.rain.toFixed(2) + " mm"
                  : convertPrecipitation(weatherData.current.rain).toFixed(2) +
                    " in"}
              </p>
              <p>
                <strong>Showers:</strong>{" "}
                {isMetric
                  ? weatherData.current.showers.toFixed(2) + " mm"
                  : convertPrecipitation(weatherData.current.showers).toFixed(
                      2
                    ) + " in"}
              </p>
              <p>
                <strong>Snowfall:</strong>{" "}
                {isMetric
                  ? weatherData.current.snowfall.toFixed(2) + " mm"
                  : convertPrecipitation(weatherData.current.snowfall).toFixed(
                      2
                    ) + " in"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentWeatherCard;
