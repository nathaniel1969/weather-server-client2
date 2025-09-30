/**
 * DailyForecastCard.jsx
 * Displays the daily weather forecast for upcoming days, including temperature, weather icon, sunrise/sunset, and metrics.
 * Shows a temperature chart using Recharts and uses WeatherValue for metric/imperial display.
 */
import React, { useMemo } from "react";
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
  formatDuration,
} from "../utils/helpers";
import WeatherValue from "./WeatherValue";

/**
 * DailyForecastCard component
 * @param {Object} props
 * @param {Object} props.dailyData - Daily weather data from the API (required)
 * @param {boolean} props.isMetric - If true, display metric units; otherwise, imperial
 * @returns {JSX.Element} Daily forecast card UI
 */
function DailyForecastCard({ dailyData, isMetric }) {
  // Start from the day after the current day
  const startIndex = 1;
  // Memoize mapped daily data for performance
  const data = useMemo(() => {
    return dailyData.time.slice(startIndex).map((time, index) => {
      const realIndex = startIndex + index;
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
  }, [dailyData, isMetric, startIndex]);

  // Render daily forecast card and chart
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Forecast</h2>
      </div>
      {/* Scrollable daily forecast cards */}
      <div className="overflow-x-auto pb-4">
        <div className="flex space-x-4 flex-nowrap">
          {data.map((day, index) => (
            <div key={index} className="card flex-shrink-0 w-50 text-center">
              <p className="font-bold">{day.time}</p>
              <p className="text-xl">
                {Math.round(day.maxTemp)}
                {isMetric ? "°C" : "°F"} / {Math.round(day.minTemp)}
                {isMetric ? "°C" : "°F"}
              </p>
              {/* Weather icon mapped from weather code */}
              <i
                className={`qi-${getIconCode(day.weatherCode)} text-3xl`}
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
                Daylight: {formatDuration(day.daylight_duration)}
              </p>
              <WeatherValue
                label="UV Index"
                value={day.uv_index_max}
                metricUnit=""
                imperialUnit=""
                isMetric={isMetric}
              />
              <p className="text-sm text-gray-600">
                Sunshine: {formatDuration(day.sunshine_duration)}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Daily temperature chart */}
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
