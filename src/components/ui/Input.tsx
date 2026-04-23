import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const descriptionId = inputId ? `${inputId}-description` : undefined;
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700" htmlFor={inputId}>
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-describedby={descriptionId}
        aria-invalid={hasError}
        className={[
          'rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
          'transition-colors outline-none',
          'focus:border-garden-500 focus:ring-2 focus:ring-garden-500/20',
          hasError
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-gray-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {(error ?? helperText) && (
        <p
          id={descriptionId}
          className={[
            'text-xs',
            hasError ? 'text-red-600' : 'text-gray-500',
          ].join(' ')}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
