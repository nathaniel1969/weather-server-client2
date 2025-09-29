import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  convertTemperature,
  getWeatherDescription,
  getIconCode,
} from "../utils/helpers";

import WeatherValue from "./WeatherValue";

/**
 * Displays the hourly weather forecast card with a chart and hourly details.
 * Memoizes data mapping for performance.
 * @param {object} props - The props for the component.
 * @param {object} props.weatherData - Weather data from the API.
 * @param {object} props.hourlyData - The hourly weather data from the API.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @returns {JSX.Element} - The rendered component.
 */

function HourlyForecastCard({ weatherData, hourlyData, isMetric }) {
  // Debug: Print all available forecast hours from API
  // ...existing code...
  // Number of hours to display (user-selectable)
  const [numHours, setNumHours] = useState(12);

  // Get the current time at the location using native JS
  const now = new Date();

  const nowLocalStr = now.toLocaleString("en-US", {
    timeZone: weatherData.timezone,
  });
  const nowLocal = new Date(nowLocalStr);

  // Find the index where year, month, day, and hour exactly match the current local time
  let startIndex = 0;
  if (hourlyData && hourlyData.time) {
    const nowYear = nowLocal.getFullYear();
    const nowMonth = nowLocal.getMonth(); // 0-indexed
    const nowDay = nowLocal.getDate();
    // Get hour in target timezone robustly (no rounding)
    const nowHour = nowLocal.getHours();
    for (let i = 0; i < hourlyData.time.length; i++) {
      const forecastDate = new Date(hourlyData.time[i]);
      const forecastYear = forecastDate.getFullYear();
      const forecastMonth = forecastDate.getMonth();
      const forecastDay = forecastDate.getDate();
      const forecastHour = forecastDate.getHours();
      if (
        forecastYear === nowYear &&
        forecastMonth === nowMonth &&
        forecastDay === nowDay &&
        forecastHour === nowHour
      ) {
        startIndex = i + 1; // Start from the next hour
        break;
      }
    }
  }

  /**
   * Memoize mapped hourly data for performance.
   * Maps API data to chart and card display format.
   */
  const data = useMemo(() => {
    return hourlyData.time
      .slice(startIndex, startIndex + numHours)
      .map((time, index) => {
        const realIndex = startIndex + index;
        const temp = hourlyData.temperature_2m[realIndex];
        return {
          time: new Date(time).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
          temperature: isMetric ? temp : convertTemperature(temp),
          precipitation: hourlyData.precipitation_probability[realIndex],
          weatherCode: hourlyData.weather_code[realIndex],
          relative_humidity_2m: hourlyData.relative_humidity_2m[realIndex],
          dew_point_2m: hourlyData.dew_point_2m[realIndex],
          apparent_temperature: isMetric
            ? hourlyData.apparent_temperature[realIndex]
            : convertTemperature(hourlyData.apparent_temperature[realIndex]),
          rain: hourlyData.rain[realIndex],
          showers: hourlyData.showers[realIndex],
          snowfall: hourlyData.snowfall[realIndex],
          pressure_msl: hourlyData.pressure_msl[realIndex],
          surface_pressure: hourlyData.surface_pressure[realIndex],
          cloud_cover: hourlyData.cloud_cover[realIndex],
          visibility: hourlyData.visibility[realIndex],
          wind_speed_10m: hourlyData.wind_speed_10m[realIndex],
          wind_direction_10m: hourlyData.wind_direction_10m[realIndex],
          wind_gusts_10m: hourlyData.wind_gusts_10m[realIndex],
          uv_index: hourlyData.uv_index[realIndex],
          is_day: hourlyData.is_day[realIndex],
        };
      });
  }, [hourlyData, isMetric, numHours, startIndex]);

  // Render chart and hourly details
  return (
    <div className="hourly-forecast-card p-4 bg-white rounded shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <h2 className="text-2xl font-bold mb-2 md:mb-0">Hourly Forecast</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="numHours" className="font-medium">
            Show:
          </label>
          <select
            id="numHours"
            value={numHours}
            onChange={(e) => setNumHours(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[12, 18, 24, 30, 36, 42, 48].map((val) => (
              <option key={val} value={val}>
                {val} hours
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div
          className="flex gap-4 min-w-[700px]"
          style={{ width: "max-content" }}
        >
          {data.map((item, idx) => (
            <div
              key={idx}
              className="w-56 min-w-[220px] max-w-xs flex-shrink-0 p-3 border rounded bg-gray-50 flex flex-col items-center"
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Weather Icon */}
                <span
                  className={`qwi qwi-${getIconCode(item.weatherCode)}`}
                  style={{ fontSize: 28 }}
                ></span>
                <span className="text-xl font-bold">{item.time}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2 text-center">
                {getWeatherDescription(item.weatherCode)}
              </div>
              <WeatherValue
                label="Humidity"
                value={item.relative_humidity_2m}
                metricUnit="%"
                imperialUnit="%"
                isMetric={isMetric}
              />
              <WeatherValue
                label="Cloud Cover"
                value={item.cloud_cover}
                metricUnit="%"
                imperialUnit="%"
                isMetric={isMetric}
              />
              <WeatherValue
                label="Visibility"
                value={item.visibility}
                metricUnit="m"
                imperialUnit="m"
                isMetric={isMetric}
              />
              <WeatherValue
                label="Wind Speed"
                value={item.wind_speed_10m}
                metricUnit="km/h"
                imperialUnit="mph"
                convertFn={(v) => v * 0.621371}
                isMetric={isMetric}
              />
              <WeatherValue
                label="Wind Direction"
                value={item.wind_direction_10m}
                metricUnit="°"
                imperialUnit="°"
                isMetric={isMetric}
              />
              <WeatherValue
                label="Wind Gusts"
                value={item.wind_gusts_10m}
                metricUnit="km/h"
                imperialUnit="mph"
                convertFn={(v) => v * 0.621371}
                isMetric={isMetric}
              />
              <WeatherValue
                label="UV Index"
                value={item.uv_index}
                metricUnit=""
                imperialUnit=""
                isMetric={isMetric}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-md font-semibold mb-2">Temperature Graph</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#8884d8"
              name={`Temp (${isMetric ? "°C" : "°F"})`}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mb-8">
        <h3 className="text-md font-semibold mb-2">Pressure Graph</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="pressure_msl"
              stroke="#ff7300"
              name="Pressure (hPa)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-md font-semibold mb-2">Precipitation Graph</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="precipitation"
              stroke="#1e90ff"
              name="Precipitation (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
export default HourlyForecastCard;
