import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import LandingPage from '../components/LandingPage';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LandingPage', () => {
  /**
   * **Validates: Requirements 1.1, 1.2**
   * 
   * The Landing Page SHALL display platform features and benefits,
   * and SHALL include a call-to-action button for subscription.
   */
  it('renders hero section with CTA button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Check for main title
    expect(screen.getByText('Foco ENEM')).toBeInTheDocument();

    // Check for tagline
    expect(screen.getByText(/Sua plataforma completa de estudos/i)).toBeInTheDocument();

    // Check for CTA buttons (there are two)
    const ctaButtons = screen.getAllByRole('button', { name: /assinar agora|começar agora/i });
    expect(ctaButtons.length).toBeGreaterThan(0);
  });

  /**
   * **Validates: Requirements 1.1**
   * 
   * The Landing Page SHALL display platform features and benefits.
   */
  it('displays platform features', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Check for features section title
    expect(screen.getByText(/Tudo que você precisa para estudar/i)).toBeInTheDocument();

    // Check for some key features
    expect(screen.getByText(/Planejamento Inteligente/i)).toBeInTheDocument();
    expect(screen.getByText(/Flashcards e Revisões/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulados e Análise/i)).toBeInTheDocument();
  });

  /**
   * **Validates: Requirements 1.3**
   * 
   * WHEN a user clicks the subscription button, THE Landing_Page SHALL
   * navigate to the Checkout_Page.
   */
  it('navigates to checkout page when CTA button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Find and click the first CTA button
    const ctaButton = screen.getAllByRole('button', { name: /assinar agora/i })[0];
    await user.click(ctaButton);

    // Verify navigation was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/checkout');
  });

  /**
   * **Validates: Requirements 1.2**
   * 
   * The Landing Page SHALL include a call-to-action button for subscription.
   */
  it('renders multiple CTA buttons for better conversion', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Check that there are multiple CTA buttons (hero + bottom section)
    const ctaButtons = screen.getAllByRole('button', { name: /assinar agora|começar agora/i });
    expect(ctaButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('displays trust badge with immediate access message', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Acesso imediato após o pagamento/i)).toBeInTheDocument();
  });

  it('displays footer with copyright information', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/© 2024 Foco ENEM/i)).toBeInTheDocument();
  });
});
