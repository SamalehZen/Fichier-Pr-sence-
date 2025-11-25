import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-card shadow-soft-md p-6 animate-pulse">
      <div className="h-4 bg-cream-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-cream-200 rounded"></div>
        <div className="h-3 bg-cream-200 rounded w-5/6"></div>
      </div>
    </div>
  );
};
