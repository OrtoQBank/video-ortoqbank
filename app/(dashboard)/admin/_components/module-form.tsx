"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModuleFormProps {
  onSuccess?: () => void;
}

export function ModuleForm({ onSuccess }: ModuleFormProps) {
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = useQuery(api.categories.list);
  const createModule = useMutation(api.modules.create);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId || !title || !slug || !description || !orderIndex) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createModule({
        categoryId: categoryId as any,
        title,
        slug,
        description,
        order_index: parseInt(orderIndex),
        totalLessonVideos: 0,
      });

      toast({
        title: "Sucesso",
        description: "Módulo criado com sucesso!",
      });

      // Limpar o formulário
      setCategoryId("");
      setTitle("");
      setSlug("");
      setDescription("");
      setOrderIndex("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar módulo",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-gerar slug a partir do título
  const handleTitleChange = (value: string) => {
    setTitle(value);
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
        <CardTitle>Novo Módulo</CardTitle>
        <CardDescription>Adicione um novo módulo ao sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Categoria *</label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isSubmitting}>
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
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ex: Anatomia do Sistema Musculoesquelético"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug *</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="anatomia-do-sistema-musculoesqueletico"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição *</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do módulo"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Ordem *</label>
            <Input
              type="number"
              value={orderIndex}
              onChange={(e) => setOrderIndex(e.target.value)}
              placeholder="1"
              min="1"
              disabled={isSubmitting}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Criando..." : "Criar Módulo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

