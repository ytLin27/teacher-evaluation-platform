import React from 'react';

const SortableTableHeader = ({
  children,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
  className = ""
}) => {
  const handleClick = () => {
    if (onSort) {
      const newOrder = currentSort === sortKey && currentOrder === 'asc' ? 'desc' : 'asc';
      onSort(sortKey, newOrder);
    }
  };

  const getSortIcon = () => {
    if (currentSort !== sortKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (currentOrder === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 ml-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <span>{children}</span>
        {onSort && getSortIcon()}
      </div>
    </th>
  );
};

export default SortableTableHeader;