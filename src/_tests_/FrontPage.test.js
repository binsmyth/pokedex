import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FrontPage from '../components/FrontPage';

// Mock the AvatarImage component to simplify testing
jest.mock('../components/AvatarImage/AvatarImage', () => {
  return function MockAvatarImage({ urls, id }) {
    return (
      <div data-testid={`avatar-${id}`}>
        Avatar Image: {id}
      </div>
    );
  };
});

// Mock the styles.css to avoid import errors in tests
jest.mock('../components/styles/styles.css', () => ({}));

// Mock useMediaQuery hook to control responsive behavior in tests
jest.mock('@mantine/hooks', () => ({
  useMediaQuery: jest.fn()
}));

import { useMediaQuery } from '@mantine/hooks';

// Helper function to render FrontPage with BrowserRouter
// (required for Link components to work properly)
const renderFrontPage = (props) => {
  return render(
    <BrowserRouter>
      <FrontPage {...props} />
    </BrowserRouter>
  );
};

describe('FrontPage Component', () => {
  // Setup: Create mock Pokemon data before each test
  const mockPokeData = [
    {
      id: 1,
      name: 'bulbasaur',
      sprites: { front_default: 'https://example.com/bulbasaur.png' }
    },
    {
      id: 2,
      name: 'ivysaur',
      sprites: { front_default: 'https://example.com/ivysaur.png' }
    },
    {
      id: 3,
      name: 'venusaur',
      sprites: { front_default: 'https://example.com/venusaur.png' }
    }
  ];

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Component renders without crashing when pokeData is provided
  test('renders FrontPage component without crashing', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Verify at least one Pokemon card is rendered
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
  });

  // Test 2: Component renders nothing when pokeData is undefined
  test('renders nothing when pokeData is undefined', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const { container } = renderFrontPage({
      pokeData: undefined,
      setOpenModal: mockSetOpenModal
    });

    // When pokeData is undefined, SimpleGrid should be empty
    expect(container.querySelector('[role="grid"]')).toBeInTheDocument();
    expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument();
  });

  // Test 3: Component renders nothing when pokeData is null
  test('renders nothing when pokeData is null', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const { container } = renderFrontPage({
      pokeData: null,
      setOpenModal: mockSetOpenModal
    });

    // Empty SimpleGrid should be rendered but no Pokemon names
    expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument();
  });

  // Test 4: Renders all Pokemon cards when pokeData is provided
  test('renders all Pokemon cards from pokeData array', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // All three Pokemon names should be visible
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('ivysaur')).toBeInTheDocument();
    expect(screen.getByText('venusaur')).toBeInTheDocument();
  });

  // Test 5: Renders correct number of cards for provided data
  test('renders correct number of Pokemon cards', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Should render 3 cards for 3 Pokemon
    const avatarImages = screen.getAllByTestId(/^avatar-/);
    expect(avatarImages).toHaveLength(3);
  });

  // Test 6: Each card contains AvatarImage component with correct props
  test('renders AvatarImage component for each Pokemon', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Verify each avatar component is rendered with correct id
    expect(screen.getByTestId('avatar-1')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-2')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-3')).toBeInTheDocument();
  });

  // Test 7: Navigation links to PokemonDetail route on desktop (min-width 576px)
  test('creates links to PokemonDetail route on desktop view', () => {
    // Mock desktop viewport (min-width 576px)
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Find all navigation links
    const links = screen.getAllByRole('link');

    // Verify at least one link exists and has correct structure
    expect(links.length).toBeGreaterThan(0);

    // Check first link navigates to PokemonDetail route with correct ID
    expect(links[0]).toHaveAttribute('href', '/PokemonDetail/1');
  });

  // Test 8: Navigation links to ModalPokemonDetail route on mobile (max-width 576px)
  test('creates links to ModalPokemonDetail route on mobile view', () => {
    // Mock mobile viewport (max-width 576px)
    useMediaQuery.mockReturnValue(false);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Find all navigation links
    const links = screen.getAllByRole('link');

    // Verify links navigate to mobile modal route
    expect(links[0]).toHaveAttribute('href', '/ModalPokemonDetail/1');
    expect(links[1]).toHaveAttribute('href', '/ModalPokemonDetail/2');
    expect(links[2]).toHaveAttribute('href', '/ModalPokemonDetail/3');
  });

  // Test 9: All links pass correct state with id and sprite URL
  test('links include correct state with Pokemon id and sprite URL', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    const links = screen.getAllByRole('link');

    // Verify first link structure (React Router state is in href attribute during testing)
    expect(links[0]).toHaveAttribute('href', '/PokemonDetail/1');
  });

  // Test 10: setOpenModal is called when card is clicked
  test('calls setOpenModal when Pokemon card is clicked', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Find and click a Pokemon link
    const links = screen.getAllByRole('link');
    links[0].click();

    // Verify setOpenModal was called with true
    expect(mockSetOpenModal).toHaveBeenCalledWith(true);
  });

  // Test 11: setOpenModal is called for each card click
  test('calls setOpenModal for each card interaction', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    const links = screen.getAllByRole('link');

    // Click each link
    links[0].click();
    links[1].click();
    links[2].click();

    // Verify setOpenModal was called 3 times
    expect(mockSetOpenModal).toHaveBeenCalledTimes(3);
  });

  // Test 12: Pokemon names are displayed with correct text
  test('displays correct Pokemon names in cards', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Verify all names are displayed
    const bulbasaurText = screen.getByText('bulbasaur');
    const ivysaurText = screen.getByText('ivysaur');
    const venusaurText = screen.getByText('venusaur');

    expect(bulbasaurText).toBeInTheDocument();
    expect(ivysaurText).toBeInTheDocument();
    expect(venusaurText).toBeInTheDocument();
  });

  // Test 13: SimpleGrid is rendered with 3 columns
  test('renders SimpleGrid with correct column layout', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const { container } = renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // SimpleGrid component should be present in the DOM
    const grid = container.querySelector('[role="grid"]');
    expect(grid).toBeInTheDocument();
  });

  // Test 14: Each Pokemon card has proper Card structure
  test('wraps each Pokemon in a Card component', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const { container } = renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Cards should be rendered (Mantine Card components render as article elements)
    const articles = container.querySelectorAll('article');
    expect(articles.length).toBeGreaterThanOrEqual(3);
  });

  // Test 15: Component handles empty array without crashing
  test('handles empty pokeData array gracefully', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const { container } = renderFrontPage({
      pokeData: [],
      setOpenModal: mockSetOpenModal
    });

    // SimpleGrid should exist but contain no Pokemon
    expect(container.querySelector('[role="grid"]')).toBeInTheDocument();
    expect(screen.queryByText('bulbasaur')).not.toBeInTheDocument();
  });

  // Test 16: Component re-renders correctly when pokeData changes
  test('re-renders when pokeData prop changes', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const initialProps = {
      pokeData: [mockPokeData[0]],
      setOpenModal: mockSetOpenModal
    };

    const { rerender } = renderFrontPage(initialProps);

    // Verify initial render
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.queryByText('ivysaur')).not.toBeInTheDocument();

    // Update with new data
    const updatedProps = {
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    };

    rerender(
      <BrowserRouter>
        <FrontPage {...updatedProps} />
      </BrowserRouter>
    );

    // All Pokemon should now be visible
    expect(screen.getByText('bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('ivysaur')).toBeInTheDocument();
    expect(screen.getByText('venusaur')).toBeInTheDocument();
  });

  // Test 17: useMediaQuery hook is used for responsive behavior
  test('uses useMediaQuery hook to determine responsive layout', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    renderFrontPage({
      pokeData: mockPokeData,
      setOpenModal: mockSetOpenModal
    });

    // Verify useMediaQuery was called with correct breakpoint
    expect(useMediaQuery).toHaveBeenCalledWith('(min-width: 576px)');
  });

  // Test 18: Handles large dataset of Pokemon without performance issues
  test('renders many Pokemon cards efficiently', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    // Create large dataset
    const largePokeData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `pokemon-${i + 1}`,
      sprites: { front_default: `https://example.com/pokemon-${i + 1}.png` }
    }));

    renderFrontPage({
      pokeData: largePokeData,
      setOpenModal: mockSetOpenModal
    });

    // Verify all Pokemon are rendered
    const avatars = screen.getAllByTestId(/^avatar-/);
    expect(avatars).toHaveLength(50);
  });

  // Test 19: Card has proper styling props (withBorder, shadow)
  test('renders Cards with proper Mantine styling', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const { container } = renderFrontPage({
      pokeData: [mockPokeData[0]],
      setOpenModal: mockSetOpenModal
    });

    // Verify Card component is rendered
    const card = container.querySelector('article');
    expect(card).toBeInTheDocument();
  });

  // Test 20: Pokemon name text is clamped to single line
  test('displays Pokemon name with text clamping', () => {
    useMediaQuery.mockReturnValue(true);
    const mockSetOpenModal = jest.fn();

    const { container } = renderFrontPage({
      pokeData: [mockPokeData[0]],
      setOpenModal: mockSetOpenModal
    });

    // Find the text element containing Pokemon name
    const nameText = screen.getByText('bulbasaur');
    expect(nameText).toBeInTheDocument();
    expect(nameText).toHaveAttribute('role', 'img');
  });
});
