import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  style = {},
  as: Component = motion.div,
  hover = false,
  glass = false,
  padding = 22,
  animate = true,
  ...rest
}) {
  const MotionTag = Component === motion.div ? motion.div : Component;
  const baseStyle = {
    background: glass ? 'var(--glass-bg)' : 'var(--card)',
    border: `1px solid ${glass ? 'var(--glass-border)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-lg)',
    padding,
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base)',
    ...(glass
      ? { backdropFilter: 'blur(16px) saturate(140%)', WebkitBackdropFilter: 'blur(16px) saturate(140%)' }
      : {}),
    ...style,
  };

  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        whileHover: hover
          ? { y: -5, boxShadow: 'var(--shadow-md)', borderColor: 'rgba(63,163,77,0.35)' }
          : undefined,
      }
    : {};

  return (
    <MotionTag className={className} style={baseStyle} {...motionProps} {...rest}>
      {children}
    </MotionTag>
  );
}
