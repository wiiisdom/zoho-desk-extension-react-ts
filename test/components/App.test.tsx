import { render, screen, waitFor } from '@testing-library/react';
import App from '../../src/components/App';
import { describe, it, expect, vi } from 'vitest';

const ZohoDeskMock = {
  get: vi.fn().mockResolvedValue({ 'ticket.email': 'user@example.com' }),
  extension: {
    onload: vi.fn().mockResolvedValue({})
  }
};

vi.stubGlobal('ZOHODESK', ZohoDeskMock);

describe('test App', () => {
  it('rest rendering', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('content')).toHaveTextContent(
        'Email: user@example.com'
      );
    });
  });
});
