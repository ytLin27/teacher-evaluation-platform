import React from 'react';

const Progress = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = false,
  label,
  className = '',
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const colors = {
    primary: 'bg-purple-600',
    secondary: 'bg-indigo-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || `Progress`}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
        <div
          className={`${colors[color]} ${sizes[size]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Progress;