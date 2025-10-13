import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  start: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  end: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const circleVariants = {
  start: {
    y: '0%',
  },
  end: {
    y: '100%',
  },
};

const transition = {
  duration: 0.5,
  repeat: Infinity,
  repeatType: "reverse" as const,
  ease: 'easeInOut',
};

const LoadingSpinner: React.FC = () => {
  return (
    <motion.div
      className="flex justify-around items-center w-12 h-6"
      variants={containerVariants}
      initial="start"
      animate="end"
    >
      <motion.span
        className="block w-3 h-3 bg-healthcare-600 rounded-full"
        variants={circleVariants}
        transition={transition}
      />
      <motion.span
        className="block w-3 h-3 bg-healthcare-600 rounded-full"
        variants={circleVariants}
        transition={transition}
      />
      <motion.span
        className="block w-3 h-3 bg-healthcare-600 rounded-full"
        variants={circleVariants}
        transition={transition}
      />
    </motion.div>
  );
};

export default LoadingSpinner;


