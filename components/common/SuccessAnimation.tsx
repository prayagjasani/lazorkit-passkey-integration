"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface SuccessAnimationProps {
  /** Whether to show the animation */
  show: boolean;
  /** Message to display */
  message?: string;
  /** Callback when animation completes */
  onComplete?: () => void;
}

/**
 * Success animation component for completed transactions
 *
 * Uses framer-motion for smooth animations. Displays a checkmark
 * with optional message when a transaction succeeds.
 *
 * @example
 * ```tsx
 * <SuccessAnimation
 *   show={transactionSuccess}
 *   message="Transaction completed!"
 *   onComplete={() => setTransactionSuccess(false)}
 * />
 * ```
 */
export function SuccessAnimation({
  show,
  message = "Success!",
  onComplete,
}: SuccessAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[200px]"
            onAnimationComplete={() => {
              setTimeout(() => {
                onComplete?.();
              }, 2000);
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
            >
              <CheckCircle2 className="h-16 w-16 text-[#7454f7]" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-semibold text-black"
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

