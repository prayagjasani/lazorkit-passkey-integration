"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FeatureHighlightProps {
  /** Whether to show the highlight */
  show: boolean;
  /** Target element selector */
  targetSelector: string;
  /** Title of the feature */
  title: string;
  /** Description of the feature */
  description: string;
  /** Position of the tooltip relative to target */
  position?: "top" | "bottom" | "left" | "right";
}

/**
 * Feature highlight overlay component
 * 
 * Highlights a specific UI element with a tooltip explaining its purpose.
 * Used in the getting started wizard to guide users through features.
 */
export function FeatureHighlight({
  show,
  targetSelector,
  title,
  description,
  position = "bottom",
}: FeatureHighlightProps) {
  if (!show) return null;

  // This is a simplified version - in a real implementation,
  // you'd calculate the position based on the target element's bounding box
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Tooltip - positioned dynamically based on target */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bg-white rounded-lg shadow-2xl p-4 max-w-xs pointer-events-auto"
            style={{
              // Position would be calculated based on target element
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <h3 className="font-semibold text-black mb-1">{title}</h3>
            <p className="text-sm text-[#8e8e93]">{description}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

