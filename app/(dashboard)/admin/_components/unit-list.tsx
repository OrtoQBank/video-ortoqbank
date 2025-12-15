"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { useErrorModal } from "@/hooks/use-error-modal";
import { useConfirmModal } from "@/hooks/use-confirm-modal";
import { ErrorModal } from "@/components/ui/error-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EditIcon, CheckIcon, XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { UnitListItem } from "./unit-list-item";

interface UnitListProps {
  categories: Doc<"categories">[];
}

export function UnitList({ categories }: UnitListProps) {
  const units = useQuery(api.units.list);
  const updateUnit = useMutation(api.units.update);
  const deleteUnit = useMutation(api.units.remove);
  const reorderUnits = useMutation(api.units.reorder);
  const togglePublishUnit = useMutation(api.units.togglePublish);
  const { toast } = useToast();
  const { error, showError, hideError } = useErrorModal();
  const { confirm, showConfirm, hideConfirm } = useConfirmModal();

  const [editingUnit, setEditingUnit] = useState<Id<"units"> | null>(null);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editOrderIndex, setEditOrderIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit order mode state
  const [isEditOrderMode, setIsEditOrderMode] = useState(false);
  const [orderedUnitsByCategory, setOrderedUnitsByCategory] = useState<Record<string, Doc<"units">[]>>({});
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // DND sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group units by category and update when units or categories change
  useEffect(() => {
    const grouped: Record<string, Doc<"units">[]> = {};

    // Sort categories by position
    const sortedCategories = [...categories].sort((a, b) => a.position - b.position);

    // Initialize with empty arrays for all categories
    sortedCategories.forEach(cat => {
      grouped[cat._id] = [];
    });

    // Group units by category and sort by order_index
    units?.forEach(unit => {
      if (grouped[unit.categoryId]) {
        grouped[unit.categoryId].push(unit);
      }
    });

    // Sort units within each category by order_index
    Object.keys(grouped).forEach(categoryId => {
      grouped[categoryId].sort((a, b) => a.order_index - b.order_index);
    });

    setOrderedUnitsByCategory(grouped);
  }, [units, categories]);

  const handleEdit = (unit: {
    _id: Id<"units">;
    categoryId: Id<"categories">;
    title: string;
    slug: string;
    description: string;
    order_index: number;
    totalLessonVideos: number;
  }) => {
    setEditingUnit(unit._id);
    setEditCategoryId(unit.categoryId);
    setEditTitle(unit.title);
    setEditDescription(unit.description);
    setEditOrderIndex(unit.order_index);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUnit || !editCategoryId || !editTitle || !editDescription) {
      showError("Preencha todos os campos obrigatórios", "Campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUnit({
        id: editingUnit,
        categoryId: editCategoryId as Id<"categories">,
        title: editTitle,
        description: editDescription,
        order_index: editOrderIndex,
      });

      toast({
        title: "Sucesso",
        description: "Unidade atualizada com sucesso!",
      });

      setEditingUnit(null);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Erro ao atualizar unidade",
        "Erro ao atualizar unidade"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: Id<"units">, title: string) => {
    const message = `ATENÇÃO: Esta ação irá deletar permanentemente:\n\n` +
      `• A unidade "${title}"\n` +
      `• TODAS as aulas desta unidade\n\n` +
      `Esta ação não pode ser desfeita!\n\n` +
      `Tem certeza que deseja continuar?`;

    showConfirm(
      message,
      async () => {
        try {
          await deleteUnit({ id });
          toast({
            title: "Sucesso",
            description: "Unidade e suas aulas foram deletadas!",
          });
        } catch (error) {
          showError(
            error instanceof Error ? error.message : "Erro ao deletar unidade",
            "Erro ao deletar unidade"
          );
        }
      },
      "DELETAR UNIDADE E SUAS AULAS"
    );
  };

  const handleTogglePublish = async (id: Id<"units">, title: string, currentStatus: boolean) => {
    const action = currentStatus ? "despublicar" : "publicar";
    const message = currentStatus
      ? `Despublicar a unidade "${title}" irá:\n\n` +
      `• Despublicar TODAS as aulas desta unidade\n` +
      `Os alunos não terão mais acesso a este conteúdo.\n\n` +
      `Deseja continuar?`
      : `Publicar a unidade "${title}" irá:\n\n` +
      `• Publicar TODAS as aulas desta unidade\n` +
      `Os alunos terão acesso a todo este conteúdo.\n\n` +
      `Deseja continuar?`;

    showConfirm(
      message,
      async () => {
        try {
          const newStatus = await togglePublishUnit({ id });
          toast({
            title: "Sucesso",
            description: `Unidade "${title}" ${newStatus ? "publicada" : "despublicada"} com sucesso!`,
          });
        } catch (error) {
          showError(
            error instanceof Error ? error.message : `Erro ao ${action} unidade`,
            `Erro ao ${action} unidade`
          );
        }
      },
      `${action === "publicar" ? "📢" : "🔒"} ${action.toUpperCase()} UNIDADE`
    );
  };

  const handleDragEnd = (categoryId: string) => (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setOrderedUnitsByCategory((prev) => {
        const categoryUnits = prev[categoryId] || [];
        const oldIndex = categoryUnits.findIndex((item) => item._id === active.id);
        const newIndex = categoryUnits.findIndex((item) => item._id === over.id);

        return {
          ...prev,
          [categoryId]: arrayMove(categoryUnits, oldIndex, newIndex),
        };
      });
    }
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      // Create updates array with new order_index for all units
      const updates: { id: Id<"units">; order_index: number }[] = [];

      Object.entries(orderedUnitsByCategory).forEach(([, categoryUnits]) => {
        categoryUnits.forEach((unit, index) => {
          updates.push({
            id: unit._id,
            order_index: index,
          });
        });
      });

      await reorderUnits({ updates });

      toast({
        title: "Sucesso",
        description: "Ordem das unidades atualizada!",
      });

      setIsEditOrderMode(false);
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Erro ao salvar ordem",
        "Erro ao salvar ordem"
      );
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleCancelOrder = () => {
    // Rebuild the grouped structure from original units
    const grouped: Record<string, Doc<"units">[]> = {};
    const sortedCategories = [...categories].sort((a, b) => a.position - b.position);

    sortedCategories.forEach(cat => {
      grouped[cat._id] = [];
    });

    units?.forEach(unit => {
      if (grouped[unit.categoryId]) {
        grouped[unit.categoryId].push(unit);
      }
    });

    Object.keys(grouped).forEach(categoryId => {
      grouped[categoryId].sort((a, b) => a.order_index - b.order_index);
    });

    setOrderedUnitsByCategory(grouped);
    setIsEditOrderMode(false);
  };

  const getCategoryName = (categoryId: Id<"categories">) => {
    const category = categories.find(c => c._id === categoryId);
    return category?.title || "Categoria desconhecida";
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Módulos Cadastrados</CardTitle>

            </div>
            <div className="flex gap-2">
              {!isEditOrderMode ? (
                <Button
                  variant="outline"
                  onClick={() => setIsEditOrderMode(true)}
                  disabled={units?.length === 0}
                >
                  <EditIcon className="h-4 w-4 mr-2" />
                  Editar Ordem
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelOrder}
                    disabled={isSavingOrder}
                  >
                    <XIcon className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveOrder}
                    disabled={isSavingOrder}
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    {isSavingOrder ? "Salvando..." : "Salvar Ordem"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4 max-h-[330px] overflow-auto pr-2">
            {units?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma unidade cadastrada ainda.</p>
            ) : (
              categories
                .sort((a, b) => a.position - b.position)
                .map((category) => {
                  const categoryUnits = orderedUnitsByCategory[category._id] || [];

                  return (
                    <div key={category._id} className="space-y-1.5">
                      {/* Category Header */}
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-primary uppercase tracking-wide">
                          {category.title}
                        </h3>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      {/* Units for this category */}
                      {categoryUnits.length === 0 ? (
                        <p className="text-xs text-muted-foreground ml-3 italic">
                          Nenhuma unidade nesta categoria
                        </p>
                      ) : isEditOrderMode ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd(category._id)}
                        >
                          <SortableContext
                            items={categoryUnits.map(unit => unit._id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-1.5">
                              {categoryUnits.map((unit) => (
                                <UnitListItem
                                  key={unit._id}
                                  unit={unit}
                                  isEditOrderMode={isEditOrderMode}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                  onTogglePublish={handleTogglePublish}
                                  getCategoryName={getCategoryName}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <div className="space-y-1.5">
                          {categoryUnits.map((unit) => (
                            <UnitListItem
                              key={unit._id}
                              unit={unit}
                              isEditOrderMode={isEditOrderMode}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                              onTogglePublish={handleTogglePublish}
                              getCategoryName={getCategoryName}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={editingUnit !== null} onOpenChange={() => setEditingUnit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Unidade</DialogTitle>
            <DialogDescription>
              Atualize as informações da unidade
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
                onClick={() => setEditingUnit(null)}
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

      <ErrorModal
        open={error.isOpen}
        onOpenChange={hideError}
        title={error.title}
        message={error.message}
      />

      <ConfirmModal
        open={confirm.isOpen}
        onOpenChange={hideConfirm}
        title={confirm.title}
        message={confirm.message}
        onConfirm={confirm.onConfirm}
      />
    </>
  );
}

