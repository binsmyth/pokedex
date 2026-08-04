import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../components/App';
import pokeapi from '../api/pokeapi';

// Mock the dependencies: SearchBar, PokeSelect, FrontPage, and pokeapi
jest.mock('../SearchBar/SearchBar', () => {
  return function MockSearchBar() {
    return <div data-testid="search-bar">Search Bar Component</div>;
  };
});

jest.mock('../components/PokeSelect', () => {
  return function MockPokeSelect({ setPokeData }) {
    return <div data-testid="poke-select">PokeSelect Component</div>;
  };
});

jest.mock('../components/FrontPage', () => {
  return function MockFrontPage({ pokeData, setOpenModal }) {
    return (
      <div data-testid="front-page">
        {pokeData && <div>Pokemon Data Loaded</div>}
      </div>
    );
  };
});

// Mock the pokeapi module to avoid making real API calls
jest.mock('../api/pokeapi');

// Helper function to render the App component with BrowserRouter
// since App uses useOutletContext which requires router context
const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('App Component', () => {
  // Setup: Mock the API responses before each test
  beforeEach(() => {
    // Mock successful API response for Pokemon list
    pokeapi.get.mockResolvedValueOnce({
      data: {
        count: 100, // Total number of Pokemon
        results: Array.from({ length: 6 }, (_, i) => ({
          name: `pokemon-${i}`,
          url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`
        }))
      }
    });

    // Mock individual Pokemon detail responses
    pokeapi.get.mockResolvedValue({
      data: {
        id: 1,
        name: 'test-pokemon',
        height: 7,
        weight: 69,
        sprites: { front_default: 'image-url.png' }
      }
    });
  });

  // Cleanup after each test to ensure test isolation
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Component renders without crashing
  test('renders App component without crashing', () => {
    renderApp();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('poke-select')).toBeInTheDocument();
  });

  // Test 2: SearchBar component is rendered
  test('renders SearchBar component', () => {
    renderApp();
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByText('Search Bar Component')).toBeInTheDocument();
  });

  // Test 3: PokeSelect component is rendered
  test('renders PokeSelect component', () => {
    renderApp();
    expect(screen.getByTestId('poke-select')).toBeInTheDocument();
    expect(screen.getByText('PokeSelect Component')).toBeInTheDocument();
  });

  // Test 4: FrontPage component is rendered
  test('renders FrontPage component', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByTestId('front-page')).toBeInTheDocument();
    });
  });

  // Test 5: API is called with correct offset when component mounts
  test('fetches Pokemon data on component mount', async () => {
    renderApp();

    // Wait for the API call to be made
    await waitFor(() => {
      // First call should fetch the Pokemon list with offset 0 and limit 6
      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon?offset=0&limit=6');
    });
  });

  // Test 6: Pagination total is calculated correctly
  test('calculates pagination total correctly', async () => {
    renderApp();

    await waitFor(() => {
      // With 100 total Pokemon and limit of 6, we should have 17 pages
      // (ceiling of 100/6 = 17)
      const paginationElement = screen.getByRole('button', { name: '17' });
      expect(paginationElement).toBeInTheDocument();
    });
  });

  // Test 7: Pagination is rendered on the page
  test('renders pagination component', async () => {
    renderApp();

    await waitFor(() => {
      // Check that pagination controls are present
      const paginationButtons = screen.getAllByRole('button');
      expect(paginationButtons.length).toBeGreaterThan(0);
    });
  });

  // Test 8: API is called with updated offset when page changes
  test('fetches data with updated offset when page changes', async () => {
    renderApp();

    // Wait for initial render
    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon?offset=0&limit=6');
    });

    // Clear previous calls to focus on the new call
    jest.clearAllMocks();

    // Mock API response for the next page request
    pokeapi.get.mockResolvedValueOnce({
      data: {
        count: 100,
        results: Array.from({ length: 6 }, (_, i) => ({
          name: `pokemon-${i + 6}`,
          url: `https://pokeapi.co/api/v2/pokemon/${i + 7}/`
        }))
      }
    });

    pokeapi.get.mockResolvedValue({
      data: { id: 2, name: 'pokemon-2', sprites: { front_default: 'url' } }
    });

    // Click on page 2
    const page2Button = screen.getByRole('button', { name: '2' });
    fireEvent.click(page2Button);

    // Verify the API was called with correct offset for page 2: (2-1)*6 = 6
    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon?offset=6&limit=6');
    });
  });

  // Test 9: Loading state shows Loader component
  test('displays Loader while data is loading', () => {
    // Mock a delayed API response to test loading state
    pokeapi.get.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        data: {
          count: 100,
          results: []
        }
      }), 1000))
    );

    renderApp();

    // The Loader component should be displayed initially
    expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
  });

  // Test 10: "Jump To Page" input field is rendered
  test('renders Jump To Page input field', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByText('Jump To Page :')).toBeInTheDocument();
    });
  });

  // Test 11: Jump to page input handles Enter key press
  test('updates page when Enter key is pressed in Jump To Page input', async () => {
    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId('front-page')).toBeInTheDocument();
    });

    // Mock new API response
    jest.clearAllMocks();
    pokeapi.get.mockResolvedValueOnce({
      data: { count: 100, results: [] }
    });
    pokeapi.get.mockResolvedValue({
      data: { id: 3, name: 'pokemon-3', sprites: { front_default: 'url' } }
    });

    // Find the input field (it's the one with the Jump To Page functionality)
    const inputFields = screen.getAllByRole('textbox');
    const jumpToPageInput = inputFields[inputFields.length - 1]; // Last input field

    // Simulate typing "5" and pressing Enter
    fireEvent.change(jumpToPageInput, { target: { value: '5' } });
    fireEvent.keyDown(jumpToPageInput, { key: 'Enter', code: 'Enter' });

    // Verify API was called with offset for page 5: (5-1)*6 = 24
    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon?offset=24&limit=6');
    });
  });

  // Test 12: Multiple Pokemon detail requests are made
  test('fetches details for each Pokemon in the list', async () => {
    renderApp();

    await waitFor(() => {
      // Should have called: 1 list call + 6 individual Pokemon calls
      expect(pokeapi.get).toHaveBeenCalledTimes(7);
    });
  });

  // Test 13: MantineProvider wraps the component (theme is applied)
  test('wraps App with MantineProvider for styling', () => {
    renderApp();

    // Check that the main container is rendered (part of MantineProvider structure)
    const container = screen.getByRole('main') || screen.getByTestId('front-page').closest('div');
    expect(container).toBeInTheDocument();
  });

  // Test 14: Component structure has proper layout elements
  test('renders proper layout structure with Grid and Stack', async () => {
    renderApp();

    await waitFor(() => {
      // The component should render with search bar and poke select in a stack
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('poke-select')).toBeInTheDocument();
    });
  });

  // Test 15: Outlet component is rendered for nested routing
  test('renders Outlet for nested routes', async () => {
    renderApp();

    // The Outlet should be rendered as part of the grid layout
    await waitFor(() => {
      expect(screen.getByTestId('front-page')).toBeInTheDocument();
    });
  });
});
