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

function HourlyForecastCard({ hourlyData }) {
  const [numHours, setNumHours] = useState(12);

  const data = hourlyData.time.slice(0, numHours).map((time, index) => ({
    time: new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    temperature: hourlyData.temperature_2m[index],
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Hourly Forecast</h2>
        <select
          value={numHours}
          onChange={(e) => setNumHours(parseInt(e.target.value))}
          className="p-2 rounded-md border border-gray-300"
        >
          <option value={12}>12 Hours</option>
          <option value={48}>48 Hours</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <ResponsiveContainer width={numHours * 50} height={300}>
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
