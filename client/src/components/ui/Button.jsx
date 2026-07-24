import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'var(--card)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: 'var(--error)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--primary)',
    border: '1.5px solid var(--primary)',
  },
};

const SIZES = {
  sm: { padding: '7px 14px', fontSize: 13, borderRadius: 'var(--radius-sm)' },
  md: { padding: '11px 20px', fontSize: 14.5, borderRadius: 'var(--radius-md)' },
  lg: { padding: '14px 28px', fontSize: 16, borderRadius: 'var(--radius-md)' },
};

const Button = React.forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon: Icon,
    iconRight: IconRight,
    fullWidth = false,
    type = 'button',
    className = '',
    style = {},
    ...rest
  },
  ref
) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const sizeStyle = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15 }}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontWeight: 600,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : undefined,
        whiteSpace: 'nowrap',
        transition: 'box-shadow var(--transition-fast), opacity var(--transition-fast)',
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
      {!loading && IconRight && <IconRight size={16} />}
    </motion.button>
  );
});

export default Button;
