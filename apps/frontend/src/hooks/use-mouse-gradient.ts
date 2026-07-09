'use client';

import { useRef, useState, useCallback } from 'react';

export function useMouseGradient() {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--mouse-x', `${x}%`);
    el.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setIsHovered(false);
    el.style.setProperty('--mouse-x', '50%');
    el.style.setProperty('--mouse-y', '50%');
  }, []);

  return { ref, isHovered, handleMouseEnter, handleMouseMove, handleMouseLeave };
}
