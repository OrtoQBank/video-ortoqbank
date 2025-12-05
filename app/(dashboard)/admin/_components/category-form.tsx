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
import { CheckCircle2, FolderPlus } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  position: z.number().min(1, "Posição deve ser maior que 0"),
  iconUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

interface CategoryFormProps {
  onSuccess?: () => void;
}

export function CategoryForm({ onSuccess }: CategoryFormProps) {
  const createCategory = useMutation(api.categories.create);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCategory, setCreatedCategory] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      position: 1,
      iconUrl: "",
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
      await createCategory({
        title: data.title,
        slug: data.slug,
        description: data.description,
        position: data.position,
        iconUrl: data.iconUrl || undefined,
      });

      setCreatedCategory(true);

      toast({
        title: "✅ Categoria criada com sucesso!",
        description: `${data.title} foi criada.`,
      });

      form.reset();
      
      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 3 seconds
      setTimeout(() => setCreatedCategory(false), 3000);
    } catch (error) {
      toast({
        title: "❌ Erro ao criar categoria",
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
          <FolderPlus className="h-5 w-5" />
          Nova Categoria
        </CardTitle>
        <CardDescription>
          Adicione uma nova categoria ao sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            {/* Title */}
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Título</FieldLabel>
                  <Input
                    {...field}
                    placeholder="Ex: Ciências Básicas em Ortopedia"
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
                    placeholder="ciencias-basicas-em-ortopedia"
                    autoComplete="off"
                  />
                  <FieldDescription>
                    URL amigável para a categoria
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
                    placeholder="Breve descrição da categoria"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Position */}
            <Controller
              name="position"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Posição</FieldLabel>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    placeholder="1"
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value) || 1)
                    }
                  />
                  <FieldDescription>Ordem de exibição</FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Icon URL */}
            <Controller
              name="iconUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>URL do Ícone (opcional)</FieldLabel>
                  <Input
                    {...field}
                    placeholder="https://..."
                    autoComplete="off"
                  />
                  <FieldDescription>
                    Link para o ícone da categoria
                  </FieldDescription>
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
              ) : createdCategory ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Categoria Criada!
                </>
              ) : (
                "Criar Categoria"
              )}
            </Button>
          </div>
        </form>

        {createdCategory && (
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✅ Categoria criada com sucesso! Visualize na lista ao lado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

