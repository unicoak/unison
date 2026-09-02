import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

const fieldClass =
  "w-full rounded-xl border-2 border-ink bg-white px-4 py-3 font-body text-ink placeholder:text-ink-soft/60 outline-none transition focus:-translate-y-0.5 focus:shadow-hard-sm";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block font-display text-sm font-semibold tracking-wide">
      {children}
    </label>
  );
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm font-medium text-coral">{children}</p>;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input ref={ref} className={`${fieldClass} ${className}`} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea ref={ref} className={`${fieldClass} min-h-32 resize-y ${className}`} {...props} />
  ),
);
Textarea.displayName = "Textarea";
