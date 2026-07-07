import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AuroraBackgroundProps {
  className?: string;
}

export default function AuroraBackground({ className = '' }: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      container.style.setProperty('--mouse-x', String(x));
      container.style.setProperty('--mouse-y', String(y));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute -top-1/4 -left-1/4 w-[120%] h-[120%] opacity-60"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(168,85,247,0.25), transparent 60%)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute -top-1/4 -right-1/4 w-[120%] h-[120%] opacity-50"
        style={{
          background: 'radial-gradient(ellipse 50% 60% at 70% 30%, rgba(217,70,239,0.2), transparent 60%)',
        }}
      />
      <motion.div
        animate={{
          x: [0, 20, -40, 0],
          y: [0, -20, 40, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute -bottom-1/4 left-1/4 w-[100%] h-[100%] opacity-40"
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 80%, rgba(124,58,237,0.2), transparent 60%)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 30, -10, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute top-1/3 -left-1/4 w-[80%] h-[80%] opacity-30"
        style={{
          background: 'radial-gradient(ellipse 40% 50% at 40% 50%, rgba(236,72,153,0.15), transparent 60%)',
        }}
      />
      <motion.div
        animate={{
          x: [0, 25, -15, 0],
          y: [0, -25, 15, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute top-1/2 -right-1/4 w-[70%] h-[70%] opacity-25"
        style={{
          background: 'radial-gradient(ellipse 50% 40% at 60% 50%, rgba(168,85,247,0.2), transparent 60%)',
        }}
      />
    </div>
  );
}
