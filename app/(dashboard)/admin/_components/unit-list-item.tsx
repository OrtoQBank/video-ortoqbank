import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { GripVerticalIcon, EyeIcon, EyeOffIcon, EditIcon, Trash2Icon } from "lucide-react";
import { Doc, Id } from "@/convex/_generated/dataModel";

interface UnitListItemProps {
    unit: Doc<"units">;
    isEditOrderMode: boolean;
    onEdit: (unit: Doc<"units">) => void;
    onDelete: (id: Id<"units">, title: string) => void;
    onTogglePublish: (id: Id<"units">, title: string, currentStatus: boolean) => void;
    getCategoryName: (categoryId: Id<"categories">) => string;
}

export function UnitListItem({
    unit,
    isEditOrderMode,
    onEdit,
    onDelete,
    onTogglePublish,
    getCategoryName
}: UnitListItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: unit._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isEditOrderMode ? { ...attributes, ...listeners } : {})}
            className={cn(
                "flex items-center gap-2 p-2 border rounded-md transition-colors",
                isEditOrderMode && "cursor-grab active:cursor-grabbing hover:bg-accent/50",
                !isEditOrderMode && "hover:bg-accent/50",
                isDragging && "opacity-50 ring-2 ring-primary"
            )}
        >
            {isEditOrderMode && (
                <div className="p-0.5">
                    <GripVerticalIcon className="h-4 w-4 text-muted-foreground" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{unit.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                    {unit.description}
                </p>
                <div className="flex gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                        Categoria: {getCategoryName(unit.categoryId)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {unit.totalLessonVideos} {unit.totalLessonVideos === 1 ? "aula" : "aulas"}
                    </span>
                </div>
            </div>
            {!isEditOrderMode && (
                <div className="flex gap-1.5 shrink-0">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onTogglePublish(unit._id, unit.title, unit.isPublished)}
                        title={unit.isPublished ? "Despublicar unidade" : "Publicar unidade"}
                    >
                        {unit.isPublished ? (
                            <EyeIcon className="h-3 w-3 text-green-600" />
                        ) : (
                            <EyeOffIcon className="h-3 w-3 text-gray-400" />
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onEdit(unit)}
                    >
                        <EditIcon className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onDelete(unit._id, unit.title)}
                    >
                        <Trash2Icon className="h-3 w-3 text-destructive" />
                    </Button>
                </div>
            )}
        </div>
    );
}
