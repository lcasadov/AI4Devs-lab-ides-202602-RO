import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders LTI login page by default when not authenticated', () => {
  render(<App />);
  // When not authenticated, the app redirects to /login and shows the login form
  expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
});
