import React from "react";
// ...existing code...
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
  // Start from the day after the current day
  const startIndex = 1;
  // Always show all available days after today
  const data = dailyData.time.slice(startIndex).map((time, index) => {
    const realIndex = startIndex + index;
    // Convert temperatures if needed
    const minTemp = dailyData.temperature_2m_min[realIndex];
    const maxTemp = dailyData.temperature_2m_max[realIndex];
    return {
      time: new Date(time).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      minTemp: isMetric ? minTemp : convertTemperature(minTemp),
      maxTemp: isMetric ? maxTemp : convertTemperature(maxTemp),
      weatherCode: dailyData.weather_code[realIndex],
      sunrise: dailyData.sunrise[realIndex],
      sunset: dailyData.sunset[realIndex],
      daylight_duration: dailyData.daylight_duration[realIndex],
      uv_index_max: dailyData.uv_index_max[realIndex],
      apparent_temperature_max: isMetric
        ? dailyData.apparent_temperature_max[realIndex]
        : convertTemperature(dailyData.apparent_temperature_max[realIndex]),
      apparent_temperature_min: isMetric
        ? dailyData.apparent_temperature_min[realIndex]
        : convertTemperature(dailyData.apparent_temperature_min[realIndex]),
      rain_sum: dailyData.rain_sum[realIndex],
      showers_sum: dailyData.showers_sum[realIndex],
      snowfall_sum: dailyData.snowfall_sum[realIndex],
      precipitation_sum: dailyData.precipitation_sum[realIndex],
      precipitation_hours: dailyData.precipitation_hours[realIndex],
      precipitation_probability_max:
        dailyData.precipitation_probability_max[realIndex],
      wind_speed_10m_max: dailyData.wind_speed_10m_max[realIndex],
      wind_gusts_10m_max: dailyData.wind_gusts_10m_max[realIndex],
      wind_direction_10m_dominant:
        dailyData.wind_direction_10m_dominant[realIndex],
      sunshine_duration: dailyData.sunshine_duration[realIndex],
    };
  });

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Forecast</h2>
      </div>
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4">
          {data.map((day, index) => (
            <div key={index} className="card flex-shrink-0 w-40 text-center">
              <p className="font-bold">{day.time}</p>
              <p className="text-xl">
                {Math.round(day.maxTemp)}
                {isMetric ? "°C" : "°F"} / {Math.round(day.minTemp)}
                {isMetric ? "°C" : "°F"}
              </p>
              <i
                className={`qi-${day.weatherCode} qi text-3xl`}
                aria-label="Weather icon"
              ></i>
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
              <p className="text-sm text-gray-600">
                Daylight: {day.daylight_duration}
              </p>
              <p className="text-sm text-gray-600">
                UV Index: {day.uv_index_max}
              </p>
              <p className="text-sm text-gray-600">
                Sunshine: {day.sunshine_duration}
              </p>
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
              stroke="#0074D9" // blue
              name="Min Temp"
            />
            <Line
              type="monotone"
              dataKey="maxTemp"
              stroke="#FF4136" // red
              name="Max Temp"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DailyForecastCard;
