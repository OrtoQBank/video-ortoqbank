import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Seed the database with sample video data for testing
 */
export const seedVideos = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Check if videos already exist
    const existingVideos = await ctx.db.query("videos").first();
    if (existingVideos) {
      console.log("Videos already seeded");
      return null;
    }

    // Sample courses, modules, and subthemes
    const categories = [
      {
        id: "category-1",
        name: "Introdução à Anatomia Óssea",
        modules: [
          {
            id: "module-1",
            name: "Anatomia do Sistema Musculoesquelético",
            subthemes: [
              { id: "subtheme-1", name: "Ossos e Estruturas" },
              { id: "subtheme-2", name: "Articulações" },
              { id: "subtheme-3", name: "Sistema Muscular" },
            ],
          },
        ],
      },
      {
        id: "category-2",
        name: "Ortopedia Avançada",
        modules: [
          {
            id: "module-2",
            name: "Fraturas e Lesões",
            subthemes: [
              { id: "subtheme-4", name: "Tipos de Fraturas" },
              { id: "subtheme-5", name: "Tratamento de Lesões" },
            ],
          },
        ],
      },
      {
            id: "category-3",
        name: "Fisiologia do Movimento",
        modules: [
          {
            id: "module-3",
            name: "Biomecânica",
            subthemes: [
              { id: "subtheme-6", name: "Princípios de Biomecânica" },
              { id: "subtheme-7", name: "Análise de Movimento" },
            ],
          },
        ],
      },
    ];

    const levels: Array<"Básico" | "Intermediário" | "Avançado"> = ["Básico", "Intermediário", "Avançado"];

    // Create videos for each subtheme
    for (const category of categories) {
      for (const categoryModule of category.modules) {
        for (const subtheme of categoryModule.subthemes) {
          // Create 3 videos per subtheme
          for (let i = 0; i < 3; i++) {
            await ctx.db.insert("videos", {
              title: `${subtheme.name} - Aula ${i + 1}`,
              description: `Nesta aula você vai aprender conceitos importantes sobre ${subtheme.name.toLowerCase()}. Vamos explorar os fundamentos e aplicações práticas.`,
              duration: `${15 + i * 5}:${30 + i * 10}`,
              categoryId: category.id,
              categoryName: category.name,
              moduleId: categoryModule.id,
              moduleName: categoryModule.name,
              subthemeId: subtheme.id,
              subthemeName: subtheme.name,
              order: i,
              level: levels[Math.floor(Math.random() * levels.length)],
            });
          }
        }
      }
    }

    console.log("Sample videos seeded successfully!");
    return null;
  },
});

/**
 * Clear all data from progress table (for testing)
 */
export const clearUserData = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const progress = await ctx.db.query("progress").collect();
    for (const prog of progress) {
      await ctx.db.delete(prog._id);
    }

    console.log("User data cleared successfully!");
    return null;
  },
});

/**
 * Clear all videos (for testing)
 */
export const clearVideos = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const videos = await ctx.db.query("videos").collect();
    for (const video of videos) {
      await ctx.db.delete(video._id);
    }

    console.log("Videos cleared successfully!");
    return null;
  },
});

