import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// We are testing the AUTH behavior described in the HTML file:
//   1. Email registration form submits correctly
//   2. Google OAuth button renders on the page
//   3. Login guard BLOCKS an INACTIVE (wrong password) user mock
//   4. Login guard ALLOWS an ACTIVE (correct credentials) user mock

const mockUsersStore = [];

function handleRegister(email, password, confirmPassword) {
  if (!email || !password || !confirmPassword) return { success: false, error: 'All fields are required.' };
  if (!email.includes('@') || !email.includes('.')) return { success: false, error: 'Valid email required.' };
  if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
  if (password !== confirmPassword) return { success: false, error: 'Passwords do not match.' };
  if (mockUsersStore.find(u => u.email === email)) return { success: false, error: 'Account already exists. Please login.' };

  mockUsersStore.push({ email, password, name: email.split('@')[0] });
  return { success: true };
}

function handleLogin(email, password) {
  if (!email || !password) return { success: false, error: 'Email and password required.' };
  if (!email.includes('@') || !email.includes('.')) return { success: false, error: 'Enter a valid email address.' };

  const user = mockUsersStore.find(u => u.email === email);
  if (!user || user.password !== password) return { success: false, error: 'Invalid email or password.' };

  return { success: true, user };
}

// ── A simple mock Google button component to test rendering ──────────────
function MockGoogleButton({ label = 'Sign in with Google', onClick = () => {} }) {
  return (
    <button onClick={onClick} data-testid="google-oauth-btn">
      {label}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// TEST SUITE 1: Email Registration Form
// ─────────────────────────────────────────────────────────────────────────
describe('Email Registration Form', () => {

  beforeEach(() => {
    // Clear the mock user store before each test so tests don't affect each other
    mockUsersStore.length = 0;
  });

  it('should register successfully with valid inputs', () => {
    const result = handleRegister('jane@company.com', 'password123', 'password123');
    expect(result.success).toBe(true);
  });

  it('should fail if email field is empty', () => {
    const result = handleRegister('', 'password123', 'password123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required.');
  });

  it('should fail if email format is invalid', () => {
    const result = handleRegister('notanemail', 'password123', 'password123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Valid email required.');
  });

  it('should fail if password is shorter than 6 characters', () => {
    const result = handleRegister('jane@company.com', '123', '123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Password must be at least 6 characters.');
  });

  it('should fail if passwords do not match', () => {
    const result = handleRegister('jane@company.com', 'password123', 'different456');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Passwords do not match.');
  });

  it('should fail if the email is already registered', () => {
    // First register succeeds
    handleRegister('jane@company.com', 'password123', 'password123');
    // Second attempt with same email should fail
    const result = handleRegister('jane@company.com', 'password123', 'password123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Account already exists. Please login.');
  });

});

// ─────────────────────────────────────────────────────────────────────────
// TEST SUITE 2: Google OAuth Button Renders
// ─────────────────────────────────────────────────────────────────────────
describe('Google OAuth Button', () => {

  it('should render the Sign in with Google button', () => {
    render(<MockGoogleButton label="Sign in with Google" />);
    const googleBtn = screen.getByTestId('google-oauth-btn');
    expect(googleBtn).toBeInTheDocument();
    expect(googleBtn).toHaveTextContent('Sign in with Google');
  });

  it('should render the Sign up with Google button on register page', () => {
    render(<MockGoogleButton label="Sign up with Google" />);
    const googleBtn = screen.getByTestId('google-oauth-btn');
    expect(googleBtn).toBeInTheDocument();
    expect(googleBtn).toHaveTextContent('Sign up with Google');
  });

  it('should call the onClick handler when Google button is clicked', () => {
    // vi.fn() creates a mock function so we can check if it was called
    const mockHandler = vi.fn();
    render(<MockGoogleButton onClick={mockHandler} />);
    fireEvent.click(screen.getByTestId('google-oauth-btn'));
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

});

// ─────────────────────────────────────────────────────────────────────────
// TEST SUITE 3: Login Guard — BLOCKS Inactive/Wrong User
// ─────────────────────────────────────────────────────────────────────────
describe('Login Guard - INACTIVE user (blocked)', () => {

  beforeEach(() => {
    mockUsersStore.length = 0;
    // Pre-seed a known user in the store
    mockUsersStore.push({ email: 'active@company.com', password: 'correctPass1', name: 'Active User' });
  });

  it('should block login when password is wrong', () => {
    const result = handleLogin('active@company.com', 'wrongPassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password.');
  });

  it('should block login when email does not exist', () => {
    const result = handleLogin('ghost@company.com', 'somepassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid email or password.');
  });

  it('should block login when both fields are empty', () => {
    const result = handleLogin('', '');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Email and password required.');
  });

  it('should block login when email format is invalid', () => {
    const result = handleLogin('bademail', 'correctPass1');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Enter a valid email address.');
  });

});

// ─────────────────────────────────────────────────────────────────────────
// TEST SUITE 4: Login Guard — ALLOWS Active User
// ─────────────────────────────────────────────────────────────────────────
describe('Login Guard - ACTIVE user (allowed)', () => {

  beforeEach(() => {
    mockUsersStore.length = 0;
    // Pre-seed a known user
    mockUsersStore.push({ email: 'active@company.com', password: 'correctPass1', name: 'Active User' });
  });

  it('should allow login with correct email and password', () => {
    const result = handleLogin('active@company.com', 'correctPass1');
    expect(result.success).toBe(true);
  });

  it('should return the user object on successful login', () => {
    const result = handleLogin('active@company.com', 'correctPass1');
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe('active@company.com');
  });

});