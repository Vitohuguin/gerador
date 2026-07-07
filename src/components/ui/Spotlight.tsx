import { useEffect, useRef, useState } from 'react';

interface SpotlightProps {
  className?: string;
  size?: number;
  opacity?: number;
  color?: string;
}

export default function Spotlight({
  className = '',
  size = 600,
  opacity = 0.15,
  color = 'rgba(168,85,247,0.8)',
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    el.addEventListener('mousemove', onMouse);
    return () => el.removeEventListener('mousemove', onMouse);
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      <div
        className="absolute transition-[left,top] duration-200 ease-out rounded-full"
        style={{
          width: size,
          height: size,
          left: pos.x - size / 2,
          top: pos.y - size / 2,
          background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
          opacity,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
