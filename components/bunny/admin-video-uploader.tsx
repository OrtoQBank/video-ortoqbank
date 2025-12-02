'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AdminVideoUploaderProps {
  onSuccess?: (videoData: {
    videoId: string;
    libraryId: string;
    title: string;
    description?: string;
  }) => void;
}

export default function AdminVideoUploader({ onSuccess }: AdminVideoUploaderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [libraryId, setLibraryId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/bunny/create-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          isPrivate: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro detalhado ao criar vídeo:', error);
        const errorMessage = error.detail 
          ? `${error.error}: ${error.detail}` 
          : error.error || 'Falha ao criar vídeo';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setVideoId(data.videoId);
      setLibraryId(data.libraryId);

      toast({
        title: 'Sucesso',
        description: 'Vídeo criado! Agora selecione o arquivo para fazer upload.',
      });
    } catch (error) {
      console.error('Error creating video:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar vídeo',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione um arquivo de vídeo',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (optional, e.g., 5GB limit)
      const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
      if (selectedFile.size > maxSize) {
        toast({
          title: 'Erro',
          description: 'O arquivo é muito grande (máximo 5GB)',
          variant: 'destructive',
        });
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !videoId || !libraryId) {
      toast({
        title: 'Erro',
        description: 'Crie o vídeo e selecione um arquivo primeiro',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload via servidor (mais seguro)
      const uploadUrl = `/api/bunny/upload?videoId=${encodeURIComponent(videoId)}&libraryId=${encodeURIComponent(libraryId)}`;
      
      const xhr = new XMLHttpRequest();

      return new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(Math.round(percentComplete));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            toast({
              title: 'Sucesso',
              description: 'Vídeo enviado! O Bunny está processando o vídeo.',
            });
            
            if (onSuccess) {
              onSuccess({
                videoId,
                libraryId,
                title,
                description,
              });
            }

            // Reset form
            setTitle('');
            setDescription('');
            setFile(null);
            setVideoId(null);
            setLibraryId(null);
            setUploadProgress(0);
            
            resolve();
          } else {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error || `Upload failed with status ${xhr.status}`));
          }
          setIsUploading(false);
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Erro de rede ao fazer upload'));
          setIsUploading(false);
        });

        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao fazer upload',
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload de Vídeo para Bunny Stream</CardTitle>
        <CardDescription>
          Crie um vídeo e faça upload do arquivo. O Bunny irá processar e disponibilizar automaticamente.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Create video metadata */}
        {!videoId && (
          <form onSubmit={handleCreateVideo} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título do Vídeo *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aula 01 - Introdução"
                disabled={isCreating}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do vídeo (opcional)"
                disabled={isCreating}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Vídeo'}
            </Button>
          </form>
        )}

        {/* Step 2: Upload file */}
        {videoId && !isUploading && uploadProgress === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                ✓ Vídeo criado com sucesso!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                ID: {videoId}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Selecione o arquivo de vídeo</label>
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="mt-1"
              />
              {file && (
                <p className="text-xs text-muted-foreground mt-1">
                  📁 {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={!file}>
                Fazer Upload
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setVideoId(null);
                  setLibraryId(null);
                  setFile(null);
                  setTitle('');
                  setDescription('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Upload progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Enviando vídeo...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Não feche esta página até o upload terminar.
            </p>
          </div>
        )}

        {/* Success state */}
        {uploadProgress === 100 && !isUploading && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              ✓ Upload concluído!
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              O Bunny está processando o vídeo. Você pode fechar esta janela.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

