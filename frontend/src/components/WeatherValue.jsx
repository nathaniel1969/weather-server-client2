/**
 * WeatherValue.jsx
 * Displays a weather metric value with its unit, handling metric/imperial conversion and precision.
 */
import React from "react";

/**
 * WeatherValue component
 * @param {Object} props
 * @param {string} props.label - Label for the value (e.g., "Humidity")
 * @param {number | null | undefined} props.value - Raw value (always in metric)
 * @param {string} props.metricUnit - Unit for metric display (e.g., "%", "km/h")
 * @param {string} props.imperialUnit - Unit for imperial display (e.g., "%", "mph")
 * @param {function} [props.convertFn] - Function to convert the value to imperial
 * @param {boolean} props.isMetric - If true, display metric units; otherwise, imperial
 * @param {number} [props.precision=2] - Number of decimal places to show
 * @returns {JSX.Element} Weather value UI
 */
function WeatherValue({
  label,
  value,
  metricUnit,
  imperialUnit,
  convertFn,
  isMetric,
  precision = 2,
}) {
  // Convert value if needed and select unit
  const displayValue = isMetric ? value : convertFn ? convertFn(value) : value;
  const unit = isMetric ? metricUnit : imperialUnit;
  // Format value with specified precision, fallback to empty if null/undefined
  const formattedValue =
    displayValue !== null && displayValue !== undefined
      ? Number(displayValue).toFixed(precision)
      : "";
  return (
    <div className="flex justify-between items-center py-1">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className="text-gray-900">
        {formattedValue} {unit}
      </span>
    </div>
  );
}

export default WeatherValue;
