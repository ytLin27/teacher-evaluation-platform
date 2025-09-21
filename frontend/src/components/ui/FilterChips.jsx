import React from 'react';
import { X } from 'lucide-react';

const FilterChips = ({
  filters = [],
  onRemove,
  onClearAll,
  className = ""
}) => {
  if (filters.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600">Active filters:</span>
      {filters.map((filter, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemove(filter)}
            className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X size={12} />
          </button>
        </div>
      ))}
      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default FilterChips;