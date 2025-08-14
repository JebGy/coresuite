import React from 'react';

interface NavigationSectionProps {
  title: string;
  description: string;
  href: string;
  linkText: string;
  icon?: React.ReactNode;
}

export const NavigationSection: React.FC<NavigationSectionProps> = ({
  title,
  description,
  href,
  linkText,
  icon
}) => {
  return (
    <div className="space-y-6 col-span-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {title}
            </h1>
            <p className="text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300">
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">
            Accede al módulo completo para gestionar esta sección
          </p>
          <a
            href={href}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {linkText}
          </a>
        </div>
      </div>
    </div>
  );
};