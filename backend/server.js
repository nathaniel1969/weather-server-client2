/**
 * Express server for the Open-Weather App backend.
 * @module server
 */

import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// CORS configuration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

/**
 * Geocoding API endpoint for location suggestions.
 * @name /api/geocode
 * @function
 * @memberof module:server
 * @param {object} req - Express request object.
 * @param {string} req.query.query - The location query string.
 * @param {object} res - Express response object.
 * @returns {object} - JSON response with geocoding suggestions.
 */
app.get("/api/geocode", async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }
  try {
    const opencageApiKey = process.env.OPENCAGE_API_KEY;
    const geoResponse = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: query,
          key: opencageApiKey,
          limit: 10,
          no_annotations: 1,
        },
      }
    );
    const geoData = geoResponse.data;
    if (!geoData.results || geoData.results.length === 0) {
      return res.json({ results: [] });
    }
    const results = geoData.results.map((item) => {
      const components = item.components || {};
      let timezoneName = null;
      if (item.annotations && item.annotations.timezone && item.annotations.timezone.name) {
        timezoneName = item.annotations.timezone.name;
      } else {
        console.error('Timezone not found for item:', item);
      }
      return {
        formatted: item.formatted,
        city: components.city || components.town || components.village || components.hamlet,
        state: components.state || components.province,
        county: components.county,
        country: components.country,
        timezone: timezoneName || "", // Ensure timezone is a string
        geometry: item.geometry,
        flag: item.annotations && item.annotations.flag ? item.annotations.flag : null,
      };
    });
    res.json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch geocoding suggestions" });
  }
});

/**
 * Weather API endpoint.
 * @name /api/weather
 * @function
 * @memberof module:server
 * @param {object} req - Express request object.
 * @param {string} req.query.latitude - The latitude for the weather forecast.
 * @param {string} req.query.longitude - The longitude for the weather forecast.
 * @param {string} req.query.timezone - The timezone for the weather forecast.
 * @param {object} res - Express response object.
 * @returns {object} - JSON response with the weather forecast.
 */
app.get("/api/weather", async (req, res) => {
  const { latitude, longitude, timezone } = req.query;

  if (!latitude || !longitude || !timezone) {
    return res.status(400).json({ error: "Latitude, longitude, and timezone are required" });
  }

  try {
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast`,
      {
        params: {
          latitude,
          longitude,
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,visibility_mean,visibility_min,visibility_max,surface_pressure_mean,surface_pressure_max,surface_pressure_min,cloud_cover_mean,cloud_cover_max,cloud_cover_min",
          hourly:
            "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,visibility,cloud_cover,surface_pressure,weather_code,snow_depth,snowfall,showers,rain,uv_index",
          current:
            "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,rain,showers,snowfall,pressure_msl",
          wind_speed_unit: "mph",
          temperature_unit: "fahrenheit",
          precipitation_unit: "inch",
          timezone,
        },
      }
    );

    res.json(weatherResponse.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

export default app;