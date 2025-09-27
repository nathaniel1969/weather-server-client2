/**
 * @file Express server for the Open-Weather App backend.
 * @module server
 */

import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import * as unsplash from "unsplash-js";

dotenv.config();

const unsplashApi = unsplash.createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

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
 * Unsplash API endpoint for fetching a random image.
 * @name GET /api/unsplash
 * @function
 * @memberof module:server
 * @param {object} req - Express request object.
 * @param {string} req.query.query - The search query for the image.
 * @param {object} res - Express response object.
 * @returns {object} - JSON response with the image data from Unsplash.
 */
app.get("/api/unsplash", async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const result = await unsplashApi.photos.getRandom({
      query,
      orientation: "landscape",
    });

    if (result.errors) {
      console.error("Unsplash API error:", result.errors);
      return res.status(500).json({ error: "Failed to fetch image from Unsplash" });
    }

    res.json(result.response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch image from Unsplash" });
  }
});

/**
 * Geocoding API endpoint for location suggestions.
 * @name GET /api/geocode
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
      if (
        item.annotations &&
        item.annotations.timezone &&
        item.annotations.timezone.name
      ) {
        timezoneName = item.annotations.timezone.name;
      } else {
        console.error("Timezone not found for item:", item);
      }
      return {
        formatted: item.formatted,
        city:
          components.city ||
          components.town ||
          components.village ||
          components.hamlet,
        state: components.state || components.province,
        county: components.county,
        country: components.country,
        timezone: timezoneName || "", // Ensure timezone is a string
        geometry: item.geometry,
        flag:
          item.annotations && item.annotations.flag
            ? item.annotations.flag
            : null,
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
 * @name GET /api/weather
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
    return res
      .status(400)
      .json({ error: "Latitude, longitude, and timezone are required" });
  }

  try {
    const weatherResponse = await axios.get(
      `https://api.open-meteo.com/v1/forecast`,
      {
        params: {
          latitude,
          longitude,
          daily:
            "weather_code,temperature_2m_max,temperature_2m_min,sunset,sunrise,daylight_duration,uv_index_max,apparent_temperature_max,apparent_temperature_min,rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunshine_duration",
          hourly:
            ",temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day",
          current:
            "temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,rain,snowfall,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_gusts_10m,wind_direction_10m,wind_speed_10m",
          wind_speed_unit: "kmh",
          temperature_unit: "celsius",
          precipitation_unit: "mm",
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

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

export default app;