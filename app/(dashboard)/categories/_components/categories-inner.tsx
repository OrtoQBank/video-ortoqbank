"use client";

import { ProgressBar } from "./progress-bar";
import { SearchBar } from "./search-bar";
import { CategoriesCard } from "./categories-card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Categories {
  id: string;
  title: string;
  description: string;
  level: "Básico" | "Intermediário" | "Avançado";
  lessonsCount: number;
  duration: number;
}

interface CategoriesInnerProps {
  initialCategories: Categories[];
  initialProgress: number;
}

export function CategoriesInner({ initialCategories, initialProgress }: CategoriesInnerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log("Pesquisando por:", query);
    // Implementar lógica de pesquisa
  };

    const handleCategoryClick = (categoryId: string) => {
    router.push(`/category/${categoryId}`);
  };

  // Filtrar cursos baseado na busca (exemplo simples)
  const filteredCategories = searchQuery
    ? initialCategories.filter(
        (category) =>
          category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : initialCategories;

  return (
    <div className="min-h-screen bg-white">
      {/* Header com progresso e estrela */}
      <div className="py-6 px-48 flex items-center justify-center mb-6 relative">
        <SidebarTrigger className="absolute left-6 text-blue-brand hover:text-blue-brand-dark hover:bg-blue-brand-light" />
        <ProgressBar label="Progresso Total" progress={initialProgress} />
        <Button
          variant="ghost"
          size="icon"
          className="text-yellow-400 hover:text-yellow-500 hover:bg-transparent h-10 w-10 absolute right-48"
        >
          <Star size={32} fill="currentColor" />
        </Button>
      </div>

      <div className="px-48 pb-4">
        {/* Barra de pesquisa */}
        <div className="mb-4">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Grid de cards - 3 linhas de 3 cursos sem scroll */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCategories.map((category) => (
            <CategoriesCard
              key={category.id}
              {...category}
              onClick={() => handleCategoryClick(category.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

