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

function DailyForecastCard({ dailyData }) {
  const [numDays, setNumDays] = useState(7);

  const data = dailyData.time.slice(0, numDays).map((time, index) => ({
    time: new Date(time).toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
    minTemp: dailyData.temperature_2m_min[index],
    maxTemp: dailyData.temperature_2m_max[index],
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Daily Forecast</h2>
        <select
          value={numDays}
          onChange={(e) => setNumDays(parseInt(e.target.value))}
          className="p-2 rounded-md border border-gray-300"
        >
          <option value={3}>3 Days</option>
          <option value={5}>5 Days</option>
          <option value={7}>7 Days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
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
  );
}

export default DailyForecastCard;
