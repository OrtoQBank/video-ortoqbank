"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2, BookOpen } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria"),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  orderIndex: z.number().min(0, "Ordem deve ser 0 ou maior"),
});

interface ModuleFormProps {
  categories: Doc<"categories">[];
  onSuccess?: () => void;
}

export function ModuleForm({ categories, onSuccess }: ModuleFormProps) {
  const createModule = useMutation(api.modules.create);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdModule, setCreatedModule] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      slug: "",
      description: "",
      orderIndex: 0,
    },
  });

  // Auto-gerar slug a partir do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createModule({
        categoryId: data.categoryId as Id<"categories">,
        title: data.title,
        slug: data.slug,
        description: data.description,
        order_index: data.orderIndex,
        totalLessonVideos: 0,
      });

      setCreatedModule(true);

      toast({
        title: "✅ Módulo criado com sucesso!",
        description: `${data.title} foi criado.`,
      });

      form.reset();

      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 3 seconds
      setTimeout(() => setCreatedModule(false), 3000);
    } catch (error) {
      toast({
        title: "❌ Erro ao criar módulo",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Novo Módulo
        </CardTitle>
        <CardDescription>Adicione um novo módulo ao sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* Category Selection */}
            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Categoria</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Título</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Ex: Anatomia do Sistema Musculoesquelético"
                    autoComplete="off"
                    onChange={(e) => {
                      field.onChange(e);
                      // Auto-generate slug
                      form.setValue("slug", generateSlug(e.target.value));
                    }}
                  />
                  <FieldDescription>
                    Slug gerado: {generateSlug(field.value || "")}
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Slug */}
            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Slug</FieldLabel>
                  <Input
                    {...field}
                    placeholder="anatomia-do-sistema-musculoesqueletico"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    URL amigável para o módulo
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Description */}
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Descrição</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Breve descrição do módulo"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Order Index */}
            <Controller
              name="orderIndex"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Ordem</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    placeholder="0"
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 0)
                    }
                  />
                  <FieldDescription>Ordem de exibição</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              Limpar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                "Criando..."
              ) : createdModule ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Módulo Criado!
                </>
              ) : (
                "Criar Módulo"
              )}
            </Button>
          </div>
        </form>

        {createdModule && (
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✅ Módulo criado com sucesso! Visualize na lista ao lado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

