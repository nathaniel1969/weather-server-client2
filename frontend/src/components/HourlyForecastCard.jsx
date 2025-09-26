import React from "react";
import { useState } from "react";
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
import { convertTemperature, getWeatherDescription, getIconCode } from "../utils/helpers";
import WeatherValue from "./WeatherValue";

/**
 * Displays the hourly weather forecast.
 * @param {object} props - The props for the component.
 * @param {object} props.hourlyData - The hourly weather data from the API.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @returns {JSX.Element} - The rendered component.
 */
function HourlyForecastCard({ hourlyData, isMetric }) {
  const [numHours, setNumHours] = useState(12);

  // Find the index of the next hour after the current hour
  const now = new Date();
  const currentHour = now.getHours();
  let startIndex = 0;
  for (let i = 0; i < hourlyData.time.length; i++) {
    const hour = new Date(hourlyData.time[i]).getHours();
    if (hour > currentHour) {
      startIndex = i;
      break;
    }
  }

  const data = hourlyData.time
    .slice(startIndex, startIndex + numHours)
    .map((time, index) => {
      const realIndex = startIndex + index;
      // Convert temperature if needed
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

  return (
    <div className="card">
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
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {data.map((hour, index) => (
            <div key={index} className="card flex-shrink-0 w-32 text-center">
              <p className="font-bold">{hour.time}</p>
              <p className="text-2xl">
                {Math.round(hour.temperature)}
                {isMetric ? "°C" : "°F"}
              </p>
              <i
                className={`qi-${getIconCode(hour.weatherCode, hour.is_day)} text-3xl`}
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
              />
            </div>
          ))}
        </div>
      </div>
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
