"use client";

import { Sidebar } from "@/components/Sidebar";
import { ProgressBar } from "./components/ProgressBar";
import { SearchBar } from "./components/SearchBar";
import { CourseCard } from "./components/CourseCard";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  // Mock data - substituir com dados reais do Convex posteriormente
  const courses = Array(9)
    .fill(null)
    .map((_, i) => ({
      id: `course-${i}`,
      title: "Ciências Básicas em Ortopedia",
      description:
        "Fundamentos anatômicos, biomecânicos e fisiológicos aplicados à ortopedia",
      level: "Básico" as const,
      lessonsCount: 45,
      duration: 12,
    }));

  const handleSearch = (query: string) => {
    console.log("Pesquisando por:", query);
    // Implementar lógica de pesquisa
  };

  const handleCourseClick = (courseId: string) => {
    console.log("Curso clicado:", courseId);
    // Implementar navegação para o curso
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 ml-[147px] p-6">
        {/* Header com progresso e estrela */}
        <div className="flex items-center justify-center mb-6 relative">
          <ProgressBar label="Progresso Total" progress={34} />
          <Button
            variant="ghost"
            size="icon"
            className="text-yellow-400 hover:text-yellow-500 hover:bg-transparent h-10 w-10 absolute right-0"
          >
            <Star size={32} fill="currentColor" />
          </Button>
        </div>

        {/* Barra de pesquisa */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Grid de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              {...course}
              onClick={() => handleCourseClick(course.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

