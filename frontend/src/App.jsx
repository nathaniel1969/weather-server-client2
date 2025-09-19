import { useState } from 'react';
import axios from 'axios';
import CurrentWeatherCard from './components/CurrentWeatherCard';
import HourlyForecastCard from './components/HourlyForecastCard';
import DailyForecastCard from './components/DailyForecastCard';

function App() {
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeather = async (location) => {
    try {
      const response = await axios.get(`/api/weather?location=${location}`);
      setWeatherData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <main className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Open-Weather App</h1>
        <p className="text-lg text-center text-gray-600 mb-8">Your simple weather forecast app</p>

        <div className="grid grid-cols-1 gap-8">
          <CurrentWeatherCard fetchWeather={fetchWeather} weatherData={weatherData} />
          {weatherData && (
            <>
              <HourlyForecastCard hourlyData={weatherData.hourly} />
              <DailyForecastCard dailyData={weatherData.daily} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
