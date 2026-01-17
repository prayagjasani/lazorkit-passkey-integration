"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExplanationCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Reusable explanation card with collapsible content
 */
export function ExplanationCard({
  title,
  children,
  defaultOpen = false,
}: ExplanationCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="bg-white">
      <CardHeader>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold">{title}</h3>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-[#8e8e93]" />
          ) : (
            <ChevronDown className="h-5 w-5 text-[#8e8e93]" />
          )}
        </button>
      </CardHeader>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

