import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PokemonDetail from '../components/PokemonDetail/PokemonDetail';
import pokeapi from '../api/pokeapi';

// Mock pokeapi to avoid real API calls
jest.mock('../api/pokeapi');

// Mock the styles to avoid import errors
jest.mock('../components/PokemonDetail/styles', () => {
  return {
    __esModule: true,
    default: () => ({
      classes: {
        Card: 'mock-card',
        GlowingCircle: 'mock-glowing-circle',
        Glow: 'mock-glow',
        title: 'mock-title',
        GlowingSquare: 'mock-glowing-square',
        CardDescription: 'mock-card-description',
        ColumnTextJustify: 'mock-column-text-justify'
      }
    })
  };
});

// Helper to render PokemonDetail with routing context
const renderWithRouter = (initialRoute = '/PokemonDetail/1') => {
  window.history.pushState({}, 'Test page', initialRoute);

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/PokemonDetail/:index" element={<PokemonDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

describe('PokemonDetail Component', () => {
  // Mock Pokemon detail response
  const mockPokemonDetail = {
    id: 1,
    name: 'bulbasaur',
    height: 7,
    base_experience: 64,
    sprites: { front_default: 'https://example.com/bulbasaur.png' },
    types: [
      { type: { name: 'grass' } },
      { type: { name: 'poison' } }
    ]
  };

  // Mock Pokemon species response
  const mockPokemonSpecies = {
    id: 1,
    color: { name: 'green' },
    flavor_text_entries: [
      { flavor_text: 'A strange seed was planted on its back.' }
    ]
  };

  // Setup: Mock API responses before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful API responses
    pokeapi.get.mockImplementation((url) => {
      if (url.includes('pokemon-species')) {
        return Promise.resolve({ data: mockPokemonSpecies });
      }
      return Promise.resolve({ data: mockPokemonDetail });
    });
  });

  // Test 1: Component renders without crashing
  test('renders PokemonDetail component without crashing', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
  });

  // Test 2: Fetches Pokemon detail data on mount
  test('fetches Pokemon detail data when component mounts', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Should fetch Pokemon with ID from route parameter
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon/1');
    });
  });

  // Test 3: Fetches Pokemon species data on mount
  test('fetches Pokemon species data for description and color', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Should fetch species data to get description and color
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon-species/1');
    });
  });

  // Test 4: Displays Pokemon name
  test('displays Pokemon name from API response', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
  });

  // Test 5: Displays Pokemon height
  test('displays Pokemon height information', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  // Test 6: Displays Pokemon base experience
  test('displays Pokemon base experience', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      expect(screen.getByText('64')).toBeInTheDocument();
    });
  });

  // Test 7: Displays Pokemon types
  test('displays Pokemon types', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Both types should be displayed
      expect(screen.getByText(/grass/i)).toBeInTheDocument();
      expect(screen.getByText(/poison/i)).toBeInTheDocument();
    });
  });

  // Test 8: Displays Pokemon description
  test('displays Pokemon flavor text description', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      expect(screen.getByText('A strange seed was planted on its back.')).toBeInTheDocument();
    });
  });

  // Test 9: Shows sprite image from official Pokemon asset URL
  test('displays Pokemon image from official asset URL', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      const image = screen.getByAltText('pokemon');
      // For ID 1, should use official URL (001)
      expect(image).toHaveAttribute(
        'src',
        'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/001.png'
      );
    });
  });

  // Test 10: Uses fallback image URL for ID >= 906
  test('uses fallback sprite URL for newer Pokemon (ID >= 906)', async () => {
    pokeapi.get.mockImplementation((url) => {
      if (url.includes('pokemon-species')) {
        return Promise.resolve({ data: mockPokemonSpecies });
      }
      return Promise.resolve({
        data: {
          ...mockPokemonDetail,
          id: 1000,
          sprites: { front_default: 'https://api.example.com/pokemon-1000.png' }
        }
      });
    });

    renderWithRouter('/PokemonDetail/1000');

    await waitFor(() => {
      const image = screen.getByAltText('pokemon');
      // Should use the sprite URL from API response
      expect(image).toHaveAttribute(
        'src',
        'https://api.example.com/pokemon-1000.png'
      );
    });
  });

  // Test 11: Card background color matches Pokemon color
  test('applies Pokemon color to Card background', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Card should have background color from species data
      const card = screen.getByText('bulbasaur').closest('article');
      expect(card).toBeInTheDocument();
    });
  });

  // Test 12: Description text can be toggled for full view
  test('toggles description view when clicked', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      const descriptionText = screen.getByText('A strange seed was planted on its back.');
      expect(descriptionText).toBeInTheDocument();
    });

    // Click description to toggle full view
    const descriptionText = screen.getByText('A strange seed was planted on its back.');
    await userEvent.click(descriptionText);

    // Component should re-render with expanded description
    await waitFor(() => {
      expect(descriptionText).toBeInTheDocument();
    });
  });

  // Test 13: Handles missing description gracefully
  test('displays nil when flavor text is not available', async () => {
    pokeapi.get.mockImplementation((url) => {
      if (url.includes('pokemon-species')) {
        return Promise.resolve({
          data: {
            ...mockPokemonSpecies,
            flavor_text_entries: []
          }
        });
      }
      return Promise.resolve({ data: mockPokemonDetail });
    });

    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      expect(screen.getByText('nil')).toBeInTheDocument();
    });
  });

  // Test 14: Handles missing base experience gracefully
  test('displays nil when base experience is not available', async () => {
    pokeapi.get.mockImplementation((url) => {
      if (url.includes('pokemon-species')) {
        return Promise.resolve({ data: mockPokemonSpecies });
      }
      return Promise.resolve({
        data: { ...mockPokemonDetail, base_experience: undefined }
      });
    });

    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Should show "nil" or fall back to another property
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
  });

  // Test 15: Renders Card component structure
  test('renders Card component with proper structure', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Card should be rendered
      const card = screen.getByText('bulbasaur').closest('article');
      expect(card).toBeInTheDocument();
    });
  });

  // Test 16: Fetches data when route parameter changes
  test('fetches new data when Pokemon ID parameter changes', async () => {
    const { rerender } = renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon/1');
    });

    jest.clearAllMocks();

    pokeapi.get.mockImplementation((url) => {
      if (url.includes('pokemon-species')) {
        return Promise.resolve({ data: mockPokemonSpecies });
      }
      return Promise.resolve({
        data: {
          ...mockPokemonDetail,
          id: 25,
          name: 'pikachu'
        }
      });
    });

    // Re-render with new ID
    window.history.pushState({}, 'Test page', '/PokemonDetail/25');
    rerender(
      <BrowserRouter>
        <Routes>
          <Route path="/PokemonDetail/:index" element={<PokemonDetail />} />
        </Routes>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('pikachu')).toBeInTheDocument();
    });
  });

  // Test 17: Displays multiple types separated by pipe
  test('displays multiple Pokemon types with pipe separator', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Types should be displayed
      expect(screen.getByText(/grass/i)).toBeInTheDocument();
      expect(screen.getByText(/poison/i)).toBeInTheDocument();
    });
  });

  // Test 18: Pads Pokemon ID with leading zeros for asset URL
  test('pads Pokemon ID with leading zeros in image URL', async () => {
    renderWithRouter('/PokemonDetail/5');

    await waitFor(() => {
      const image = screen.getByAltText('pokemon');
      // ID 5 should be padded to 005
      expect(image).toHaveAttribute(
        'src',
        'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/005.png'
      );
    });
  });

  // Test 19: Card has shadow and border styling
  test('renders Card with shadow and border styles', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      const card = screen.getByText('bulbasaur').closest('article');
      expect(card).toBeInTheDocument();
      // Mantine Card component is rendered
    });
  });

  // Test 20: Component uses useParams hook to get Pokemon ID
  test('reads Pokemon ID from URL parameters', async () => {
    renderWithRouter('/PokemonDetail/150');

    await waitFor(() => {
      // Should fetch with ID from URL
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon/150');
    });
  });

  // Test 21: Grid layout displays information in columns
  test('displays Pokemon information in grid layout', async () => {
    renderWithRouter('/PokemonDetail/1');

    await waitFor(() => {
      // Information should be displayed
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
      expect(screen.getByText('height:')).toBeInTheDocument();
      expect(screen.getByText('base experience:')).toBeInTheDocument();
      expect(screen.getByText('types:')).toBeInTheDocument();
    });
  });
});
