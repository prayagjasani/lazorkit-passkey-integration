"use client";

import { Card, CardContent } from "@/components/ui/card";

interface FlowStep {
  title: string;
  description: string;
}

interface FlowDiagramProps {
  steps: FlowStep[];
  title: string;
}

/**
 * Visual flow diagram component showing step-by-step processes
 */
export function FlowDiagram({ steps, title }: FlowDiagramProps) {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-6">{title}</h3>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#7454f7] text-white flex items-center justify-center font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-[#e5e5ea] my-2" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <h4 className="font-medium text-black mb-1">{step.title}</h4>
                <p className="text-sm text-[#8e8e93]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

