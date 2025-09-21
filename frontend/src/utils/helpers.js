/**
 * @file Contains helper functions for the weather application.
 * @module utils/helpers
 */

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
  return speed / 1.60934;
};

/**
 * Converts precipitation from mm to inches.
 * @param {number} precipitation - The precipitation in mm.
 * @returns {number} - The converted precipitation in inches.
 */
export const convertPrecipitation = (precipitation) => {
  return precipitation / 25.4;
};

/**
 * Converts pressure from hPa to inHg.
 * @param {number} pressure - The pressure in hPa.
 * @returns {number} - The converted pressure in inHg.
 */
export const convertPressure = (pressure) => {
  return pressure * 0.02953;
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
