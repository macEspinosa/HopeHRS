import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

// IMPORT YOUR ACTUAL COMPONENTS (update these paths!)
import RegistrationForm from '../components/RegistrationForm';
import GoogleOAuthButton from '../components/GoogleOAuthButton';
import LoginGuard from '../components/LoginGuard';

describe('Authentication Tests', () => {
  
  it('email registration form submits correctly', async () => {
    const mockSubmit = vi.fn();
    render(<RegistrationForm onSubmit={mockSubmit} />);
    
    // Adjust these selectors based on your actual form
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /submit|register|sign up/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'Password123');
    await userEvent.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('Google OAuth button renders', () => {
    render(<GoogleOAuthButton />);
    const googleButton = screen.getByRole('button', { name: /google/i });
    expect(googleButton).toBeInTheDocument();
  });

  it('login guard blocks INACTIVE user', () => {
    const inactiveUser = { status: 'INACTIVE' };
    render(
      <LoginGuard user={inactiveUser}>
        <div>Protected Content</div>
      </LoginGuard>
    );
    
    const protectedContent = screen.queryByText(/protected content/i);
    expect(protectedContent).not.toBeInTheDocument();
  });

  it('login guard allows ACTIVE user', () => {
    const activeUser = { status: 'ACTIVE' };
    render(
      <LoginGuard user={activeUser}>
        <div>Protected Content</div>
      </LoginGuard>
    );
    
    const protectedContent = screen.getByText(/protected content/i);
    expect(protectedContent).toBeInTheDocument();
  });
});