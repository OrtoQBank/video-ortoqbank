import { render, screen } from "@testing-library/react";
import Dashboard from "./dashboard";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";

const mockPreloadedContentStats = {
    _value: { totalLessons: 20 },
} as Preloaded<typeof api.contentStats.get>;

const mockPreloadedGlobalProgress = {
    _value: {
        completedLessonsCount: 5,
        progressPercent: 50,
        updatedAt: Date.now(),
    },
} as Preloaded<typeof api.progress.getGlobalProgress>;

const mockPreloadedCompletedCount = {
    _value: 5,
} as Preloaded<typeof api.progress.getCompletedCount>;

const mockPreloadedViewedCount = {
    _value: 10,
} as Preloaded<typeof api.recentViews.getViewedCount>;

vi.mock('convex/react', () => ({
    usePreloadedQuery: vi.fn((preloaded) => {
        if (preloaded === mockPreloadedContentStats) return mockPreloadedContentStats._value;
        if (preloaded === mockPreloadedGlobalProgress) return mockPreloadedGlobalProgress._value;
        if (preloaded === mockPreloadedCompletedCount) return mockPreloadedCompletedCount._value;
        if (preloaded === mockPreloadedViewedCount) return mockPreloadedViewedCount._value;
        return null;
    }),
}));

describe('Dashboard', () => {
    it('should render the dashboard', () => {
        render(
            <Dashboard
                preloadedContentStats={mockPreloadedContentStats}
                preloadedGlobalProgress={mockPreloadedGlobalProgress}
                preloadedCompletedCount={mockPreloadedCompletedCount}
                preloadedViewedCount={mockPreloadedViewedCount}
            />
        );

        const completedTitle = screen.getByText('Aulas Concluídas');
        expect(completedTitle).toBeDefined();
    });
});
