import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutPage from '../components/CheckoutPage';

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('CheckoutPage - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCheckoutPage = () => {
    return render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    );
  };

  describe('Email Input Rendering', () => {
    it('should render email input field', () => {
      /**
       * **Validates: Requirement 2.1**
       * Test that the checkout page provides an email input field
       */
      renderCheckoutPage();
      
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      expect(emailInput).toBeDefined();
      expect(emailInput.getAttribute('type')).toBe('email');
    });

    it('should render submit button', () => {
      /**
       * **Validates: Requirement 2.1**
       * Test that the checkout page provides a submit button
       */
      renderCheckoutPage();
      
      const submitButton = screen.getByRole('button', { name: /ir para pagamento/i });
      expect(submitButton).toBeDefined();
    });

    it('should render pricing information', () => {
      /**
       * **Validates: Requirement 12.1**
       * Test that the checkout page displays product pricing
       */
      renderCheckoutPage();
      
      const price = screen.getByText(/29/);
      expect(price).toBeDefined();
      
      const currency = screen.getByText(/R\$/);
      expect(currency).toBeDefined();
    });
  });

  describe('Email Validation', () => {
    it('should show error for invalid email on blur', async () => {
      /**
       * **Validates: Requirements 2.2, 2.3**
       * Test that invalid email format displays error message
       */
      renderCheckoutPage();
      
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      
      // Enter invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/por favor, insira um email válido/i);
        expect(errorMessage).toBeDefined();
      });
    });

    it('should not show error for valid email on blur', async () => {
      /**
       * **Validates: Requirement 2.2**
       * Test that valid email format does not display error message
       */
      renderCheckoutPage();
      
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      
      // Enter valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        const errorMessage = screen.queryByText(/por favor, insira um email válido/i);
        expect(errorMessage).toBeNull();
      });
    });

    it('should show error when submitting empty email', async () => {
      /**
       * **Validates: Requirements 2.2, 2.3**
       * Test that empty email displays error message on submit
       */
      renderCheckoutPage();
      
      const submitButton = screen.getByRole('button', { name: /ir para pagamento/i });
      
      // Submit without entering email
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/email é obrigatório/i);
        expect(errorMessage).toBeDefined();
      });
    });

    it('should prevent submission with invalid email', async () => {
      /**
       * **Validates: Requirement 2.3**
       * Test that invalid email prevents payment initiation
       */
      renderCheckoutPage();
      
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      const submitButton = screen.getByRole('button', { name: /ir para pagamento/i });
      
      // Enter invalid email and submit
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      
      // Submit the form
      const form = submitButton.closest('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/por favor, insira um email válido/i);
        expect(errorMessage).toBeDefined();
      });
    });

    it('should clear error when user corrects email', async () => {
      /**
       * **Validates: Requirement 2.3**
       * Test that error message clears when user enters valid email
       */
      renderCheckoutPage();
      
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      
      // Enter invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(screen.getByText(/por favor, insira um email válido/i)).toBeDefined();
      });
      
      // Correct the email
      fireEvent.change(emailInput, { target: { value: 'valid@example.com' } });
      
      await waitFor(() => {
        const errorMessage = screen.queryByText(/por favor, insira um email válido/i);
        expect(errorMessage).toBeNull();
      });
    });
  });

  describe('Submit Button State', () => {
    it('should disable submit button when email has error', async () => {
      /**
       * **Validates: Requirement 2.3**
       * Test that submit button is disabled when email is invalid
       */
      renderCheckoutPage();
      
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      const submitButton = screen.getByRole('button', { name: /ir para pagamento/i });
      
      // Enter invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);
      
      await waitFor(() => {
        expect(submitButton.hasAttribute('disabled')).toBe(true);
      });
    });

    it('should show loading state during submission', async () => {
      /**
       * **Validates: Requirement 2.4**
       * Test that loading state is displayed during payment preference creation
       */
      renderCheckoutPage();
      
      const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
      const submitButton = screen.getByRole('button', { name: /ir para pagamento/i });
      
      // Enter valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const loadingText = screen.getByText(/processando/i);
        expect(loadingText).toBeDefined();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to landing page when back button is clicked', () => {
      /**
       * **Validates: User experience requirement**
       * Test that back button navigates to landing page
       */
      renderCheckoutPage();
      
      const backButton = screen.getByRole('button', { name: /voltar/i });
      fireEvent.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Trust Badges', () => {
    it('should display security trust badges', () => {
      /**
       * **Validates: User experience requirement**
       * Test that security indicators are displayed
       */
      renderCheckoutPage();
      
      const securePayment = screen.getByText(/pagamento seguro/i);
      const immediateAccess = screen.getByText(/acesso imediato/i);
      
      expect(securePayment).toBeDefined();
      expect(immediateAccess).toBeDefined();
    });

    it('should display Mercado Pago footer text', () => {
      /**
       * **Validates: User experience requirement**
       * Test that payment processor information is displayed
       */
      renderCheckoutPage();
      
      const footer = screen.getByText(/processado com segurança pelo mercado pago/i);
      expect(footer).toBeDefined();
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper label for email input', () => {
      /**
       * **Validates: Accessibility requirement**
       * Test that email input has accessible label
       */
      renderCheckoutPage();
      
      const label = screen.getByText(/^email$/i);
      expect(label).toBeDefined();
    });

    it('should have proper button text for screen readers', () => {
      /**
       * **Validates: Accessibility requirement**
       * Test that submit button has descriptive text
       */
      renderCheckoutPage();
      
      const submitButton = screen.getByRole('button', { name: /ir para pagamento/i });
      expect(submitButton).toBeDefined();
    });
  });
});
