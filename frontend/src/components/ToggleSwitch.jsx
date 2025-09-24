import React from "react";

/**
 * A toggle switch component to switch between metric and imperial units.
 * @param {object} props - The props for the component.
 * @param {boolean} props.isMetric - Boolean to determine if the units are metric.
 * @param {function} props.onToggle - Function to handle the unit toggle.
 * @returns {JSX.Element} - The rendered component.
 */
function ToggleSwitch({ isMetric, onToggle }) {
  /**
   * Handles the toggle switch change.
   */
  const handleToggle = () => {
    onToggle(!isMetric);
  };

  return (
    <div className="flex items-center">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          onChange={handleToggle}
          checked={isMetric}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
      <span className="ml-3 text-sm font-medium text-blue-600 dark:text-blue-400">
        {isMetric ? "Metric" : "Imperial"}
      </span>
    </div>
  );
}

export default ToggleSwitch;
