import Image from "next/image";

interface LogoProps {
  /** Size of the logo in pixels */
  size?: number;
  /** Whether to show the text alongside the logo */
  showText?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function Logo({
  size = 32,
  showText = false,
  className = "",
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image
        src="/images/logo.svg"
        alt="LazorKey Logo"
        width={size}
        height={size}
        className="rounded-xl"
        priority
      />
      {showText && (
        <span className="text-xl font-semibold text-black tracking-tight">
          LazorKey
        </span>
      )}
    </div>
  );
}
