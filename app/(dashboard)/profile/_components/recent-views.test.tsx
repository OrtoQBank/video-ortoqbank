
import { render, screen } from "@testing-library/react";
import RecentViews from "./recent-views";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";

const mockPreloadedRecentViews = {
    _value: [],
} as Preloaded<typeof api.recentViews.listRecent>;

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('convex/react', () => ({
    usePreloadedQuery: vi.fn(() => mockPreloadedRecentViews._value),
}));


describe('RecentViews', () => {
    it('should render the recent views', () => {
        render(<RecentViews preloadedRecentViews={mockPreloadedRecentViews} />);

        const paragraph = screen.getByText('Comece a explorar as categorias e módulos disponíveis!');
        expect(paragraph).toBeDefined();
    });
});