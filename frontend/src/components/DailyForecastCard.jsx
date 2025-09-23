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
import { convertTemperature, getWeatherDescription } from "../utils/helpers";

/**
 * Displays the daily weather forecast.
 * @param {object} props - The props for the component.
 * @param {object} props.dailyData - The daily weather data from the API.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @returns {JSX.Element} - The rendered component.
 */
function DailyForecastCard({ dailyData, isMetric }) {
  const [numDays, setNumDays] = useState(8);

  const data = dailyData.time.slice(0, numDays).map((time, index) => ({
    time: new Date(time).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    minTemp: dailyData.temperature_2m_min[index],
    maxTemp: dailyData.temperature_2m_max[index],
    weatherCode: dailyData.weather_code[index],
    sunrise: dailyData.sunrise[index],
    sunset: dailyData.sunset[index],
    daylight_duration: dailyData.daylight_duration[index],
    uv_index_max: dailyData.uv_index_max[index],
    apparent_temperature_max: dailyData.apparent_temperature_max[index],
    apparent_temperature_min: dailyData.apparent_temperature_min[index],
    rain_sum: dailyData.rain_sum[index],
    showers_sum: dailyData.showers_sum[index],
    snowfall_sum: dailyData.snowfall_sum[index],
    precipitation_sum: dailyData.precipitation_sum[index],
    precipitation_hours: dailyData.precipitation_hours[index],
    precipitation_probability_max: dailyData.precipitation_probability_max[index],
    wind_speed_10m_max: dailyData.wind_speed_10m_max[index],
    wind_gusts_10m_max: dailyData.wind_gusts_10m_max[index],
    wind_direction_10m_dominant: dailyData.wind_direction_10m_dominant[index],
    sunshine_duration: dailyData.sunshine_duration[index],
  }));

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Forecast</h2>
        <select
          value={numDays}
          onChange={(e) => setNumDays(parseInt(e.target.value))}
          className="p-2 rounded-md border border-gray-300"
        >
          {[8, 10, 12, 14].map((day) => (
            <option key={day} value={day}>
              {day} Days
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {data.map((day, index) => (
            <div key={index} className="card flex-shrink-0 w-40 text-center">
              <p className="font-bold">{day.time}</p>
              <p className="text-xl">
                {Math.round(
                  isMetric ? day.maxTemp : convertTemperature(day.maxTemp)
                )}
                {isMetric ? "°C" : "°F"} /{" "}
                {Math.round(
                  isMetric ? day.minTemp : convertTemperature(day.minTemp)
                )}
                {isMetric ? "°C" : "°F"}
              </p>
              <p className="text-sm text-gray-600">
                {getWeatherDescription(day.weatherCode)}
              </p>
              <p className="text-sm text-gray-600">
                Sunrise:{" "}
                {new Date(day.sunrise).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-600">
                Sunset:{" "}
                {new Date(day.sunset).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-sm text-gray-600">Daylight: {day.daylight_duration}</p>
              <p className="text-sm text-gray-600">UV Index: {day.uv_index_max}</p>
              <p className="text-sm text-gray-600">Sunshine: {day.sunshine_duration}</p>
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
              dataKey="minTemp"
              stroke="#8884d8"
              name="Min Temp"
            />
            <Line
              type="monotone"
              dataKey="maxTemp"
              stroke="#82ca9d"
              name="Max Temp"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DailyForecastCard;
