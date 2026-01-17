"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7454f7]/30 disabled:opacity-50 disabled:pointer-events-none gap-2",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-gray-50 border border-gray-200",
        primary:
          "bg-[#7454f7] text-white font-semibold hover:bg-[#5d3dd9] active:bg-[#4a2fc4] shadow-sm",
        secondary:
          "bg-[#f2f2f7] text-black hover:bg-[#e5e5ea] border border-[#c6c6c8]",
        outline:
          "border border-[#c6c6c8] bg-transparent hover:bg-[#f2f2f7] text-black",
        ghost:
          "bg-transparent hover:bg-[#f2f2f7] text-[#8e8e93] hover:text-black",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 border border-red-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
