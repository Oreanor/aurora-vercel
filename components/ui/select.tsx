import { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  
  const baseClasses = 'w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50 [color-scheme:light] dark:[color-scheme:dark]';
  
  const selectClasses = error
    ? `${baseClasses} border-destructive focus:ring-destructive`
    : baseClasses;
  
  if (label) {
    return (
      <div>
        {label && (
          <label htmlFor={selectId} className="mb-1 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <select
          id={selectId}
          className={`${selectClasses} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-popover text-popover-foreground">
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
  
  return (
    <select
      id={selectId}
      className={`${selectClasses} ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-popover text-popover-foreground">
          {option.label}
        </option>
      ))}
    </select>
  );
}

