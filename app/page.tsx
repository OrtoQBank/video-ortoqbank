import { HomeContent } from "./_components/HomeContent";

export default async function Home() {
  // Server Component - carregar dados aqui
  // Quando tiver Convex queries, usar preloadQuery como no exemplo:
  // const preloaded = await preloadQuery(api.courses.listCourses);
  // const data = preloadedQueryResult(preloaded);
  
  // Mock data por enquanto - substituir com dados reais do Convex posteriormente
  const courses = Array(9)
    .fill(null)
    .map((_, i) => ({
      id: `course-${i}`,
      title: "Ciências Básicas em Ortopedia",
      description:
        "Fundamentos anatômicos, biomecânicos e fisiológicos aplicados à ortopedia",
      level: "Básico" as const,
      lessonsCount: 45,
      duration: 12,
    }));

  const userProgress = 34;

  return <HomeContent initialCourses={courses} initialProgress={userProgress} />;
}

