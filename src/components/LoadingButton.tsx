import React from 'react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  icon,
  children,
  disabled,
  className = '',
  variant = 'primary',
  ...rest
}) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-400/30 shadow-lg shadow-indigo-600/25',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md',
    outline: 'bg-transparent hover:bg-slate-800/60 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-400/40 shadow-lg shadow-rose-600/25',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/40 shadow-lg shadow-emerald-600/25',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      aria-busy={loading}
      className={`relative inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.98] ${
        variantStyles[variant]
      } ${
        isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <svg 
            className="w-4 h-4 animate-spin text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4" 
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
            />
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
