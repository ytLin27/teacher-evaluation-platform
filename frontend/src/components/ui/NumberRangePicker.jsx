import React from 'react';

const NumberRangePicker = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  className = "",
  label = "Range",
  placeholder = { min: "Min", max: "Max" },
  step = 1,
  min = 0,
  max
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={minValue}
          onChange={(e) => onMinChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder.min}
          step={step}
          min={min}
          max={max}
        />
        <span className="text-gray-500 text-sm">to</span>
        <input
          type="number"
          value={maxValue}
          onChange={(e) => onMaxChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder={placeholder.max}
          step={step}
          min={min}
          max={max}
        />
      </div>
    </div>
  );
};

export default NumberRangePicker;