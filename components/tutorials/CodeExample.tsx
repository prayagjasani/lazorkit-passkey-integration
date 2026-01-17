"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

interface CodeExampleProps {
  /** Code to display */
  code: string;
  /** Language for syntax highlighting */
  language?: string;
  /** Title for the code block */
  title?: string;
  /** Whether to show copy button */
  showCopy?: boolean;
}

/**
 * Code example display component with copy functionality
 */
export function CodeExample({
  code,
  language = "typescript",
  title,
  showCopy = true,
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-black">{title}</p>
          {showCopy && (
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      )}
      <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

