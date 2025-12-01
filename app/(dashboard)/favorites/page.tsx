import { FavoritesInner } from "./_components/favorites-inner";

export default function FavoritesPage() {
  // Mock data for presentation - will be replaced with Convex later
  const mockFavorites = [
    {
      _id: "1",
      title: "Ossos e Estruturas - Aula 1",
      description: "Nesta aula você vai aprender conceitos importantes sobre ossos e estruturas. Vamos explorar os fundamentos e aplicações práticas.",
      duration: "15:30",
      level: "Básico" as const,
      categoryName: "Introdução à Anatomia Óssea",
      subthemeName: "Ossos e Estruturas",
    },
    {
      _id: "2",
      title: "Articulações - Aula 2",
      description: "Nesta aula você vai aprender conceitos importantes sobre articulações. Vamos explorar os fundamentos e aplicações práticas.",
      duration: "20:40",
      level: "Intermediário" as const,
      categoryName: "Introdução à Anatomia Óssea",
      subthemeName: "Articulações",
    },
    {
      _id: "3",
      title: "Sistema Muscular - Aula 1",
      description: "Nesta aula você vai aprender conceitos importantes sobre sistema muscular. Vamos explorar os fundamentos e aplicações práticas.",
      duration: "18:25",
      level: "Avançado" as const,
      categoryName: "Introdução à Anatomia Óssea",
      subthemeName: "Sistema Muscular",
    },
  ];

  const mockWatchAlso = [
    {
      _id: "4",
      title: "Tipos de Fraturas - Aula 1",
      description: "Nesta aula você vai aprender conceitos importantes sobre tipos de fraturas. Vamos explorar os fundamentos e aplicações práticas.",
      duration: "22:15",
      level: "Intermediário" as const,
      categoryName: "Ortopedia Avançada",
      subthemeName: "Tipos de Fraturas",
    },
    {
      _id: "5",
      title: "Princípios de Biomecânica - Aula 1",
      description: "Nesta aula você vai aprender conceitos importantes sobre princípios de biomecânica. Vamos explorar os fundamentos e aplicações práticas.",
      duration: "19:45",
      level: "Básico" as const,
      categoryName: "Fisiologia do Movimento",
      subthemeName: "Princípios de Biomecânica",
    },
    {
      _id: "6",
      title: "Análise de Movimento - Aula 1",
      description: "Nesta aula você vai aprender conceitos importantes sobre análise de movimento. Vamos explorar os fundamentos e aplicações práticas.",
      duration: "25:10",
      level: "Avançado" as const,
      categoryName: "Fisiologia do Movimento",
      subthemeName: "Análise de Movimento",
    },
  ];

  return (
    <FavoritesInner
      initialFavorites={[
        {
          ...mockFavorites[0],
          // Remove 'id', since 'Video' type expects '_id'
          description:
            "Nesta aula você vai aprender conceitos importantes sobr  e ossos e estruturas. Vamos explorar os fundamentos e aplicações práticas.",
          level: "Básico",
          categoryName: "Introdução à Anatomia Óssea",
          subthemeName: "Ossos e Estruturas",
        },
      ]}
      watchAlsoVideos={[
        {
          ...mockWatchAlso[0],
          // Remove 'id', since 'Video' type expects '_id'
          description:
            "Nesta aula você vai aprender conceitos importantes sobre tipos de fraturas. Vamos explorar os fundamentos e aplicações práticas.",
          level: "Intermediário",
          categoryName: "Ortopedia Avançada",
          subthemeName: "Tipos de Fraturas",
        },
      ]}
    />
  );
}
