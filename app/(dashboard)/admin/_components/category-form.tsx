"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";

interface CategoryFormProps {
  onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createCategory = useMutation(api.categories.create);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !slug || !description || !position) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createCategory({
        title,
        slug,
        description,
        position: parseInt(position),
        iconUrl: iconUrl || undefined,
      });

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      // Limpar o formulário
      setTitle("");
      setSlug("");
      setDescription("");
      setPosition("");
      setIconUrl("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar categoria",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-gerar slug a partir do título
  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Gerar slug automaticamente
    const generatedSlug = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Categoria</CardTitle>
        <CardDescription>Adicione uma nova categoria ao sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Título *</label>
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ex: Ciências Básicas em Ortopedia"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug *</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ciencias-basicas-em-ortopedia"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição *</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição da categoria"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Posição *</label>
            <Input
              type="number"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="1"
              min="1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">URL do Ícone (opcional)</label>
            <Input
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              placeholder="https://..."
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Criando..." : "Criar Categoria"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

