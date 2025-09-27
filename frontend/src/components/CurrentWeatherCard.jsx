import React, { useState, useEffect } from "react";
import {
  convertTemperature,
  getWeatherDescription,
  getIconCode,
  convertSpeed,
  convertPrecipitation,
  convertPressure,
} from "../utils/helpers";
import WeatherValue from "./WeatherValue";

/**
 * Displays the current weather information.
 * @param {object} props - The props for the component.
 * @param {object} props.weatherData - The weather data from the API.
 * @param {string} props.locationName - The name of the location.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @returns {JSX.Element} - The rendered component.
 */
function CurrentWeatherCard({ weatherData, locationName, isMetric }) {
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    if (weatherData) {
      const fetchImage = async () => {
        const weatherDescription = getWeatherDescription(
          weatherData.current.weather_code
        );
        try {
          const response = await fetch(
            `http://localhost:3001/api/unsplash?query=${weatherDescription}`
          );
          const data = await response.json();
          if (data.urls && data.urls.regular) {
            setBackgroundImage(data.urls.regular);
          }
        } catch (error) {
          console.error("Failed to fetch image from Unsplash", error);
        }
      };
      fetchImage();
    }
  }, [weatherData]);

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
    <div
      className="card"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
                className={`qi-${getIconCode(
                  weatherData.current.weather_code,
                  weatherData.current.is_day
                )} qi text-5xl`}
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
              <WeatherValue
                label="Feels Like"
                value={weatherData.current.apparent_temperature}
                metricUnit="°C"
                imperialUnit="°F"
                convertFn={convertTemperature}
                isMetric={isMetric}
              />
              <WeatherValue
                label="Humidity"
                value={weatherData.current.relative_humidity_2m}
                metricUnit="%"
                imperialUnit="%"
                isMetric={isMetric}
              />
              <WeatherValue
                label="Precipitation"
                value={weatherData.current.precipitation}
                metricUnit="mm"
                imperialUnit="in"
                convertFn={convertPrecipitation}
                isMetric={isMetric}
              />
              <WeatherValue
                label="Cloud Cover"
                value={weatherData.current.cloud_cover}
                metricUnit="%"
                imperialUnit="%"
                isMetric={isMetric}
              />
              <WeatherValue
                label="Surface Pressure"
                value={weatherData.current.surface_pressure}
                metricUnit="hPa"
                imperialUnit="inHg"
                convertFn={convertPressure}
                isMetric={isMetric}
              />
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <WeatherValue
                label="Wind Speed"
                value={weatherData.current.wind_speed_10m}
                metricUnit="km/h"
                imperialUnit="mph"
                convertFn={convertSpeed}
                isMetric={isMetric}
              />
              <WeatherValue
                label="Wind Direction"
                value={weatherData.current.wind_direction_10m}
                metricUnit="°"
                imperialUnit="°"
                isMetric={isMetric}
              />
              <WeatherValue
                label="Wind Gusts"
                value={weatherData.current.wind_gusts_10m}
                metricUnit="km/h"
                imperialUnit="mph"
                convertFn={convertSpeed}
                isMetric={isMetric}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentWeatherCard;
