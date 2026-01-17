"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface TutorialCardProps {
  /** Tutorial title */
  title: string;
  /** Tutorial description */
  description: string;
  /** Estimated time to complete */
  duration: string;
  /** Difficulty level */
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  /** Link to tutorial */
  href: string;
  /** Whether tutorial is completed */
  completed?: boolean;
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Individual tutorial card component
 */
export function TutorialCard({
  title,
  description,
  duration,
  difficulty,
  href,
  completed = false,
  onClick,
}: TutorialCardProps) {
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-amber-100 text-amber-800",
    Advanced: "bg-red-100 text-red-800",
  };

  return (
    <Card className={`bg-white hover:shadow-lg transition-shadow ${completed ? "border-2 border-green-500" : ""}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              {completed && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>
              )}
            </div>
            <p className="text-sm text-[#8e8e93] mb-3">{description}</p>
            <div className="flex items-center gap-4 text-xs text-[#8e8e93]">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {duration}
              </div>
              <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {onClick ? (
          <Button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2"
          >
            Start Tutorial
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Link href={href}>
            <Button className="w-full flex items-center justify-center gap-2">
              Start Tutorial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

