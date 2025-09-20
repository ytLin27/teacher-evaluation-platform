import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'default',
  hover = false,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-gray-200';

  const paddings = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const hoverEffect = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  const classes = `${baseClasses} ${paddings[padding]} ${shadows[shadow]} ${hoverEffect} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', level = 'h3', ...props }) => {
  const classes = `font-semibold text-gray-900 ${className}`;

  const levels = {
    h1: 'text-2xl',
    h2: 'text-xl',
    h3: 'text-lg',
    h4: 'text-base',
    h5: 'text-sm'
  };

  const Component = level;

  return (
    <Component className={`${classes} ${levels[level]}`} {...props}>
      {children}
    </Component>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`text-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;