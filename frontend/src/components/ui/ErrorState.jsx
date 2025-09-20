import React from 'react';
import { Button } from './Button';

const ErrorState = ({
  icon,
  title,
  description,
  error,
  showErrorDetails = false,
  action,
  actionText,
  onAction,
  onRetry,
  className = ''
}) => {
  const defaultIcon = (
    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );

  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <div className="flex justify-center mb-4">
        {icon || defaultIcon}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || 'Something went wrong'}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}

      {showErrorDetails && error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left max-w-lg mx-auto">
          <h4 className="text-sm font-medium text-red-800 mb-2">Error Details:</h4>
          <pre className="text-xs text-red-700 whitespace-pre-wrap break-words">
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-center space-x-3">
        {onRetry && (
          <Button
            variant="outline"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}

        {(action || onAction) && (
          action || (
            <Button
              variant="primary"
              onClick={onAction}
            >
              {actionText || 'Go Back'}
            </Button>
          )
        )}
      </div>
    </div>
  );
};

// 预定义的错误状态组件变体
export const NetworkError = ({ onRetry, onRefresh }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    }
    title="Connection Problem"
    description="Unable to connect to the server. Please check your internet connection and try again."
    onRetry={onRetry || onRefresh}
  />
);

export const LoadingError = ({ onRetry, error }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Failed to Load Data"
    description="There was a problem loading the requested information."
    error={error}
    onRetry={onRetry}
  />
);

export const AuthenticationError = ({ onLogin }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    }
    title="Authentication Required"
    description="You need to sign in to access this content."
    actionText="Sign In"
    onAction={onLogin}
  />
);

export const NotFoundError = ({ onGoHome, onGoBack }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Page Not Found"
    description="The page you're looking for doesn't exist or has been moved."
    action={
      <div className="space-x-3">
        {onGoBack && (
          <Button variant="outline" onClick={onGoBack}>
            Go Back
          </Button>
        )}
        <Button variant="primary" onClick={onGoHome}>
          Go Home
        </Button>
      </div>
    }
  />
);

export const PermissionError = ({ onGoBack }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636A9 9 0 015.636 18.364m12.728 0L5.636 5.636" />
      </svg>
    }
    title="Access Denied"
    description="You don't have permission to access this resource."
    actionText="Go Back"
    onAction={onGoBack}
  />
);

export const ServerError = ({ onRetry, onReportIssue }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    }
    title="Server Error"
    description="Our servers are experiencing issues. Please try again later or report this problem."
    action={
      <div className="space-x-3">
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
        {onReportIssue && (
          <Button variant="primary" onClick={onReportIssue}>
            Report Issue
          </Button>
        )}
      </div>
    }
  />
);

export const UploadError = ({ onRetry, error }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    }
    title="Upload Failed"
    description="There was a problem uploading your file. Please check the file format and size, then try again."
    error={error}
    showErrorDetails={true}
    onRetry={onRetry}
  />
);

export const TimeoutError = ({ onRetry }) => (
  <ErrorState
    icon={
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="Request Timeout"
    description="The request took too long to complete. Please try again."
    onRetry={onRetry}
  />
);

export default ErrorState;