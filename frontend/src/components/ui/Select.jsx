import React from 'react';

const Select = React.forwardRef(({
  label,
  error,
  helper,
  options = [],
  placeholder,
  className = '',
  size = 'md',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const baseClasses = 'block w-full rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

  const selectClasses = `${baseClasses} ${sizes[size]} ${errorClasses} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={selectClasses}
        disabled={disabled}
        required={required}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;