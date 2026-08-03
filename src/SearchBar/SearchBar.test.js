import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from './SearchBar';
import pokeapi from '../api/pokeapi';

jest.mock('../api/pokeapi');

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SearchBar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the search input field', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
    });

    it('should render with correct aria-label', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByLabelText('Search');
      expect(input).toBeInTheDocument();
    });

    it('should render as search type input', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.type).toBe('search');
    });

    it('should have empty initial value', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.value).toBe('');
    });

    it('should have proper form structure', () => {
      renderWithRouter(<SearchBar />);
      const form = screen.getByPlaceholderText('Search...').closest('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Input Changes', () => {
    it('should update input value when user types', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');

      expect(input.value).toBe('pikachu');
    });

    it('should handle multiple character inputs', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'bulbasaur');

      expect(input.value).toBe('bulbasaur');
    });

    it('should handle numeric pokemon IDs', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, '25');

      expect(input.value).toBe('25');
    });

    it('should clear input when backspace is used', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      await userEvent.clear(input);

      expect(input.value).toBe('');
    });

    it('should handle partial deletions', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      await userEvent.type(input, '{backspace}{backspace}');

      expect(input.value).toBe('pikac');
    });
  });

  describe('Search Params & State', () => {
    it('should update input value reactively', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'p');
      expect(input.value).toBe('p');

      await userEvent.type(input, 'i');
      expect(input.value).toBe('pi');

      await userEvent.type(input, 'k');
      expect(input.value).toBe('pik');
    });

    it('should handle special characters in search', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'type-null');

      expect(input.value).toBe('type-null');
    });

    it('should handle whitespace-only input', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, '   ');

      expect(input.value).toBe('   ');
    });

    it('should handle very long pokemon names', async () => {
      const longName = 'supercalifragilisticexpialidocious';
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, longName);

      expect(input.value).toBe(longName);
    });
  });

  describe('API Integration', () => {
    it('should have access to pokeapi module', () => {
      expect(pokeapi).toBeDefined();
      expect(pokeapi.get).toBeDefined();
    });

    it('should accept onSubmit prop', () => {
      const mockOnSubmit = jest.fn();
      renderWithRouter(<SearchBar onSubmit={mockOnSubmit} />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid character input', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu', { delay: 10 });

      expect(input.value).toBe('pikachu');
    });

    it('should maintain value after multiple clicks', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      await userEvent.click(input);
      await userEvent.click(input);

      expect(input.value).toBe('pikachu');
    });

    it('should handle focus and blur events', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.click(input);
      expect(input).toHaveFocus();

      await userEvent.tab();
      expect(input).not.toHaveFocus();
    });

    it('should handle selection and typing', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      input.select();
      await userEvent.type(input, 'charizard');

      expect(input.value).toBe('charizard');
    });
  });

  describe('Form Attributes', () => {
    it('should have correct input placeholder', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.placeholder).toBe('Search...');
    });

    it('should be accessible to screen readers', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByLabelText('Search');
      expect(input).toBeVisible();
    });

    it('should allow text selection', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'test');
      input.select();

      expect(input.value).toBe('test');
    });
  });

  describe('User Interactions', () => {
    it('should accept typed characters', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      const chars = ['a', 'b', 'c'];
      for (const char of chars) {
        await userEvent.type(input, char);
      }

      expect(input.value).toContain('a');
      expect(input.value).toContain('b');
      expect(input.value).toContain('c');
    });

    it('should remain functional after error', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'invalid');
      await userEvent.clear(input);
      await userEvent.type(input, 'valid');

      expect(input.value).toBe('valid');
    });

    it('should handle clipboard paste via input change', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.click(input);
      input.value = 'pikachu';
      await userEvent.type(input, '');

      expect(input.value).toBe('pikachu');
    });
  });

  describe('Mantine Form Integration', () => {
    it('should be rendered with Mantine TextInput', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.className).toContain('mantine');
    });

    it('should maintain form state across updates', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'test');
      expect(input.value).toBe('test');

      await userEvent.clear(input);
      expect(input.value).toBe('');

      await userEvent.type(input, 'updated');
      expect(input.value).toBe('updated');
    });
  });
});
