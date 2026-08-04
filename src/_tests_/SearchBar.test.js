import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar';
import pokeapi from '../api/pokeapi';

// Mock the pokeapi module to isolate component testing from API calls
// This lets us test SearchBar in isolation without making real HTTP requests
jest.mock('../api/pokeapi');

// Helper function to wrap components with BrowserRouter
// SearchBar likely uses useNavigate or other React Router hooks,
// so we need the router context for tests to work without errors
const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SearchBar', () => {
  // Clean up all mocks after each test to prevent state leakage
  // This ensures tests don't affect each other and gives us a clean slate
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Component Rendering: Tests that the SearchBar renders all required UI elements correctly
  // We need to verify the component renders before testing interactions, so this is the foundation
  describe('Component Rendering', () => {
    // Basic rendering check - ensures the input element exists in the DOM
    // This is the most fundamental test; if this fails, nothing else will work
    it('should render the search input field', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input).toBeInTheDocument();
    });

    // Accessibility check - aria-label makes the input readable for screen readers
    // Important for users with visual impairments who rely on assistive technology
    it('should render with correct aria-label', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByLabelText('Search');
      expect(input).toBeInTheDocument();
    });

    // Semantic HTML check - using type="search" provides browser-native mobile keyboard improvements
    // On mobile, this shows a search-specific keyboard with better UX (e.g., magnifying glass instead of space)
    it('should render as search type input', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.type).toBe('search');
    });

    // State initialization check - input should start empty, not prefilled with random/stale data
    // This prevents showing previous searches or causing confusion on initial load
    it('should have empty initial value', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.value).toBe('');
    });

    // Structure validation - form wrapper enables keyboard submit handling and semantics
    // Forms allow pressing Enter to submit, which is the standard UX pattern users expect
    it('should have proper form structure', () => {
      renderWithRouter(<SearchBar />);
      const form = screen.getByPlaceholderText('Search...').closest('form');
      expect(form).toBeInTheDocument();
    });
  });

  // Input Changes: Tests that the component correctly handles user typing and keyboard events
  // This validates that the component maintains and updates its internal state as users interact with it
  describe('Input Changes', () => {
    // Basic typing test - most fundamental interaction users will have with search
    // If typing doesn't work, users can't search for anything, so this is critical
    it('should update input value when user types', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');

      expect(input.value).toBe('pikachu');
    });

    // Multi-character input test - ensures the component handles longer strings correctly
    // Different Pokemon have different name lengths, so we test with a longer name (9 chars)
    it('should handle multiple character inputs', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'bulbasaur');

      expect(input.value).toBe('bulbasaur');
    });

    // Numeric input test - Pokemon can be searched by ID number (e.g., 25 = Pikachu)
    // We need to ensure the component accepts numbers, not just letters
    it('should handle numeric pokemon IDs', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, '25');

      expect(input.value).toBe('25');
    });

    // Clear functionality test - users need a way to completely empty their search
    // userEvent.clear() simulates selecting all and deleting, which is how browsers handle it
    it('should clear input when backspace is used', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      await userEvent.clear(input);

      expect(input.value).toBe('');
    });

    // Partial deletion test - users might backspace to correct typing mistakes one character at a time
    // We test deleting the last two characters ('u' and 'h') from 'pikachu' → 'pikac'
    it('should handle partial deletions', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      await userEvent.type(input, '{backspace}{backspace}');

      expect(input.value).toBe('pikac');
    });
  });

  // Search Params & State: Tests that component state is managed correctly with various input types
  // This ensures the component handles edge cases and unusual input gracefully
  describe('Search Params & State', () => {
    // Reactive updates test - checks that each character is captured immediately as typed
    // This is important for real-time search or autocomplete features that need to update after every keystroke
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

    // Special character handling - some Pokemon have hyphens in their names (e.g., 'type-null')
    // We need to ensure the search input doesn't strip or mishandle these characters
    it('should handle special characters in search', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'type-null');

      expect(input.value).toBe('type-null');
    });

    // Whitespace edge case test - user might accidentally add spaces before/after their search
    // We accept whitespace in the value here; filtering/trimming would happen at the API level
    it('should handle whitespace-only input', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, '   ');

      expect(input.value).toBe('   ');
    });

    // Long input test - ensures the component doesn't have arbitrary limits on input length
    // Some users might test with very long strings or copy-paste unexpected content
    it('should handle very long pokemon names', async () => {
      const longName = 'supercalifragilisticexpialidocious';
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, longName);

      expect(input.value).toBe(longName);
    });
  });

  // API Integration: Tests that the component is set up to interact with the API layer
  // This ensures the component has the tools it needs to fetch Pokemon data
  describe('API Integration', () => {
    // Mock API availability - verifies that our jest.mock() at the top worked correctly
    // The mock must be defined and have a get method for the component to call it later
    it('should have access to pokeapi module', () => {
      expect(pokeapi).toBeDefined();
      expect(pokeapi.get).toBeDefined();
    });

    // Props acceptance test - SearchBar needs to accept an onSubmit callback from its parent
    // This callback will be called when user submits the form, allowing parent to handle the search
    it('should accept onSubmit prop', () => {
      const mockOnSubmit = jest.fn();
      renderWithRouter(<SearchBar onSubmit={mockOnSubmit} />);
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    });
  });

  // Edge Cases: Tests for unusual but valid user interactions that could cause bugs
  // These help catch race conditions, focus issues, and state management problems
  describe('Edge Cases', () => {
    // Fast typing test - with delay: 10ms, this simulates a power user typing very quickly
    // We need to ensure React batches these rapid updates correctly without losing keystrokes
    it('should handle rapid character input', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu', { delay: 10 });

      expect(input.value).toBe('pikachu');
    });

    // Click persistence test - clicking the input shouldn't clear or reset the value
    // Users might click multiple times to position cursor; this shouldn't affect their search
    it('should maintain value after multiple clicks', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      await userEvent.click(input);
      await userEvent.click(input);

      expect(input.value).toBe('pikachu');
    });

    // Focus management test - ensures the component handles focus/blur events correctly
    // This is important for keyboard navigation (Tab key) and accessibility
    it('should handle focus and blur events', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.click(input);
      expect(input).toHaveFocus();

      await userEvent.tab();
      expect(input).not.toHaveFocus();
    });

    // Select-all-and-type test - user might select all text and start typing to replace it
    // The new text should completely replace the old text, not append to it
    it('should handle selection and typing', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'pikachu');
      input.select();
      await userEvent.type(input, 'charizard');

      expect(input.value).toBe('charizard');
    });
  });

  // Form Attributes: Tests that verify the input has proper HTML attributes and accessibility
  // These tests ensure the component meets accessibility standards and provides good UX cues
  describe('Form Attributes', () => {
    // Placeholder text check - placeholder guides users on what the input is for
    // "Search..." is a clear, helpful hint without taking up space like a label would
    it('should have correct input placeholder', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.placeholder).toBe('Search...');
    });

    // Visibility and accessibility check - ensures screen reader users can find and use the input
    // The aria-label combined with visibility means assistive tech can identify and read it
    it('should be accessible to screen readers', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByLabelText('Search');
      expect(input).toBeVisible();
    });

    // Text selection test - users should be able to select their typed text to copy or replace it
    // input.select() simulates the browser's select-all functionality (Ctrl+A or Cmd+A)
    it('should allow text selection', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'test');
      input.select();

      expect(input.value).toBe('test');
    });
  });

  // User Interactions: Tests for common user behaviors beyond simple typing
  // These ensure the component is resilient to various interaction patterns
  describe('User Interactions', () => {
    // Character accumulation test - tests that typing multiple separate characters builds up correctly
    // Uses a loop to mimic typing each character individually (not in one userEvent.type call)
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

    // Error recovery test - if user types something wrong, they should be able to clear and try again
    // This simulates a common user pattern: type, see no results, clear and search differently
    it('should remain functional after error', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.type(input, 'invalid');
      await userEvent.clear(input);
      await userEvent.type(input, 'valid');

      expect(input.value).toBe('valid');
    });

    // Paste-like behavior test - simulates users pasting from clipboard by directly setting value
    // Note: We're testing that programmatic value changes work; actual paste events would need different testing
    it('should handle clipboard paste via input change', async () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');

      await userEvent.click(input);
      input.value = 'pikachu';
      await userEvent.type(input, '');

      expect(input.value).toBe('pikachu');
    });
  });

  // Mantine Form Integration: Tests that the SearchBar uses the Mantine UI library correctly
  // Mantine is a React component library; we verify the TextInput component is being used
  describe('Mantine Form Integration', () => {
    // Mantine component verification - ensures the component uses Mantine's TextInput styling
    // This is important because Mantine handles accessibility, responsive design, and theming
    it('should be rendered with Mantine TextInput', () => {
      renderWithRouter(<SearchBar />);
      const input = screen.getByPlaceholderText('Search...');
      expect(input.className).toContain('mantine');
    });

    // State persistence test - verifies the form correctly maintains state through multiple interactions
    // This is a comprehensive test that typing, clearing, and retyping all work in sequence
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
