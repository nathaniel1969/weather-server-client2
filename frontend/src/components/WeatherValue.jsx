import React from "react";

/**
 * A component to display a weather value with its unit, handling metric/imperial conversion.
 * @param {object} props - The props for the component.
 * @param {string} props.label - The label for the value (e.g., "Humidity").
 * @param {number | null | undefined} props.value - The raw value (always in metric).
 * @param {string} props.metricUnit - The unit for metric display (e.g., "%", "km/h").
 * @param {string} props.imperialUnit - The unit for imperial display (e.g., "%", "mph").
 * @param {function} [props.convertFn] - The function to convert the value to imperial.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @param {number} [props.precision=2] - The number of decimal places to show.
 * @returns {JSX.Element} - The rendered component.
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
  if (value === null || typeof value === "undefined") {
    return (
      <p>
        <strong>{label}:</strong> N/A
      </p>
    );
  }

  const displayValue = isMetric || !convertFn ? value : convertFn(value);
  const displayUnit = isMetric ? metricUnit : imperialUnit;

  return (
    <p>
      <strong>{label}:</strong> {displayValue.toFixed(precision)} {displayUnit}
    </p>
  );
}

export default WeatherValue;
