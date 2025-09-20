import React from 'react';
import { Button } from './Button';

const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionText,
  onAction,
  className = ''
}) => {
  const defaultIcon = (
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="flex justify-center mb-4">
        {icon || defaultIcon}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || 'No data available'}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}

      {(action || onAction) && (
        <div className="flex justify-center">
          {action || (
            <Button
              variant="primary"
              onClick={onAction}
            >
              {actionText || 'Get Started'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// 预定义的空状态组件变体
export const EmptyDocuments = ({ onUpload }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    }
    title="No documents uploaded"
    description="Upload your first document to get started with organizing your files"
    actionText="Upload Document"
    onAction={onUpload}
  />
);

export const EmptyReports = ({ onGenerate }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    }
    title="No reports generated"
    description="Generate your first performance report to track your academic progress"
    actionText="Generate Report"
    onAction={onGenerate}
  />
);

export const EmptyResearch = ({ onAdd }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    }
    title="No research records"
    description="Add your publications, grants, and research projects to showcase your academic work"
    actionText="Add Research"
    onAction={onAdd}
  />
);

export const EmptyService = ({ onAdd }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    }
    title="No service records"
    description="Track your committee work, peer reviews, and community service contributions"
    actionText="Add Service"
    onAction={onAdd}
  />
);

export const EmptySearch = ({ searchTerm, onClear }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No results found"
    description={`No items match your search "${searchTerm}". Try adjusting your search terms or filters.`}
    actionText="Clear Search"
    onAction={onClear}
  />
);

export const EmptyData = ({ type = 'items', onRefresh }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    }
    title={`No ${type} available`}
    description={`There are currently no ${type} to display. They may be added later.`}
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const LoadingError = ({ error, onRetry }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Loading Error"
    description={error || "Failed to load data. Please check your connection and try again."}
    actionText="Retry"
    onAction={onRetry}
  />
);

export const UploadError = ({ error, onRetry }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    }
    title="Upload Failed"
    description={error || "There was a problem uploading your file. Please check the file format and size, then try again."}
    actionText="Try Again"
    onAction={onRetry}
  />
);

export const NetworkError = ({ onRetry, onRefresh }) => (
  <EmptyState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    }
    title="Connection Problem"
    description="Unable to connect to the server. Please check your internet connection and try again."
    actionText="Retry"
    onAction={onRetry || onRefresh}
  />
);

export default EmptyState;