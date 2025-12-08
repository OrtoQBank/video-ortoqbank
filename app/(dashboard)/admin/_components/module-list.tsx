"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Id, Doc } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModuleListProps {
  modules: Doc<"modules">[];
  categories: Doc<"categories">[];
}

export function ModuleList({ modules, categories }: ModuleListProps) {
  const updateModule = useMutation(api.modules.update);
  const deleteModule = useMutation(api.modules.remove);
  const { toast } = useToast();

  const [editingModule, setEditingModule] = useState<Id<"modules"> | null>(null);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editOrderIndex, setEditOrderIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (module: {
    _id: Id<"modules">;
    categoryId: Id<"categories">;
    title: string;
    slug: string;
    description: string;
    order_index: number;
    totalLessonVideos: number;
  }) => {
    setEditingModule(module._id);
    setEditCategoryId(module.categoryId);
    setEditTitle(module.title);
    setEditDescription(module.description);
    setEditOrderIndex(module.order_index);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingModule || !editCategoryId || !editTitle || !editDescription) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateModule({
        id: editingModule,
        categoryId: editCategoryId as any,
        title: editTitle,
        description: editDescription,
        order_index: editOrderIndex,
      });

      toast({
        title: "Sucesso",
        description: "Módulo atualizado com sucesso!",
      });

      setEditingModule(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar módulo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"modules">, title: string) => {
    if (!confirm(`Tem certeza que deseja deletar o módulo "${title}"?`)) {
      return;
    }

    try {
      await deleteModule({ id });
      
      toast({
        title: "Sucesso",
        description: "Módulo deletado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao deletar módulo",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: Id<"categories">) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.title || "Categoria desconhecida";
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle>Módulos Cadastrados</CardTitle>
          <CardDescription>
            {modules.length} {modules.length === 1 ? "módulo" : "módulos"} no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-[310px] overflow-auto pr-2">
            {modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum módulo cadastrado ainda.</p>
            ) : (
              modules.map((module) => (
                <div
                  key={module._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{module.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {module.description}
                    </p>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        Categoria: {getCategoryName(module.categoryId)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {module.totalLessonVideos} {module.totalLessonVideos === 1 ? "aula" : "aulas"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(module._id, module.title)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={editingModule !== null} onOpenChange={() => setEditingModule(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>
              Atualize as informações do módulo
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Categoria *</label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição *</label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingModule(null)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

