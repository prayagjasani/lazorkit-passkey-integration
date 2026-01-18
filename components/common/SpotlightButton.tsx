"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, ReactNode } from "react";

interface SpotlightButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * SpotlightButton Component
 * 
 * A button with a spotlight effect that follows the mouse cursor
 */
export function SpotlightButton({
  onClick,
  disabled = false,
  children,
  className = "",
}: SpotlightButtonProps) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (disabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const { width } = target?.getBoundingClientRect() ?? { width: 0 };
      const offset = e.offsetX;
      const left = `${(offset / width) * 100}%`;

      if (spanRef.current) {
        spanRef.current.animate({ left }, { duration: 250, fill: "forwards" });
      }
    };

    const handleMouseLeave = () => {
      if (spanRef.current) {
        spanRef.current.animate(
          { left: "50%" },
          { duration: 100, fill: "forwards" }
        );
      }
    };

    const btn = btnRef.current;
    if (btn) {
      btn.addEventListener("mousemove", handleMouseMove);
      btn.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      if (btn) {
        btn.removeEventListener("mousemove", handleMouseMove);
        btn.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [disabled]);

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.985 }}
      ref={btnRef}
      onClick={onClick}
      disabled={disabled}
      className={`relative w-full overflow-hidden rounded-lg bg-[#7454f7] px-4 py-3 text-base font-semibold text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <span className="pointer-events-none relative z-10 mix-blend-difference">
        {children}
      </span>
      {!disabled && (
        <span
          ref={spanRef}
          className="pointer-events-none absolute left-[50%] top-[50%] h-32 w-32 -translate-x-[50%] -translate-y-[50%] rounded-full bg-white"
        />
      )}
    </motion.button>
  );
}
