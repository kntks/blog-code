import React from 'react';

interface DisplayContentProps {
  content: string;
  isSecure: boolean;
}

export default function DisplayContent({ content, isSecure }: DisplayContentProps) {
  if (!content) return null;

  const borderColor = isSecure ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50';
  const titleColor = isSecure ? 'text-green-800' : 'text-red-800';

  return (
    <div className={`border ${borderColor} rounded-lg p-6`}>
      <h3 className={`text-lg font-semibold mb-4 ${titleColor}`}>投稿されたコンテンツ：</h3>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
