import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function AnimatedCard({ children, className = '', onClick }: AnimatedCardProps) {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: 'spring',
        stiffness: 300,
        damping: 20
      }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
