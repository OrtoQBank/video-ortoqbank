// Convex Configuration
import { defineApp } from "convex/server";
import aggregate from "@convex-dev/aggregate/convex.config";

const app = defineApp();

// Configure aggregate components for content statistics
// We use separate aggregates for each content type for better performance
app.use(aggregate, { name: "aggregateLessons" });
app.use(aggregate, { name: "aggregateUnits" });
app.use(aggregate, { name: "aggregateCategories" });

export default app;
