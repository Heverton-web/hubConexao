import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from './AppRouter';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock contexts
const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
    AuthProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock pages to avoid complex dependencies
vi.mock('../pages/AuthPage', () => ({
    AuthPage: () => <div>Login Page</div>
}));

vi.mock('../pages/Dashboard', () => ({
    Dashboard: () => <div>Dashboard Page</div>
}));

vi.mock('../components/Layout', () => ({
    Layout: ({ children }: any) => <div>Layout {children}</div>
}));

vi.mock('./ProtectedRoute', () => ({
    ProtectedRoute: ({ children, requiredRole }: any) => {
        // We can simulate logic here if we want, or just render children
        // But since logic is inside ProtectedRoute, we might want to test that too.
        // However, for AppRouter test, we want to know if the route renders the ProtectedRoute component.
        // Let's assume ProtectedRoute works (we should test it separately) and just render children
        // to verify AppRouter renders the right structure.
        return <div>Protected {children}</div>;
    }
}));


describe('AppRouter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login page when not authenticated', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            user: null,
            loading: false
        });

        render(
            <MemoryRouter initialEntries={['/login']}>
                <AppRouter />
            </MemoryRouter>
        );

        expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('redirects to dashboard when authenticated and accessing login', () => {
        // This is harder to test with MemoryRouter as it handles internal state.
        // We can check if Dashboard is rendered.
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { role: 'client' },
            loading: false
        });

        render(
            <MemoryRouter initialEntries={['/login']}>
                <AppRouter />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    });

    it('renders dashboard when authenticated and accessing dashboard', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            user: { role: 'client' },
            loading: false
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AppRouter />
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
        expect(screen.getByText('Protected')).toBeInTheDocument();
    });
});
