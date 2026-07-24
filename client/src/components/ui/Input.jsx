import React from 'react';

const baseFieldStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border)',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontSize: 14.5,
  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
  outline: 'none',
};

function focusHandlers(props = {}) {
  return {
    onFocus: (e) => {
      e.target.style.borderColor = 'var(--primary)';
      e.target.style.boxShadow = '0 0 0 3px rgba(63, 163, 77, 0.15)';
      props.onFocus?.(e);
    },
    onBlur: (e) => {
      e.target.style.borderColor = 'var(--border)';
      e.target.style.boxShadow = 'none';
      props.onBlur?.(e);
    },
  };
}

export function Label({ children, htmlFor, required }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, display: 'block' }}
    >
      {children}
      {required && <span style={{ color: 'var(--error)' }}> *</span>}
    </label>
  );
}

export const Input = React.forwardRef(function Input({ style = {}, ...props }, ref) {
  return (
    <input ref={ref} style={{ ...baseFieldStyle, ...style }} {...focusHandlers(props)} {...props} />
  );
});

export const Textarea = React.forwardRef(function Textarea({ style = {}, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      style={{ ...baseFieldStyle, resize: 'vertical', minHeight: 90, ...style }}
      {...focusHandlers(props)}
      {...props}
    />
  );
});

export const Select = React.forwardRef(function Select({ style = {}, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      style={{ ...baseFieldStyle, cursor: 'pointer', ...style }}
      {...focusHandlers(props)}
      {...props}
    >
      {children}
    </select>
  );
});

export function FormField({ label, htmlFor, required, error, children, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 5 }}>{hint}</p>
      )}
      {error && <p style={{ fontSize: 12.5, color: 'var(--error)', marginTop: 5 }}>{error}</p>}
    </div>
  );
}

export default Input;
