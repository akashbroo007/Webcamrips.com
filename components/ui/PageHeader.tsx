import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

const PageHeader = ({ title, description, icon, action }: PageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
          {icon}
          {title}
        </h1>
        {description && (
          <p className="text-gray-400">{description}</p>
        )}
      </div>
      {action && (
        <div className="mt-4 md:mt-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader; 