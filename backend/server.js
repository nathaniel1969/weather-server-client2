/**
 * @file Express server for the Open-Weather App backend.
 * This server provides endpoints to fetch weather data, geocoding information,
 * and background images from various third-party APIs. It includes features
 * like caching, rate limiting, and input validation.
 * @module server
 */

import fs from "fs";
import https from "https";
import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { createApi } from "unsplash-js";
import rateLimit from "express-rate-limit";
import NodeCache from "node-cache";
import { query, validationResult } from "express-validator";

dotenv.config();

/**
 * Configuration object holding all environment variables.
 */
const config = {
  port: process.env.PORT || 3001,
  isProduction: process.env.NODE_ENV === "production",
  isHttps: process.env.HTTPS === "true",
  sslKeyPath: process.env.SSL_KEY_PATH,
  sslCertPath: process.env.SSL_CERT_PATH,
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
  opencage: {
    apiKey: process.env.OPENCAGE_API_KEY,
    url:
      process.env.OPENCAGE_URL ||
      "https://api.opencagedata.com/geocode/v1/json",
  },
  openMeteo: {
    url: process.env.OPEN_METEO_URL || "https://api.open-meteo.com/v1/forecast",
  },
};

/**
 * The Unsplash API instance.
 * @type {object}
 */
const unsplashApi = createApi({
  accessKey: config.unsplashAccessKey,
});

/**
 * The Express application.
 * @type {object}
 */
const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

/**
 * Middleware to validate request parameters.
 * It checks for validation errors and sends a 400 response if any are found.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }
  next();
};

// Basic rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

/**
 * In-memory cache for API responses.
 * - stdTTL: 5 minutes (300 seconds)
 * - checkperiod: 2 minutes (120 seconds)
 * - maxKeys: 100
 * @type {NodeCache}
 */
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120, maxKeys: 100 });

/**
 * Middleware to check for and serve cached responses.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
const cacheMiddleware = (req, res, next) => {
  const cacheKey = `${req.path}:${
    req.query.query || `${req.query.latitude}:${req.query.longitude}`
  }`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  // Monkey-patch res.json to cache the response before sending
  const originalJson = res.json;
  res.json = (body) => {
    cache.set(cacheKey, body);
    return originalJson.call(res, body);
  };
  next();
};

// Cache invalidation endpoint (should be protected by authentication/authorization)
app.post("/api/cache/clear", (req, res) => {
  // TODO: Add authentication/authorization check here
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
  handleValidationErrors,
  cacheMiddleware,
  async (req, res, next) => {
    const { query: searchQuery } = req.query;
    try {
      const result = await unsplashApi.photos.getRandom({
        query: searchQuery,
        orientation: "landscape",
      });

      if (result.errors) {
        // Create an error object to be handled by the central error handler
        const error = new Error("Failed to fetch image from Unsplash");
        error.status = 500;
        error.details = result.errors;
        return next(error);
      }

      res.json(result.response);
    } catch (error) {
      // Pass errors to the central error handler
      next(error);
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
  handleValidationErrors,
  cacheMiddleware,
  async (req, res, next) => {
    const { query: searchQuery } = req.query;
    try {
      const geoResponse = await axios.get(config.opencage.url, {
        params: {
          q: searchQuery,
          key: config.opencage.apiKey,
        },
      });
      const geoData = geoResponse.data;

      if (!geoData.results || geoData.results.length === 0) {
        return res.json({ results: [] });
      }

      // Map and enrich the geocoding data
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

      res.json({ results: uniqueResults });
    } catch (error) {
      next(error);
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
  handleValidationErrors,
  cacheMiddleware,
  async (req, res, next) => {
    const { latitude, longitude, timezone } = req.query;
    try {
      const weatherResponse = await axios.get(config.openMeteo.url, {
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
      });
      res.json(weatherResponse.data);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Centralized error handling middleware.
 * This should be the last middleware added to the app.
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err); // Log the error for debugging

  // Default to 500 Internal Server Error
  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific axios errors
  if (err.isAxiosError && err.response) {
    statusCode = err.response.status;
    message =
      err.response.data.error || `Error from external API: ${statusCode}`;
  }

  res.status(statusCode).json({
    error: message,
    // Only show detailed stack in development
    details: config.isProduction ? undefined : err.stack,
  });
};
app.use(errorHandler);

/**
 * Starts the server if not in a test environment.
 * @function
 * @memberof module:server
 */
if (process.env.NODE_ENV !== "test") {
  if (config.isHttps) {
    // HTTPS setup: requires SSL cert and key paths in env
    const sslOptions = {
      key: fs.readFileSync(config.sslKeyPath),
      cert: fs.readFileSync(config.sslCertPath),
    };
    https.createServer(sslOptions, app).listen(config.port, () => {
      console.log(`HTTPS server listening at https://localhost:${config.port}`);
    });
  } else {
    app.listen(config.port, () => {
      console.log(`Server listening at http://localhost:${config.port}`);
    });
  }
}

export default app;
