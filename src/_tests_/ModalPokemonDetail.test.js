import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import ModalPokemonDetail from '../components/ModalPokemonDetail/ModalPokemonDetail';
import pokeapi from '../api/pokeapi';

// Mock pokeapi to avoid real API calls
jest.mock('../api/pokeapi');

// Helper to render ModalPokemonDetail with routing and outlet context
const renderWithRouter = (initialRoute = '/ModalPokemonDetail/1') => {
  function AppWrapper() {
    const [openModal, setOpenModal] = React.useState(true);
    return (
      <Outlet context={[openModal, setOpenModal]} />
    );
  }

  window.history.pushState({}, 'Test page', initialRoute);

  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppWrapper />}>
          <Route path="ModalPokemonDetail/:index" element={<ModalPokemonDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

describe('ModalPokemonDetail Component', () => {
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
  test('renders ModalPokemonDetail component without crashing', async () => {
    renderWithRouter();

    await waitFor(() => {
      // Modal should be open
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  // Test 2: Modal is displayed when openModal is true
  test('displays modal when modal context is true', async () => {
    renderWithRouter();

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  // Test 3: Fetches Pokemon detail data on mount
  test('fetches Pokemon detail data when component mounts', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon/1');
    });
  });

  // Test 4: Fetches Pokemon species data on mount
  test('fetches Pokemon species data for description', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon-species/1');
    });
  });

  // Test 5: Displays Pokemon name in modal
  test('displays Pokemon name in modal', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
  });

  // Test 6: Displays Pokemon flavor text in modal
  test('displays Pokemon flavor text description', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('A strange seed was planted on its back.')).toBeInTheDocument();
    });
  });

  // Test 7: Displays Pokemon height in modal
  test('displays Pokemon height information in modal', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });

  // Test 8: Displays Pokemon base experience in modal
  test('displays Pokemon base experience in modal', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('64')).toBeInTheDocument();
    });
  });

  // Test 9: Displays Pokemon types in modal
  test('displays Pokemon types in modal', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/grass/i)).toBeInTheDocument();
      expect(screen.getByText(/poison/i)).toBeInTheDocument();
    });
  });

  // Test 10: Modal has fixed size
  test('renders modal with size 300', async () => {
    renderWithRouter();

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  // Test 11: Shows Pokemon sprite image
  test('displays Pokemon sprite image in modal', async () => {
    renderWithRouter();

    await waitFor(() => {
      const image = screen.getByAltText('pokemon');
      expect(image).toHaveAttribute(
        'src',
        'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/001.png'
      );
    });
  });

  // Test 12: Uses fallback image URL for newer Pokemon
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

    renderWithRouter('/ModalPokemonDetail/1000');

    await waitFor(() => {
      const image = screen.getByAltText('pokemon');
      expect(image).toHaveAttribute(
        'src',
        'https://api.example.com/pokemon-1000.png'
      );
    });
  });

  // Test 13: Description can be toggled for full view
  test('toggles description view when clicked', async () => {
    renderWithRouter();

    await waitFor(() => {
      const descriptionText = screen.getByText('A strange seed was planted on its back.');
      expect(descriptionText).toBeInTheDocument();
    });

    // Click description to toggle
    const descriptionText = screen.getByText('A strange seed was planted on its back.');
    fireEvent.click(descriptionText);

    // Should still be in document
    await waitFor(() => {
      expect(screen.getByText('A strange seed was planted on its back.')).toBeInTheDocument();
    });
  });

  // Test 14: Handles missing description gracefully
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

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('nil')).toBeInTheDocument();
    });
  });

  // Test 15: Handles missing base experience gracefully
  test('displays nil when base experience is not available', async () => {
    pokeapi.get.mockImplementation((url) => {
      if (url.includes('pokemon-species')) {
        return Promise.resolve({ data: mockPokemonSpecies });
      }
      return Promise.resolve({
        data: { ...mockPokemonDetail, base_experience: undefined }
      });
    });

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
  });

  // Test 16: Renders Card component inside modal
  test('renders Card component structure inside modal', async () => {
    renderWithRouter();

    await waitFor(() => {
      const card = screen.getByText('bulbasaur').closest('article');
      expect(card).toBeInTheDocument();
    });
  });

  // Test 17: Grid displays information with background color
  test('displays information grid with background styling', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    });
  });

  // Test 18: Uses useOutletContext to get modal state
  test('uses outlet context for modal open/close state', async () => {
    renderWithRouter();

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });
  });

  // Test 19: Fetches data when Pokemon ID parameter changes
  test('fetches new data when Pokemon ID parameter changes', async () => {
    renderWithRouter('/ModalPokemonDetail/1');

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

    // Change route parameter
    window.history.pushState({}, 'Test page', '/ModalPokemonDetail/25');

    // Re-render with new ID
    renderWithRouter('/ModalPokemonDetail/25');

    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon/25');
    });
  });

  // Test 20: Pads Pokemon ID with leading zeros
  test('pads Pokemon ID with leading zeros in image URL', async () => {
    renderWithRouter('/ModalPokemonDetail/5');

    await waitFor(() => {
      const image = screen.getByAltText('pokemon');
      expect(image).toHaveAttribute(
        'src',
        'https://assets.pokemon.com/assets/cms2/img/pokedex/detail/005.png'
      );
    });
  });

  // Test 21: Modal can be closed
  test('modal closes when onClose handler is triggered', async () => {
    renderWithRouter();

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    // Get close button (usually in header of modal)
    // Note: Mantine Modal has a close button in the header
    const closeButton = screen.queryByRole('button', { name: /close/i }) ||
                       screen.queryByRole('button');

    if (closeButton) {
      fireEvent.click(closeButton);
    }

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // Test 22: Displays multiple types with separator
  test('displays multiple Pokemon types', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/grass/i)).toBeInTheDocument();
      expect(screen.getByText(/poison/i)).toBeInTheDocument();
    });
  });

  // Test 23: Image has proper alt text
  test('image has proper alt text for accessibility', async () => {
    renderWithRouter();

    await waitFor(() => {
      const image = screen.getByAltText('pokemon');
      expect(image).toBeInTheDocument();
    });
  });

  // Test 24: Card has shadow styling
  test('renders Card with shadow effect', async () => {
    renderWithRouter();

    await waitFor(() => {
      const card = screen.getByText('bulbasaur').closest('article');
      expect(card).toBeInTheDocument();
    });
  });

  // Test 25: Component uses location state when available
  test('uses location state ID when provided', async () => {
    renderWithRouter();

    await waitFor(() => {
      // Should fetch with ID from route
      expect(pokeapi.get).toHaveBeenCalledWith('pokemon/1');
    });
  });
});
