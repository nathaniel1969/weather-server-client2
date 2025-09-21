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
 * Displays the hourly weather forecast.
 * @param {object} props - The props for the component.
 * @param {object} props.hourlyData - The hourly weather data from the API.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @returns {JSX.Element} - The rendered component.
 */
function HourlyForecastCard({ hourlyData, isMetric }) {
  const [numHours, setNumHours] = useState(12);

  const data = hourlyData.time.slice(0, numHours).map((time, index) => ({
    time: new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: hourlyData.temperature_2m[index],
    precipitation: hourlyData.precipitation_probability[index],
    weatherCode: hourlyData.weather_code[index],
  }));

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
            <div
              key={index}
              className="card flex-shrink-0 w-32 text-center"
            >
              <p className="font-bold">{hour.time}</p>
              <p className="text-2xl">
                {Math.round(
                  isMetric
                    ? hour.temperature
                    : convertTemperature(hour.temperature)
                )}
                {isMetric ? "°C" : "°F"}
              </p>
              <p className="text-sm text-gray-600">
                {getWeatherDescription(hour.weatherCode)}
              </p>
              <p className="text-sm text-gray-600">Precip: {hour.precipitation}%</p>
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
