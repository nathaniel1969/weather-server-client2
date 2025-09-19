import { useState } from 'react';
import Searchbar from './Searchbar';
import ToggleSwitch from './ToggleSwitch';

function CurrentWeatherCard({ fetchWeather, weatherData }) {
  const [isMetric, setIsMetric] = useState(false);

  const handleUnitToggle = (isMetric) => {
    setIsMetric(isMetric);
  };

  const convertTemperature = (temp) => {
    if (isMetric) {
      return temp;
    }
    return (temp * 9) / 5 + 32;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-grow mr-4">
          <Searchbar fetchWeather={fetchWeather} />
        </div>
        <ToggleSwitch onToggle={handleUnitToggle} />
      </div>
      {weatherData && (
        <div>
          <h2 className="text-2xl font-bold mb-2">
            {weatherData.latitude.toFixed(2)}, {weatherData.longitude.toFixed(2)}
          </h2>
          <div className="flex items-center">
            <span className="text-5xl font-bold">
              {Math.round(convertTemperature(weatherData.current.temperature_2m))}
            </span>
            <span className="text-3xl mt-2">
              {isMetric ? '°C' : '°F'}
            </span>
          </div>
          <p className="text-lg">
            Weather: {weatherData.current.weather_code}
          </p>
        </div>
      )}
    </div>
  );
}

export default CurrentWeatherCard;