"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, PlayCircle, TrendingUp, User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

// Mock data
const mockData = {
  user: {
    name: "João Silva",
    email: "joao.silva@email.com",
    pictureUrl: undefined,
  },
  stats: {
    totalVideosWatched: 45,
    totalVideos: 120,
    completionPercentage: 38,
  },
  recentVideos: [
    {
      id: "1",
      title: "Anatomia do Sistema Nervoso Central",
      categoryName: "Neuroanatomia Básica",
      duration: "15:34",
      thumbnailUrl: undefined,
      lastWatchedAt: Date.now() - 1000 * 60 * 30, // 30 min atrás
      completed: true,
    },
    {
      id: "2",
      title: "Fundamentos da Fisiologia Celular",
      categoryName: "Fisiologia Humana",
      duration: "22:15",
      thumbnailUrl: undefined,
      lastWatchedAt: Date.now() - 1000 * 60 * 60 * 2, // 2 horas atrás
      completed: true,
    },
    {
      id: "3",
      title: "Introdução à Farmacologia",
      categoryName: "Farmacologia Geral",
      duration: "18:45",
      thumbnailUrl: undefined,
      lastWatchedAt: Date.now() - 1000 * 60 * 60 * 5, // 5 horas atrás
      completed: false,
    },
    {
      id: "4",
      title: "Bioquímica das Proteínas",
      categoryName: "Bioquímica Básica",
      duration: "20:30",
      thumbnailUrl: undefined,
      lastWatchedAt: Date.now() - 1000 * 60 * 60 * 24, // 1 dia atrás
      completed: true,
    },
    {
      id: "5",
      title: "Embriologia: Primeira Semana",
      categoryName: "Embriologia Humana",
      duration: "25:00",
      thumbnailUrl: undefined,
      lastWatchedAt: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 dias atrás
      completed: false,
    },
  ],
  categoriesProgress: [ 
    {
      categoryId: "1",
      categoryName: "Neuroanatomia Básica",
      totalVideos: 25,
      watchedVideos: 18,
      percentage: 72,
    },
    {
      categoryId: "2",
      categoryName: "Fisiologia Humana",
      totalVideos: 30,
      watchedVideos: 12,
      percentage: 40,
    },
    {
      categoryId: "3",
      categoryName: "Farmacologia Geral",
      totalVideos: 20,
      watchedVideos: 5,
      percentage: 25,
    },
    {
      categoryId: "4",
      categoryName: "Bioquímica Básica",
      totalVideos: 22,
      watchedVideos: 8,
      percentage: 36,
    },
    {
      categoryId: "5",
      categoryName: "Embriologia Humana",
      totalVideos: 23,
      watchedVideos: 2,
      percentage: 9,
    },
  ],
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "agora mesmo";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} horas atrás`;
  return `${Math.floor(seconds / 86400)} dias atrás`;
}

export default function ProfileInner() {
  const router = useRouter();
  const data = mockData;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="p-6 flex items-center gap-4">
          <SidebarTrigger className="text-blue-brand hover:text-blue-brand-dark hover:bg-blue-brand-light" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
            <p className="text-sm text-gray-600">Seus dados e progresso</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* User Info Card */}
        <Card>
        <CardHeader>

          <div className="flex items-center gap-4">
            {data.user.pictureUrl ? (
              <Image
                src={data.user.pictureUrl}
                alt={data.user.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-2xl">{data.user.name}</CardTitle>
              <CardDescription>{data.user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vídeos Assistidos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalVideosWatched}</div>
            <p className="text-xs text-muted-foreground">
              de {data.stats.totalVideos} vídeos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Geral</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completionPercentage}%</div>
            <Progress value={data.stats.completionPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias em Andamento</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
                {data.categoriesProgress.filter((c) => c.percentage > 0 && c.percentage < 100).length}
            </div>
            <p className="text-xs text-muted-foreground">
              de {data.categoriesProgress.length} categorias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Categories */}
      {data.recentVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vídeos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                >
                  {video.thumbnailUrl ? (
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.title}
                      width={96}
                      height={64}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="w-24 h-16 rounded bg-muted flex items-center justify-center">
                      <PlayCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{video.title}</h4>
                    <p className="text-sm text-muted-foreground">{video.categoryName}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{video.duration}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(video.lastWatchedAt)}
                      </span>
                      {video.completed && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Concluído
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
