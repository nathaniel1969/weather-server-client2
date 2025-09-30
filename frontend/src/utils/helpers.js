/**
 * Converts visibility from metres to kilometers.
 * @param {number} metres - Visibility in metres.
 * @returns {number} Visibility in kilometers.
 */
export const convertVisibilityToKm = (metres) => metres / 1000;

/**
 * Converts visibility from metres to miles.
 * @param {number} metres - Visibility in metres.
 * @returns {number} Visibility in miles.
 */
export const convertVisibilityToMiles = (metres) => metres / 1609.344;
/**
 * @file Contains helper functions for the weather application.
 * @module utils/helpers
 *
 * Conversion, mapping, and formatting utilities for weather data.
 */

// Conversion factors for metric to imperial units
const KMH_TO_MPH = 1.60934; // km/h to mph
const MM_TO_IN = 25.4; // mm to inches
const HPA_TO_INHG = 0.02953; // hPa to inHg

/**
 * Converts temperature from Celsius to Fahrenheit.
 * @param {number} temp - Temperature in Celsius.
 * @returns {number} Temperature in Fahrenheit.
 */
export const convertTemperature = (temp) => (temp * 9) / 5 + 32;

/**
 * Converts speed from km/h to mph.
 * @param {number} speed - Speed in km/h.
 * @returns {number} Speed in mph.
 */
export const convertSpeed = (speed) => speed / KMH_TO_MPH;

/**
 * Converts precipitation from mm to inches.
 * @param {number} precipitation - Precipitation in mm.
 * @returns {number} Precipitation in inches.
 */
export const convertPrecipitation = (precipitation) => precipitation / MM_TO_IN;

/**
 * Converts pressure from hPa to inHg.
 * @param {number} pressure - Pressure in hPa.
 * @returns {number} Pressure in inHg.
 */
export const convertPressure = (pressure) => pressure * HPA_TO_INHG;

/**
 * Returns a description for a given weather code (WMO).
 * Memoized for performance.
 * @param {number} code - Weather code from the API.
 * @returns {string} Weather description.
 */
const weatherDescriptionCache = {};
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
export const getWeatherDescription = (code) => {
  if (weatherDescriptionCache[code]) return weatherDescriptionCache[code];
  const desc = descriptions[code] || "Unknown";
  weatherDescriptionCache[code] = desc;
  return desc;
};

/**
 * Maps WMO weather codes to QWeather icon codes.
 * Memoized for performance.
 * @param {number} code - WMO weather code from the API.
 * @param {number} isDay - 1 for day, 0 for night.
 * @returns {number} QWeather icon code.
 */
const iconCodeCache = {};
const wmoToQWeather = {
  0: { day: 100, night: 150 },
  1: { day: 101, night: 151 },
  2: { day: 103, night: 153 },
  3: { day: 104, night: 104 },
  45: { day: 501, night: 501 },
  48: { day: 501, night: 501 },
  51: { day: 305, night: 305 },
  53: { day: 306, night: 306 },
  55: { day: 307, night: 307 },
  56: { day: 310, night: 310 },
  57: { day: 311, night: 311 },
  61: { day: 305, night: 305 },
  63: { day: 306, night: 306 },
  65: { day: 307, night: 307 },
  66: { day: 310, night: 310 },
  67: { day: 311, night: 311 },
  71: { day: 400, night: 400 },
  73: { day: 401, night: 401 },
  75: { day: 402, night: 402 },
  77: { day: 403, night: 403 },
  80: { day: 300, night: 300 },
  81: { day: 301, night: 301 },
  82: { day: 302, night: 302 },
  85: { day: 404, night: 404 },
  86: { day: 405, night: 405 },
  95: { day: 302, night: 302 },
  96: { day: 308, night: 308 },
  99: { day: 308, night: 308 },
};
export const getIconCode = (code, isDay = 1) => {
  const cacheKey = `${code}_${isDay}`;
  if (iconCodeCache[cacheKey]) return iconCodeCache[cacheKey];
  let result = 999; // Default icon if not found
  if (wmoToQWeather[code]) {
    result = isDay ? wmoToQWeather[code].day : wmoToQWeather[code].night;
  }
  iconCodeCache[cacheKey] = result;
  return result;
};

/**
 * Formats a duration in seconds to a string like "Xh Ym Zs".
 * @param {number} durationInSeconds - Duration in seconds.
 * @returns {string} Formatted duration string.
 */
export const formatDuration = (durationInSeconds) => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  let formattedDuration = "";
  if (hours > 0) formattedDuration += `${hours}h `;
  if (minutes > 0) formattedDuration += `${minutes}m `;
  if (seconds > 0) formattedDuration += `${seconds}s`;
  return formattedDuration.trim();
};
