import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  
  const baseClasses = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50';
  
  const inputClasses = error
    ? `${baseClasses} border-red-300 focus:ring-red-400`
    : baseClasses;
  
  if (label) {
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={`${inputClasses} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
  
  return (
    <input
      id={inputId}
      className={`${inputClasses} ${className}`}
      {...props}
    />
  );
}

