"use client";

import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  label: string;
  progress: number;
}

export function ProgressBar({ label, progress }: ProgressBarProps) {
  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-lg font-bold text-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

