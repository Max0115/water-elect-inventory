import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-gray-500/50">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-200 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-400 max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-xl hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
