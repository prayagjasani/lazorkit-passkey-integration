import React from "react";
import { cn } from "./utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#c6c6c8] bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
export function CardHeader({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("p-6 border-b border-[#e5e5ea]", className)}>
      {children}
    </div>
  );
}
export function CardContent({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}
export function CardFooter({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("p-6 border-t border-[#e5e5ea]", className)}>
      {children}
    </div>
  );
}
