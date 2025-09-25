import React from 'react';

interface InfoCardProps {
  type: 'info' | 'warning' | 'tip' | 'config';
  title: string;
  children: React.ReactNode;
}

export default function InfoCard({ type, title, children }: InfoCardProps) {
  const cardStyles = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-orange-50 border-orange-200',
    tip: 'bg-blue-50 border-blue-200',
    config: 'bg-purple-50 border-purple-200'
  };
  
  const titleStyles = {
    info: 'text-blue-800',
    warning: 'text-orange-800',
    tip: 'text-blue-800',
    config: 'text-purple-800'
  };
  
  const textStyles = {
    info: 'text-blue-700',
    warning: 'text-orange-700',
    tip: 'text-blue-700',
    config: 'text-purple-700'
  };
  
  const icons = {
    info: '🔍',
    warning: '🎯',
    tip: '💡',
    config: '🔧'
  };

  return (
    <div className={`${cardStyles[type]} border rounded-lg p-4`}>
      <h3 className={`font-semibold ${titleStyles[type]} mb-2`}>
        {icons[type]} {title}
      </h3>
      <div className={textStyles[type]}>
        {children}
      </div>
    </div>
  );
}
