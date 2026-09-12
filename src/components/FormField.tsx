import React, { useId } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle } from 'lucide-react';

interface FormFieldProps {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  success?: boolean;
  children: (props: {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby'?: string;
    className: string;
  }) => React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  hint,
  required,
  success,
  children,
}) => {
  const generatedId = useId();
  const inputId = `field-${generatedId}`;
  const errorId = `error-${generatedId}`;
  const hintId = `hint-${generatedId}`;

  const baseInputClassName = `w-full px-4 py-2.5 rounded-xl bg-slate-900 border text-slate-100 text-sm font-medium transition-all duration-200 outline-none placeholder:text-slate-500 ${
    error
      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-950/10'
      : success
      ? 'border-emerald-500/80 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 bg-emerald-950/10'
      : 'border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
  }`;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-slate-300 flex items-center gap-1"
        >
          <span>{label}</span>
          {required && <span className="text-rose-400" aria-hidden="true">*</span>}
        </label>
        {hint && (
          <span id={hintId} className="text-[11px] text-slate-400 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-500" />
            <span>{hint}</span>
          </span>
        )}
      </div>

      <div className="relative">
        {children({
          id: inputId,
          'aria-invalid': Boolean(error),
          'aria-describedby': error ? errorId : hint ? hintId : undefined,
          className: baseInputClassName,
        })}

        {/* State Icon Indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {error && (
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-shake" aria-hidden="true" />
          )}
          {!error && success && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Inline Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs font-medium text-rose-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn"
        >
          <span className="w-1 h-1 rounded-full bg-rose-400 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
