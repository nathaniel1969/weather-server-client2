import { useState } from "react";
import axios from "axios";
import CurrentWeatherCard from "./components/CurrentWeatherCard";
import HourlyForecastCard from "./components/HourlyForecastCard";
import DailyForecastCard from "./components/DailyForecastCard";
import Header from "./components/Header";

/**
 * The main component of the weather application.
 * @returns {JSX.Element} - The rendered component.
 */
function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [isMetric, setIsMetric] = useState(false);

  /**
   * Handles the toggle between metric and imperial units.
   * @param {boolean} metric - If true, the units are metric.
   */
  const handleUnitToggle = (metric) => {
    setIsMetric(metric);
  };

  /**
   * Fetches the weather data for a given location.
   * @param {string|object} location - The location to fetch the weather for. Can be a string or a suggestion object.
   */
  const fetchWeather = async (location) => {
    try {
      let suggestion;
      if (typeof location === "string") {
        const geoResponse = await axios.get(
          `http://localhost:3001/api/geocode?query=${location}`
        );
        if (geoResponse.data.results && geoResponse.data.results.length > 0) {
          suggestion = geoResponse.data.results[0];
        } else {
          console.error("No geocoding results found");
          return;
        }
      } else {
        suggestion = location;
      }

      const response = await axios.get(
        `http://localhost:3001/api/weather?latitude=${suggestion.geometry.lat}&longitude=${suggestion.geometry.lng}&timezone=${suggestion.timezone}`
      );
      setWeatherData(response.data);
      setLocationName(suggestion.formatted);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <main className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Open-Weather App
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Your simple weather forecast app
        </p>

        <Header
          fetchWeather={fetchWeather}
          isMetric={isMetric}
          onToggle={handleUnitToggle}
        />

        <div className="grid grid-cols-1 gap-8 mt-8">
          <CurrentWeatherCard
            weatherData={weatherData}
            locationName={locationName}
            isMetric={isMetric}
          />
          {weatherData && (
            <>
              <HourlyForecastCard hourlyData={weatherData.hourly} isMetric={isMetric} />
              <DailyForecastCard dailyData={weatherData.daily} isMetric={isMetric} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
