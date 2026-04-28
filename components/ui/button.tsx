import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const baseClasses = 'cursor-pointer font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-950';

const variantClasses = {
  primary: 'bg-brand text-brand-foreground hover:bg-brand-hover focus:ring-brand',
  secondary: 'bg-secondary text-secondary-foreground hover:opacity-90 focus:ring-ring',
  outline: 'border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-brand',
  ghost: 'text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-ring',
} as const;

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
} as const;

export function getButtonClasses(
  variant: NonNullable<ButtonProps['variant']> = 'primary',
  size: NonNullable<ButtonProps['size']> = 'md',
  className = ''
) {
  return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClasses(variant, size, className)}
      {...props}
    >
      {children}
    </button>
  );
}

