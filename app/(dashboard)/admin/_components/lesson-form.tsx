"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AdminVideoUploader from "@/components/bunny/admin-video-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LessonFormProps {
  onSuccess?: () => void;
  editingLesson?: {
    _id: Id<"lessons">;
    moduleId: Id<"modules">;
    title: string;
    slug: string;
    description: string;
    bunnyStoragePath?: string;
    publicUrl?: string;
    thumbnailUrl?: string;
    durationSeconds: number;
    order_index: number;
    lessonNumber: number;
    isPublished: boolean;
    tags?: string[];
  } | null;
  onCancelEdit?: () => void;
}

export function LessonForm({ onSuccess, editingLesson, onCancelEdit }: LessonFormProps) {
  const [moduleId, setModuleId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [durationSeconds, setDurationSeconds] = useState("");
  const [orderIndex, setOrderIndex] = useState("");
  const [lessonNumber, setLessonNumber] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [bunnyStoragePath, setBunnyStoragePath] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [tags, setTags] = useState("");
  const [videoId, setVideoId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modules = useQuery(api.modules.list);
  const createLesson = useMutation(api.lessons.create);
  const updateLesson = useMutation(api.lessons.update);
  const { toast } = useToast();

  // Load editing lesson data
  useEffect(() => {
    if (editingLesson) {
      setModuleId(editingLesson.moduleId);
      setTitle(editingLesson.title);
      setSlug(editingLesson.slug);
      setDescription(editingLesson.description);
      setDurationSeconds(editingLesson.durationSeconds.toString());
      setOrderIndex(editingLesson.order_index.toString());
      setLessonNumber(editingLesson.lessonNumber.toString());
      setIsPublished(editingLesson.isPublished);
      setBunnyStoragePath(editingLesson.bunnyStoragePath || "");
      setPublicUrl(editingLesson.publicUrl || "");
      setThumbnailUrl(editingLesson.thumbnailUrl || "");
      setTags(editingLesson.tags?.join(", ") || "");
      setVideoId((editingLesson as any).videoId || "");
    }
  }, [editingLesson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!moduleId || !title || !slug || !description || !orderIndex || !lessonNumber) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const tagsArray = tags.trim() ? tags.split(",").map(tag => tag.trim()) : undefined;
      const duration = durationSeconds ? parseInt(durationSeconds) : 0;

      if (editingLesson) {
        // Update existing lesson
        await updateLesson({
          id: editingLesson._id,
          moduleId: moduleId as any,
          title,
          slug,
          description,
          durationSeconds: duration,
          order_index: parseInt(orderIndex),
          lessonNumber: parseInt(lessonNumber),
          isPublished,
          bunnyStoragePath: bunnyStoragePath || undefined,
          publicUrl: publicUrl || undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          tags: tagsArray,
          videoId: videoId || undefined,
        } as any);

        toast({
          title: "Sucesso",
          description: "Aula atualizada com sucesso!",
        });
      } else {
        // Create new lesson
      await createLesson({
        moduleId: moduleId as any,
        title,
        slug,
        description,
        durationSeconds: duration,
        order_index: parseInt(orderIndex),
        lessonNumber: parseInt(lessonNumber),
        isPublished,
        bunnyStoragePath: bunnyStoragePath || undefined,
        publicUrl: publicUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        tags: tagsArray,
        videoId: videoId || undefined,
      } as any);

      toast({
        title: "Sucesso",
        description: "Aula criada com sucesso!",
      });
      }

      // Limpar o formulário
      setModuleId("");
      setTitle("");
      setSlug("");
      setDescription("");
      setDurationSeconds("");
      setOrderIndex("");
      setLessonNumber("");
      setIsPublished(false);
      setBunnyStoragePath("");
      setPublicUrl("");
      setThumbnailUrl("");
      setTags("");
      setVideoId("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : (editingLesson ? "Erro ao atualizar aula" : "Erro ao criar aula"),
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
        <CardTitle>{editingLesson ? "Editar Aula" : "Nova Aula"}</CardTitle>
        <CardDescription>
          {editingLesson ? "Atualize as informações da aula" : "Adicione uma nova aula ao sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Informações Básicas</TabsTrigger>
            <TabsTrigger value="video">Upload de Vídeo</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <div>
            <label className="text-sm font-medium">Módulo *</label>
            <Select value={moduleId} onValueChange={setModuleId} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um módulo" />
              </SelectTrigger>
              <SelectContent>
                {modules?.map((module) => (
                  <SelectItem key={module._id} value={module._id}>
                    {module.title}
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
              placeholder="Ex: Introdução à Anatomia Óssea"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Slug *</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="introducao-a-anatomia-ossea"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição *</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição detalhada da aula"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Duração (segundos)</label>
              <Input
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                placeholder="0 (será preenchido após upload)"
                min="0"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Deixe em branco se não souber
              </p>
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

            <div>
              <label className="text-sm font-medium">Número da Aula *</label>
              <Input
                type="number"
                value={lessonNumber}
                onChange={(e) => setLessonNumber(e.target.value)}
                placeholder="1"
                min="1"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-1">
              💡 Dica: Campos relacionados ao vídeo
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Use a aba "Upload de Vídeo" para fazer upload e esses campos serão preenchidos automaticamente.
              Ou preencha manualmente se preferir.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Bunny Storage Path (opcional)</label>
            <Input
              value={bunnyStoragePath}
              onChange={(e) => setBunnyStoragePath(e.target.value)}
              placeholder="/videos/lesson-1.mp4"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">URL Pública (opcional)</label>
            <Input
              value={publicUrl}
              onChange={(e) => setPublicUrl(e.target.value)}
              placeholder="https://..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">URL da Thumbnail (opcional)</label>
            <Input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://..."
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="anatomia, básico, ortopedia"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bunny Video ID</label>
            <Input
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="ID do vídeo no Bunny Stream"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use a aba "Upload de Vídeo" para enviar um novo vídeo e obter o ID automaticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4"
            />
            <label htmlFor="isPublished" className="text-sm font-medium">
              Publicar aula
            </label>
          </div>

          <div className="flex gap-2">
            {editingLesson && onCancelEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (editingLesson ? "Atualizando..." : "Criando...") : (editingLesson ? "Atualizar Aula" : "Criar Aula")}
          </Button>
          </div>
        </form>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100 font-medium mb-1">
                📹 Como funciona o upload
              </p>
              <ol className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                <li>Preencha o título e descrição do vídeo</li>
                <li>Clique em "Criar Vídeo" para obter o ID</li>
                <li>Selecione o arquivo de vídeo do seu computador</li>
                <li>Clique em "Fazer Upload"</li>
                <li>Volte para "Informações Básicas" e salve a aula</li>
              </ol>
            </div>

            <AdminVideoUploader
              onSuccess={(videoData) => {
                setVideoId(videoData.videoId);
                setTitle(title || videoData.title);
                setDescription(description || videoData.description || '');
                toast({
                  title: "Vídeo vinculado",
                  description: "O vídeo foi vinculado à aula. Volte para 'Informações Básicas' e salve a aula.",
                });
              }}
            />
            
            {videoId && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Vídeo vinculado
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Video ID: {videoId}
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Lembre-se de salvar a aula na aba "Informações Básicas" para confirmar o vínculo.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

