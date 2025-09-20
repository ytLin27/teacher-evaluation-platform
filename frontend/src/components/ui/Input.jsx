import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  helper,
  icon,
  className = '',
  type = 'text',
  size = 'md',
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const baseClasses = 'block w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
  const iconPadding = icon ? 'pl-10' : '';

  const inputClasses = `${baseClasses} ${sizes[size]} ${errorClasses} ${iconPadding} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          disabled={disabled}
          required={required}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helper && !error && (
        <p className="text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;