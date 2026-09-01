import { motion, useReducedMotion } from 'motion/react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  once?: boolean;
  className?: string;
  y?: number;
  x?: number;
  scale?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

const easePremium = [0.32, 0.72, 0, 1] as const;

export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.7,
  once = true,
  className = '',
  y = 24,
  x = 0,
  scale = 1,
  as,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = as ? (motion as any)[as] : motion.div;

  if (prefersReducedMotion) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration, delay, ease: easePremium }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.08,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = '',
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easePremium } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
