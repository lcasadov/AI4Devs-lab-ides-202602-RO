import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders LTI login page by default when not authenticated', () => {
  render(<App />);
  // When not authenticated, the app redirects to /login and shows the LoginPage title
  const title = screen.getByRole('heading', { name: /^LTI$/i });
  expect(title).toBeInTheDocument();
});
