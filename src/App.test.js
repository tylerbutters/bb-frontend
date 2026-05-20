import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the initial add button', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
});
