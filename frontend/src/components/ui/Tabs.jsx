import React, { useState } from 'react';

const Tabs = ({ defaultTab, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === TabPane) {
              const isActive = child.props.tabId === activeTab;
              return (
                <button
                  onClick={() => handleTabClick(child.props.tabId)}
                  className={`${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors duration-200`}
                >
                  {child.props.label}
                </button>
              );
            }
            return null;
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === TabPane) {
            return child.props.tabId === activeTab ? (
              <div key={child.props.tabId}>{child.props.children}</div>
            ) : null;
          }
          return null;
        })}
      </div>
    </div>
  );
};

const TabPane = ({ tabId, label, children }) => {
  return <div>{children}</div>;
};

Tabs.TabPane = TabPane;

export default Tabs;