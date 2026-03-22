import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders LTI application title', () => {
  render(<App />);
  const title = screen.getByText(/LTI — Applicant Tracking System/i);
  expect(title).toBeInTheDocument();
});
