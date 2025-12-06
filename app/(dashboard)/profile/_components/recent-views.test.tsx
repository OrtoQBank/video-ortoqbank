
import { render, screen } from "@testing-library/react";
import RecentViews from "./recent-views";

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@clerk/nextjs', () => ({
    useUser: () => ({
        user: { id: 'test-user-id' },
    }),
}));

vi.mock('convex/react', () => ({
    useQuery: vi.fn(() => []),
}));


describe('RecentViews', () => {
    it('should render the recent views', () => {
        render(<RecentViews />);

            const paragraph = screen.getByText('Comece a explorar as categorias e módulos disponíveis!');
            expect(paragraph).toBeDefined();
    });
});