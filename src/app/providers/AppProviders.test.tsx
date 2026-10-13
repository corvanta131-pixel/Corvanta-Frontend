import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { AppProviders } from './AppProviders';

describe('AppProviders', () => {
  it('can host a RouterProvider without nesting routers (regression: blank screen on startup)', () => {
    // main.tsx renders <AppProviders><RouterProvider router={...} /></AppProviders>.
    // Wrapping those children in a <BrowserRouter> makes React Router throw
    // "You cannot render a <Router> inside another <Router>".
    const router = createMemoryRouter([{ path: '/', element: <p>Corvanta is running</p> }]);
    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );
    expect(screen.getByText('Corvanta is running')).toBeInTheDocument();
  });
});
