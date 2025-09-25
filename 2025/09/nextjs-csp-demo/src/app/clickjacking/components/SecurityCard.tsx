import React from 'react';

interface SecurityCardProps {
  type: 'protection' | 'vulnerability';
  title: string;
  children: React.ReactNode;
}

export default function SecurityCard({ type, title, children }: SecurityCardProps) {
  const isProtection = type === 'protection';
  
  const cardColors = {
    protection: 'bg-green-50 border-green-200',
    vulnerability: 'bg-red-50 border-red-200'
  };
  
  const titleColors = {
    protection: 'text-green-800',
    vulnerability: 'text-red-800'
  };
  
  const textColors = {
    protection: 'text-green-700',
    vulnerability: 'text-red-700'
  };

  return (
    <div className={`${cardColors[type]} border rounded-lg p-4`}>
      <h3 className={`font-semibold ${titleColors[type]} mb-2`}>
        {isProtection ? '🛡️' : '⚠️'} {title}
      </h3>
      <div className={textColors[type]}>
        {children}
      </div>
    </div>
  );
}
