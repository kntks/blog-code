interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success' | 'purple';
  className?: string;
}

export default function InfoCard({
  title,
  children,
  variant = 'info',
  className = ''
}: InfoCardProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
    success: 'bg-green-50 border-green-200',
    purple: 'bg-purple-50 border-purple-200'
  };

  const titleStyles = {
    info: 'text-blue-800',
    warning: 'text-yellow-800',
    error: 'text-red-800',
    success: 'text-green-800',
    purple: 'text-purple-800'
  };

  const contentStyles = {
    info: 'text-blue-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    success: 'text-green-700',
    purple: 'text-purple-700'
  };

  return (
    <div className={`${variantStyles[variant]} border rounded-lg p-4 ${className}`}>
      <h3 className={`font-semibold ${titleStyles[variant]} mb-2`}>{title}</h3>
      <div className={contentStyles[variant]}>
        {children}
      </div>
    </div>
  );
}
