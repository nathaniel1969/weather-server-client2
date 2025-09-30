/**
 * App.jsx
 * Main entry point for the weather application. Handles state, API calls, and renders weather cards and controls.
 */
import { useState, useCallback } from "react";
import axios from "axios";
import { Suspense, lazy } from "react";
const CurrentWeatherCard = lazy(() =>
  import("./components/CurrentWeatherCard")
);
const HourlyForecastCard = lazy(() =>
  import("./components/HourlyForecastCard")
);
const DailyForecastCard = lazy(() => import("./components/DailyForecastCard"));
import Header from "./components/Header";

/**
 * App component
 * @returns {JSX.Element} Main weather app UI
 */
function App() {
  // State for weather data, location, units, search, loading, and error
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [isMetric, setIsMetric] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handles the toggle between metric and imperial units.
   * Memoized for performance.
   * @param {boolean} metric - If true, the units are metric.
   */
  const handleUnitToggle = useCallback((metric) => {
    setIsMetric(metric);
  }, []);

  /**
   * Fetches the weather data for a given location.
   * Memoized for performance.
   * @param {string|object} location - The location to fetch the weather for. Can be a string or a suggestion object.
   */
  const fetchWeather = useCallback(async (location) => {
    setLoading(true);
    setError(null);
    try {
      let suggestion;
      // If location is a string, fetch geocode suggestion
      if (typeof location === "string") {
        const geoResponse = await axios.get(
          `/api/geocode?query=${location}`
        );
        if (geoResponse.data.results && geoResponse.data.results.length > 0) {
          suggestion = geoResponse.data.results[0];
        } else {
          setError("Location not found. Please check your search input.");
          setLoading(false);
          setSearchTerm("");
          return;
        }
      } else {
        suggestion = location;
      }
      // Fetch weather data for the selected suggestion
      const response = await axios.get(
        `/api/weather?latitude=${suggestion.geometry.lat}&longitude=${suggestion.geometry.lng}&timezone=${suggestion.timezone}`
      );
      setWeatherData(response.data);
      setLocationName(suggestion.formatted);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setError("Error fetching weather data. Please try again later.");
    }
    setLoading(false);
  }, []);

  // Main app layout and rendering
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <main className="w-full max-w-4xl">
        {/* App title and subtitle */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Open-Weather App
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Your simple weather forecast app
        </p>

        {/* Header contains search and unit toggle */}
        <Header
          fetchWeather={fetchWeather}
          isMetric={isMetric}
          onToggle={handleUnitToggle}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Loading and error messages */}
        {loading && <p className="text-center mt-8">Loading...</p>}
        {error && <p className="text-center text-red-500 mt-8">{error}</p>}

        {/* Weather cards: only show if data is loaded and no error */}
        <div className="grid grid-cols-1 gap-8 mt-8">
          {!loading && !error && weatherData && (
            <Suspense
              fallback={<div className="text-center">Loading cards...</div>}
            >
              <CurrentWeatherCard
                weatherData={weatherData}
                locationName={locationName}
                isMetric={isMetric}
              />
              <HourlyForecastCard
                weatherData={weatherData}
                hourlyData={weatherData.hourly}
                isMetric={isMetric}
              />
              <DailyForecastCard
                dailyData={weatherData.daily}
                isMetric={isMetric}
              />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
