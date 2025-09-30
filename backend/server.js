import fs from "fs";
import https from "https";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import * as unsplash from "unsplash-js";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";
import { query, validationResult } from "express-validator";

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    res.json({ status: "ok", uptime: process.uptime() });
  } catch (error) {
    res.status(500).json({ status: "error", details: error.message });
  }
});
/**
 * @file Express server for the Open-Weather App backend.
 * @module server
 */
dotenv.config();

/**
 * The Unsplash API instance.
 * @type {object}
 */
const unsplashApi = unsplash.createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
});

/**
 * The Express application.
 * @type {object}
 */
const app = express();
/**
 * The port the server is listening on.
 * @type {number}
 */
const port = process.env.PORT || 3001;

app.use(express.json());
app.use(helmet());
app.use(cors());

// Basic rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Simple in-memory cache for API responses with max keys and periodic cleanup
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120, maxKeys: 100 });

// Cache invalidation endpoint (admin only, example)
app.post("/api/cache/clear", (req, res) => {
  cache.flushAll();
  res.json({ message: "Cache cleared." });
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
 * @throws {400} If query parameter is missing.
 * @throws {429} If rate limit is exceeded.
 * @throws {500} If Unsplash API fails or other errors occur.
 */
app.get(
  "/api/unsplash",
  [query("query").isString().isLength({ min: 2 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { query: searchQuery } = req.query;
    const cacheKey = `unsplash:${searchQuery}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    try {
      const result = await unsplashApi.photos.getRandom({
        query: searchQuery,
        orientation: "landscape",
      });
      if (result.errors) {
        console.error("Unsplash API error:", result.errors);
        return res.status(500).json({
          error: "Failed to fetch image from Unsplash",
          details: result.errors,
        });
      }
      cache.set(cacheKey, result.response);
      res.json(result.response);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return res
          .status(429)
          .json({ error: "Rate limit exceeded for Unsplash API." });
      }
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch image from Unsplash",
        details: error.message,
      });
    }
  }
);

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
app.get(
  "/api/geocode",
  [query("query").isString().isLength({ min: 2 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { query: searchQuery } = req.query;
    const cacheKey = `geocode:${searchQuery}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json({ results: cached });
    }
    try {
      const opencageApiKey = process.env.OPENCAGE_API_KEY;
      const geoResponse = await axios.get(
        process.env.OPENCAGE_URL ||
          "https://api.opencagedata.com/geocode/v1/json",
        {
          params: {
            q: searchQuery,
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

      // Deduplicate results to prevent key errors in the frontend
      const uniqueResults = [];
      const seen = new Set();
      for (const item of results) {
        const identifier = `${item.formatted}|${item.geometry.lat}|${item.geometry.lng}`;
        if (!seen.has(identifier)) {
          seen.add(identifier);
          uniqueResults.push(item);
        }
      }

      cache.set(cacheKey, uniqueResults);
      res.json({ results: uniqueResults });
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return res
          .status(429)
          .json({ error: "Rate limit exceeded for geocoding API." });
      }
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch geocoding suggestions",
        details:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  }
);

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
app.get(
  "/api/weather",
  [
    query("latitude").isFloat(),
    query("longitude").isFloat(),
    query("timezone").isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { latitude, longitude, timezone } = req.query;
    const cacheKey = `weather:${latitude}:${longitude}:${timezone}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    try {
      const weatherResponse = await axios.get(
        process.env.OPEN_METEO_URL || `https://api.open-meteo.com/v1/forecast`,
        {
          params: {
            latitude,
            longitude,
            daily:
              "weather_code,temperature_2m_max,temperature_2m_min,sunset,sunrise,daylight_duration,uv_index_max,apparent_temperature_max,apparent_temperature_min,rain_sum,showers_sum,snowfall_sum,precipitation_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunshine_duration",
            hourly:
              "temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,is_day",
            current:
              "temperature_2m,apparent_temperature,relative_humidity_2m,is_day,precipitation,rain,snowfall,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_gusts_10m,wind_direction_10m,wind_speed_10m",
            wind_speed_unit: "kmh",
            temperature_unit: "celsius",
            precipitation_unit: "mm",
            timezone,
          },
        }
      );
      cache.set(cacheKey, weatherResponse.data);
      res.json(weatherResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        return res
          .status(429)
          .json({ error: "Rate limit exceeded for weather API." });
      }
      console.error(error);
      res.status(500).json({
        error: "Failed to fetch weather data",
        details:
          process.env.NODE_ENV === "production" ? undefined : error.message,
      });
    }
  }
);

/**
 * Starts the server if not in a test environment.
 * @function
 * @memberof module:server
 */
if (process.env.NODE_ENV !== "test") {
  if (process.env.HTTPS === "true") {
    // HTTPS setup: requires SSL cert and key paths in env
    const sslOptions = {
      key: fs.readFileSync(process.env.SSL_KEY_PATH),
      cert: fs.readFileSync(process.env.SSL_CERT_PATH),
    };
    https.createServer(sslOptions, app).listen(port, () => {
      console.log(`HTTPS server listening at https://localhost:${port}`);
    });
  } else {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  }
}

export default app;
