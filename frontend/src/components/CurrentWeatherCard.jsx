/**
 * CurrentWeatherCard.jsx
 * Displays the current weather information for a location, including background image, temperature, weather icon, and metrics.
 * Fetches a relevant Unsplash image based on location, daylight, and weather description.
 * Uses WeatherValue for metric/imperial display of weather metrics.
 */
import React, { useState, useEffect, useMemo } from "react";
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
 * CurrentWeatherCard component
 * @param {Object} props
 * @param {Object} props.weatherData - Weather data from the API (required)
 * @param {string} props.locationName - Name of the location (required)
 * @param {boolean} props.isMetric - If true, display metric units; otherwise, imperial
 * @returns {JSX.Element} Weather card UI
 */
function CurrentWeatherCard({ weatherData, locationName, isMetric }) {
  const [backgroundImage, setBackgroundImage] = useState("");

  /**
   * Fetch Unsplash image when weatherData or location changes.
   * Query includes location, daylight, and weather description for relevance.
   */
  useEffect(() => {
    if (!weatherData) return;
    const fetchImage = async () => {
      const weatherDescription = getWeatherDescription(
        weatherData.current.weather_code
      );
      const daylight = weatherData.current.is_day ? "day" : "night";
      const unsplashQuery = `${locationName}, ${daylight}, ${weatherDescription}`;
      try {
        const response = await fetch(
          `/api/unsplash?query=${encodeURIComponent(unsplashQuery)}`
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
  }, [weatherData, locationName]);

  /**
   * Returns formatted date string for display, using location's timezone.
   */
  const getFormattedDate = useMemo(() => {
    if (!weatherData) return "";
    const date = new Date();
    // Use weatherData.timezone for correct local date
    const weekday = date.toLocaleString("en-US", {
      weekday: "long",
      timeZone: weatherData.timezone,
    });
    const month = date.toLocaleString("en-US", {
      month: "long",
      timeZone: weatherData.timezone,
    });
    const year = date.toLocaleString("en-US", {
      year: "numeric",
      timeZone: weatherData.timezone,
    });
    const day = date.toLocaleString("en-US", {
      day: "numeric",
      timeZone: weatherData.timezone,
    });
    // Helper to get ordinal suffix for day
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"],
        v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    return `${weekday}, ${month} ${day}${getOrdinal(Number(day))}, ${year}`;
  }, [weatherData]);

  /**
   * Returns formatted time string for display, using location's timezone.
   */
  const getFormattedTime = useMemo(() => {
    if (!weatherData) return "";
    const date = new Date();
    return date.toLocaleTimeString("en-US", {
      timeZone: weatherData.timezone,
      hour: "numeric",
      minute: "2-digit",
    });
  }, [weatherData]);

  // Render weather card with background image and weather values
  return (
    <div
      className="card relative"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        zIndex: 0,
      }}
    >
      {weatherData && (
        <div className="relative z-0">
          {/* Location, date, time, and weather summary */}
          <div className="text-center mb-4 z-0">
            <div
              className="inline-block px-4 py-2 rounded-lg shadow-lg z-0"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}
            >
              {/* Location name */}
              <h2
                className="text-2xl font-bold mb-2 text-blue-900"
                style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
              >
                {locationName}
              </h2>
              {/* Date */}
              <p
                className="text-lg text-blue-900"
                style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
              >
                {getFormattedDate}
              </p>
              {/* Time */}
              <p
                className="text-lg text-blue-900"
                style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
              >
                {getFormattedTime}
              </p>
              {/* Temperature, unit, and weather icon */}
              <div className="flex items-center justify-center mt-4 space-x-2">
                <span
                  className="text-5xl font-bold text-blue-900"
                  style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
                >
                  {Math.round(
                    isMetric
                      ? weatherData.current.temperature_2m
                      : convertTemperature(weatherData.current.temperature_2m)
                  )}
                </span>
                <span
                  className="text-3xl mt-2 text-blue-900"
                  style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
                >
                  {isMetric ? "°C" : "°F"}
                </span>
                {/* Weather icon mapped from weather code and day/night */}
                <i
                  className={`qi-${getIconCode(
                    weatherData.current.weather_code,
                    weatherData.current.is_day
                  )} qi text-5xl text-blue-900`}
                  style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
                  aria-label="Weather icon"
                ></i>
              </div>
              {/* Weather description */}
              <p
                className="text-lg mt-2 text-blue-900"
                style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
              >
                {getWeatherDescription(weatherData.current.weather_code)}
              </p>
              {/* Daylight period */}
              <p
                className="text-lg mt-2 text-blue-900"
                style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.5)" }}
              >
                <strong>Daylight:</strong>{" "}
                {weatherData.current.is_day ? "Day" : "Night"}
              </p>
            </div>
          </div>
          {/* Weather values grid - balanced columns */}
          <div className="grid grid-cols-2 gap-4 mt-6 z-0">
            {/* Left column: Feels Like, Humidity, Precipitation, Cloud Cover */}
            <div
              className="p-4 rounded-lg z-0"
              style={{ backgroundColor: "rgba(255,255,255,0.50)" }}
            >
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
            </div>
            {/* Right column: Surface Pressure, Wind Speed, Wind Direction, Wind Gusts */}
            <div
              className="p-4 rounded-lg z-0"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.50)" }}
            >
              <WeatherValue
                label="Surface Pressure"
                value={weatherData.current.surface_pressure}
                metricUnit="hPa"
                imperialUnit="inHg"
                convertFn={convertPressure}
                isMetric={isMetric}
              />
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
      {/* Overlay div for background image */}
      <div
        className="absolute inset-0 bg-black opacity-20"
        style={{ zIndex: -1 }}
      ></div>
    </div>
  );
}

export default CurrentWeatherCard;
