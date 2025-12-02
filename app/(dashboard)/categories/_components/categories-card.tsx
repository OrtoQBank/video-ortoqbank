"use client";

import { PlayCircle } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

interface CategoriesCardProps {
  imageUrl?: string;
  title: string;
  description: string;
  onClick?: () => void;
}

export function CategoriesCard({
  imageUrl = "",
  title = "",
  description = "",
  onClick = () => {},
  }: CategoriesCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:border-primary group relative overflow-hidden"
    >
      {/* Background Image */}
      <div className="w-full h-22 `bg-gradient-to-br` from-primary/20 via-primary/10 to-primary/5">
        {imageUrl ? (
          <Image src={imageUrl} alt={title} fill className="object-cover opacity-10" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayCircle size={48} className="text-primary/30" />
          </div>
        )}
      </div>

      <div className="relative z-10 p-4 pb-4">
        <CardTitle className="text-base font-bold mb-2 group-hover:text-primary transition-colors">
          {title}
        </CardTitle>

        <CardDescription className="text-sm line-clamp-2">
          {description}
        </CardDescription>
      </div>
    </Card>
  );
}

