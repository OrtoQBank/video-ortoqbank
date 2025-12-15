"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { useErrorModal } from "@/hooks/use-error-modal";
import { ErrorModal } from "@/components/ui/error-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Id } from "@/convex/_generated/dataModel";
import { CheckCircle2Icon, BookOpenIcon } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
  categoryId: z.string().min(1, "Selecione uma categoria"),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
});

interface UnitFormProps {
  categories: Doc<"categories">[];
  onSuccess?: () => void;
}

export function UnitForm({ categories, onSuccess }: UnitFormProps) {
  const createUnit = useMutation(api.units.create);
  const { toast } = useToast();
  const { error, showError, hideError } = useErrorModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUnit, setCreatedUnit] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await createUnit({
        categoryId: data.categoryId as Id<"categories">,
        title: data.title,
        description: data.description,
      });

      setCreatedUnit(true);

      toast({
        title: "✅ Unidade criada com sucesso!",
        description: `${data.title} foi criado.`,
      });

      form.reset();

      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after 3 seconds
      setTimeout(() => setCreatedUnit(false), 3000);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Erro desconhecido",
        "Erro ao criar unidade"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5" />
          Nova Unidade
        </CardTitle>
        <CardDescription>Adicione uma nova unidade ao sistema</CardDescription>
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
                  />
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
              ) : createdUnit ? (
                <>
                  <CheckCircle2Icon className="mr-2 h-4 w-4" />
                  Unidade Criada!
                </>
              ) : (
                "Criar Unidade"
              )}
            </Button>
          </div>
        </form>

        {createdUnit && (
          <div className="mt-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✅ Unidade criada com sucesso! Visualize na lista ao lado.
            </p>
          </div>
        )}
      </CardContent>

      <ErrorModal
        open={error.isOpen}
        onOpenChange={hideError}
        title={error.title}
        message={error.message}
      />
    </Card>
  );
}

