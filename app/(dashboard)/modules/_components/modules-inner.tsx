"use client";

import { ModuleCard } from "./module-card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModulesInnerProps {
  preloadedModules: Preloaded<typeof api.modules.listByCategory>;
  categoryTitle: string;
}

export function ModulesInner({ preloadedModules, categoryTitle }: ModulesInnerProps) {
  const modules = usePreloadedQuery(preloadedModules);
  const router = useRouter();

  const handleModuleClick = (moduleId: string) => {
    router.push(`/lessons/${moduleId}`);
  };

  const handleBackClick = () => {
    router.push("/categories");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-6 px-8 flex items-center gap-4 border-b">
        <SidebarTrigger className="text-blue-brand hover:text-blue-brand-dark hover:bg-blue-brand-light" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBackClick}
          className="hover:bg-accent"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{categoryTitle}</h1>
          <p className="text-sm text-muted-foreground">
            {modules.length} {modules.length === 1 ? "módulo disponível" : "módulos disponíveis"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-3">
          {modules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum módulo disponível nesta categoria ainda.
              </p>
            </div>
          ) : (
            modules.map((module) => (
              <ModuleCard
                key={module._id}
                title={module.title}
                description={module.description}
                totalLessons={module.totalLessonVideos}
                onClick={() => handleModuleClick(module._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

