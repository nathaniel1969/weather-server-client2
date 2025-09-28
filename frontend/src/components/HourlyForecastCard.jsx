import React, { useState, useMemo } from "react";
import { DateTime } from "luxon";
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
 * @param {object} props.hourlyData - The hourly weather data from the API.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @returns {JSX.Element} - The rendered component.
 */
/**
 * @param {object} props
 * @param {object} props.hourlyData - The hourly weather data from the API.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @param {string} props.timezone - The IANA timezone string for the location (e.g., "Australia/Sydney").
 */
function HourlyForecastCard({ hourlyData, isMetric, timezone }) {
  // Debug: Print all available forecast hours from API
  console.log("hourlyData.time:", hourlyData.time);
  // Number of hours to display (user-selectable)
  const [numHours, setNumHours] = useState(12);

  // Use Luxon to get the current time in the location's timezone
  const nowLuxon = DateTime.now().setZone(timezone);

  // Find the index of the first forecast hour strictly after the local time
  let startIndex = 0;
  for (let i = 0; i < hourlyData.time.length; i++) {
    const forecastLuxon = DateTime.fromISO(hourlyData.time[i], {
      zone: timezone,
    });
    console.log(
      `Comparing: forecastLuxon = ${forecastLuxon.toISO()} (${forecastLuxon.toMillis()}) to nowLuxon = ${nowLuxon.toISO()} (${nowLuxon.toMillis()})`
    );
    if (forecastLuxon.toMillis() > nowLuxon.toMillis()) {
      console.log(
        `Found startIndex: ${i} (forecastLuxon = ${forecastLuxon.toISO()}) > nowLuxon = ${nowLuxon.toISO()}`
      );
      startIndex = i;
      break;
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

  // Render hourly forecast card and chart
  return (
    <div className="card">
      {/* Header and hour selection */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Hourly Forecast</h2>
        <select
          value={numHours}
          onChange={(e) => setNumHours(parseInt(e.target.value))}
          className="p-2 rounded-md border border-gray-300"
        >
          {[12, 18, 24, 30, 36, 42, 48].map((hours) => (
            <option key={hours} value={hours}>
              {hours} Hours
            </option>
          ))}
        </select>
      </div>
      {/* Hourly cards */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {data.map((hour, index) => (
            <div key={index} className="card flex-shrink-0 w-40 text-center">
              <p className="font-bold">{hour.time}</p>
              <p className="text-2xl">
                {Math.round(hour.temperature)}
                {isMetric ? "°C" : "°F"}
              </p>
              {/* Weather icon mapped from weather code and day/night */}
              <i
                className={`qi-${getIconCode(
                  hour.weatherCode,
                  hour.is_day
                )} text-3xl`}
                aria-label="Weather icon"
              ></i>
              <p className="text-sm text-gray-600">
                {getWeatherDescription(hour.weatherCode)}
              </p>
              <WeatherValue
                label="Precip"
                value={hour.precipitation}
                metricUnit="%"
                imperialUnit="%"
                isMetric={isMetric}
              />
              <WeatherValue
                label="UV"
                value={hour.uv_index}
                metricUnit=""
                imperialUnit=""
                isMetric={isMetric}
              />
              <WeatherValue
                label="Clouds"
                value={hour.cloud_cover}
                metricUnit="%"
                imperialUnit="%"
                isMetric={isMetric}
                style={{ whiteSpace: "nowrap" }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Hourly temperature chart */}
      <div className="mt-6" style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HourlyForecastCard;
