import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'right' | 'left' | 'down';
}

const getInitial = (direction: RevealProps['direction']) => {
  switch (direction) {
    case 'up':
      return { opacity: 0, y: 24 };
    case 'down':
      return { opacity: 0, y: -24 };
    case 'right':
      return { opacity: 0, x: -24 };
    case 'left':
      return { opacity: 0, x: 24 };
    default:
      return { opacity: 0, y: 24 };
  }
};

const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className, direction = 'up' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitial(direction)}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;
