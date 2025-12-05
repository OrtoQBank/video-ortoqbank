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

interface CategoryListProps {
  categories: Doc<"categories">[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const updateCategory = useMutation(api.categories.update);
  const deleteCategory = useMutation(api.categories.remove);
  const { toast } = useToast();

  const [editingCategory, setEditingCategory] = useState<Id<"categories"> | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [editIconUrl, setEditIconUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEdit = (category: {
    _id: Id<"categories">;
    title: string;
    slug: string;
    description: string;
    position: number;
    iconUrl?: string;
  }) => {
    setEditingCategory(category._id);
    setEditTitle(category.title);
    setEditSlug(category.slug);
    setEditDescription(category.description);
    setEditPosition(category.position.toString());
    setEditIconUrl(category.iconUrl || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory || !editTitle || !editSlug || !editDescription || !editPosition) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateCategory({
        id: editingCategory,
        title: editTitle,
        slug: editSlug,
        description: editDescription,
        position: parseInt(editPosition),
        iconUrl: editIconUrl || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });

      setEditingCategory(null);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar categoria",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"categories">, title: string) => {
    if (!confirm(`Tem certeza que deseja deletar a categoria "${title}"?`)) {
      return;
    }

    try {
      await deleteCategory({ id });
      
      toast({
        title: "Sucesso",
        description: "Categoria deletada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao deletar categoria",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categorias Cadastradas</CardTitle>
          <CardDescription>
            {categories.length} {categories.length === 1 ? "categoria" : "categorias"} no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
            ) : (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {category.description}
                    </p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Slug: {category.slug}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Posição: {category.position}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(category._id, category.title)}
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
      <Dialog open={editingCategory !== null} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Atualize as informações da categoria
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título *</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={editSlug}
                onChange={(e) => setEditSlug(e.target.value)}
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

            <div>
              <label className="text-sm font-medium">Posição *</label>
              <Input
                type="number"
                value={editPosition}
                onChange={(e) => setEditPosition(e.target.value)}
                min="1"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium">URL do Ícone (opcional)</label>
              <Input
                value={editIconUrl}
                onChange={(e) => setEditIconUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingCategory(null)}
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

