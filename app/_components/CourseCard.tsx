"use client";

import { PlayCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface CourseCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  level: "Básico" | "Intermediário" | "Avançado";
  lessonsCount: number;
  duration: number;
  onClick?: () => void;
}

export function CourseCard({
  imageUrl = "",
  title = "",
  description = "",
  level = "Básico",
  lessonsCount = 0,
  duration = 0,
  onClick = () => {},
}: CourseCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary group relative overflow-hidden"
    >
      {/* Placeholder Image */}
      <div className="w-full h-48 `bg-gradient-to-br` from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} width={300} height={200} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle size={64} className="text-primary/30" />
        </div>
        )}
      </div>
      
      <CardHeader className="space-y-3">
        <Badge className="self-start" variant="default">
          {level}
        </Badge>
        <div>
          <CardTitle className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <PlayCircle size={16} />
            <span>{lessonsCount} aulas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={16} />
            <span>{duration} horas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

