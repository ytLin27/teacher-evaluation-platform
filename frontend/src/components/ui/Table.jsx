import React from 'react';

const Table = ({
  children,
  className = '',
  striped = false,
  ...props
}) => {
  const baseClasses = 'min-w-full divide-y divide-gray-200';
  const classes = `${baseClasses} ${className}`;

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className={classes} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHead = ({ children, className = '', ...props }) => {
  return (
    <thead className={`bg-gray-50 ${className}`} {...props}>
      {children}
    </thead>
  );
};

const TableBody = ({ children, className = '', striped = false, ...props }) => {
  const stripedClasses = striped ? 'divide-y divide-gray-200' : 'divide-y divide-gray-200';
  return (
    <tbody className={`bg-white ${stripedClasses} ${className}`} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({ children, className = '', striped = false, index, ...props }) => {
  const stripedBg = striped && index % 2 === 1 ? 'bg-gray-50' : '';
  return (
    <tr className={`hover:bg-gray-50 ${stripedBg} ${className}`} {...props}>
      {children}
    </tr>
  );
};

const TableHeader = ({ children, className = '', sortable = false, sortDirection, onSort, ...props }) => {
  const baseClasses = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
  const sortableClasses = sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : '';
  const classes = `${baseClasses} ${sortableClasses} ${className}`;

  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  return (
    <th className={classes} onClick={handleClick} {...props}>
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <div className="flex flex-col">
            <svg
              className={`w-3 h-3 ${sortDirection === 'asc' ? 'text-purple-600' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <svg
              className={`w-3 h-3 -mt-1 ${sortDirection === 'desc' ? 'text-purple-600' : 'text-gray-400'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </th>
  );
};

const TableCell = ({ children, className = '', align = 'left', ...props }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  const classes = `px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${alignClasses[align]} ${className}`;

  return (
    <td className={classes} {...props}>
      {children}
    </td>
  );
};

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;