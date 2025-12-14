import { render, screen } from "@testing-library/react";
import UserInfos from "./user-infos";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";

const mockPreloadedQuery = {
    _value: {
        _id: 'test-user-id',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        status: 'active',
    },
} as Preloaded<typeof api.users.current>;

vi.mock('convex/react', () => ({
    usePreloadedQuery: vi.fn(() => mockPreloadedQuery._value),
}));

describe('UserInfos', () => {
    it('should render the user infos', () => {
        render(<UserInfos preloadedUserData={mockPreloadedQuery} />);
    });
});