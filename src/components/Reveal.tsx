import React from 'react';
import { m, useReducedMotion } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
}

/**
 * Restrained Swiss editorial scroll reveal (16px vertical glide, smooth ease-out-expo).
 * Uses `m` from motion/react with LazyMotion (domAnimation) for minimal bundle impact.
 * Respects prefers-reduced-motion and triggers once so scrolling never feels repetitive.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  duration = 0.54,
  className = '',
}: RevealProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </m.div>
  );
}
