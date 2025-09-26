/**
 * @file Contains helper functions for the weather application.
 * @module utils/helpers
 */

/**
 * Conversion factors for metric to imperial units.
 */
const KMH_TO_MPH = 1.60934;
const MM_TO_IN = 25.4;
const HPA_TO_INHG = 0.02953;

/**
 * Converts temperature from Celsius to Fahrenheit.
 * @param {number} temp - The temperature in Celsius.
 * @returns {number} - The converted temperature in Fahrenheit.
 */
export const convertTemperature = (temp) => {
  return (temp * 9) / 5 + 32;
};

/**
 * Converts speed from km/h to mph.
 * @param {number} speed - The speed in km/h.
 * @returns {number} - The converted speed in mph.
 */
export const convertSpeed = (speed) => {
  return speed / KMH_TO_MPH;
};

/**
 * Converts precipitation from mm to inches.
 * @param {number} precipitation - The precipitation in mm.
 * @returns {number} - The converted precipitation in inches.
 */
export const convertPrecipitation = (precipitation) => {
  return precipitation / MM_TO_IN;
};

/**
 * Converts pressure from hPa to inHg.
 * @param {number} pressure - The pressure in hPa.
 * @returns {number} - The converted pressure in inHg.
 */
export const convertPressure = (pressure) => {
  return pressure * HPA_TO_INHG;
};

/**
 * Returns a description for a given weather code.
 * @param {number} code - The weather code from the API.
 * @returns {string} - The weather description.
 */
export const getWeatherDescription = (code) => {
  const descriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Drizzle: Light intensity",
    53: "Drizzle: Moderate intensity",
    55: "Drizzle: Dense intensity",
    56: "Freezing Drizzle: Light intensity",
    57: "Freezing Drizzle: Dense intensity",
    61: "Rain: Slight intensity",
    63: "Rain: Moderate intensity",
    65: "Rain: Heavy intensity",
    66: "Freezing Rain: Light intensity",
    67: "Freezing Rain: Heavy intensity",
    71: "Snow fall: Slight intensity",
    73: "Snow fall: Moderate intensity",
    75: "Snow fall: Heavy intensity",
    77: "Snow grains",
    80: "Rain showers: Slight intensity",
    81: "Rain showers: Moderate intensity",
    82: "Rain showers: Violent intensity",
    85: "Snow showers: Slight intensity",
    86: "Snow showers: Heavy intensity",
    95: "Thunderstorm: Slight or moderate",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
};

/**
 * Maps WMO weather codes to QWeather icon codes.
 * @param {number} code - The WMO weather code from the API.
 * @param {number} isDay - 1 for day, 0 for night.
 * @returns {number} - The corresponding QWeather icon code.
 */
export const getIconCode = (code, isDay = 1) => {
  const wmoToQWeather = {
    0: isDay ? 100 : 150, // Clear
    1: isDay ? 101 : 151, // Mainly clear
    2: isDay ? 103 : 153, // Partly cloudy
    3: 104, // Overcast
    45: 501, // Fog
    48: 501, // Depositing rime fog
    51: 305, // Drizzle: Light
    53: 306, // Drizzle: Moderate
    55: 307, // Drizzle: Dense
    56: 310, // Freezing Drizzle: Light
    57: 311, // Freezing Drizzle: Dense
    61: 305, // Rain: Slight
    63: 306, // Rain: Moderate
    65: 307, // Rain: Heavy
    66: 310, // Freezing Rain: Light
    67: 311, // Freezing Rain: Heavy
    71: 400, // Snow fall: Slight
    73: 401, // Snow fall: Moderate
    75: 402, // Snow fall: Heavy
    77: 403, // Snow grains
    80: 300, // Rain showers: Slight
    81: 301, // Rain showers: Moderate
    82: 302, // Rain showers: Violent
    85: 404, // Snow showers slight
    86: 405, // Snow showers heavy
    95: 302, // Thunderstorm: Slight or moderate
    96: 308, // Thunderstorm with slight hail
    99: 308, // Thunderstorm with heavy hail
  };
  return wmoToQWeather[code] || 999; // 999 is 'Unknown'
};

/**
 * Formats a duration in seconds to a string like "Xh Ym Zs".
 * @param {number} durationInSeconds - The duration in seconds.
 * @returns {string} - The formatted duration string.
 */
export const formatDuration = (durationInSeconds) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);

  let formattedDuration = "";
  if (hours > 0) {
    formattedDuration += `${hours}h `;
  }
  if (minutes > 0) {
    formattedDuration += `${minutes}m `;
  }
  if (seconds > 0) {
    formattedDuration += `${seconds}s`;
  }

  return formattedDuration.trim();
};