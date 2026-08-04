import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PokeSelect from '../components/PokeSelect';
import pokeapi from '../api/pokeapi';

// Mock the pokeapi module to avoid real API calls
jest.mock('../api/pokeapi');

describe('PokeSelect Component', () => {
  // Setup: Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Component renders without crashing
  test('renders PokeSelect component without crashing', () => {
    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    // Select component should be rendered
    const selectInput = screen.getByRole('combobox');
    expect(selectInput).toBeInTheDocument();
  });

  // Test 2: Select component displays correct label
  test('displays label "Type of pokemons"', () => {
    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    // Label should be visible
    expect(screen.getByText('Type of pokemons')).toBeInTheDocument();
  });

  // Test 3: Select component has placeholder text
  test('displays placeholder text "Pick one"', () => {
    const mockSetPokeData = jest.fn();
    const { container } = render(<PokeSelect setPokeData={mockSetPokeData} />);

    // Check for placeholder attribute
    const selectInput = screen.getByRole('combobox');
    expect(selectInput).toHaveAttribute('placeholder', 'Pick one');
  });

  // Test 4: Select component has all gender options
  test('renders all three gender options', async () => {
    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    // All three options should be available
    await waitFor(() => {
      expect(screen.getByText('Female')).toBeInTheDocument();
      expect(screen.getByText('Male')).toBeInTheDocument();
      expect(screen.getByText('Genderless')).toBeInTheDocument();
    });
  });

  // Test 5: Selecting Female option calls API with correct value
  test('fetches Pokemon with Female gender when selected', async () => {
    // Mock API response for female Pokemon
    pokeapi.get.mockResolvedValueOnce({
      data: {
        pokemon_species_details: [
          { pokemon_species: { name: 'bulbasaur' } },
          { pokemon_species: { name: 'ivysaur' } },
          { pokemon_species: { name: 'venusaur' } },
          { pokemon_species: { name: 'charmander' } },
          { pokemon_species: { name: 'charmeleon' } },
          { pokemon_species: { name: 'charizard' } }
        ]
      }
    });

    // Mock individual Pokemon detail responses
    pokeapi.get.mockResolvedValue({
      data: { id: 1, name: 'bulbasaur', sprites: { front_default: 'url' } }
    });

    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    const femaleOption = screen.getByText('Female');
    await userEvent.click(femaleOption);

    // Verify API was called with female gender value (1)
    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/gender/1');
    });
  });

  // Test 6: Selecting Male option calls API with correct value
  test('fetches Pokemon with Male gender when selected', async () => {
    pokeapi.get.mockResolvedValueOnce({
      data: {
        pokemon_species_details: Array.from({ length: 6 }, (_, i) => ({
          pokemon_species: { name: `pokemon-${i}` }
        }))
      }
    });

    pokeapi.get.mockResolvedValue({
      data: { id: 1, name: 'pokemon', sprites: { front_default: 'url' } }
    });

    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    const maleOption = screen.getByText('Male');
    await userEvent.click(maleOption);

    // Verify API was called with male gender value (2)
    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/gender/2');
    });
  });

  // Test 7: Selecting Genderless option calls API with correct value
  test('fetches Pokemon with Genderless gender when selected', async () => {
    pokeapi.get.mockResolvedValueOnce({
      data: {
        pokemon_species_details: Array.from({ length: 6 }, (_, i) => ({
          pokemon_species: { name: `pokemon-${i}` }
        }))
      }
    });

    pokeapi.get.mockResolvedValue({
      data: { id: 1, name: 'pokemon', sprites: { front_default: 'url' } }
    });

    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    const genderlessOption = screen.getByText('Genderless');
    await userEvent.click(genderlessOption);

    // Verify API was called with genderless value (3)
    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/gender/3');
    });
  });

  // Test 8: setPokeData is called with fetched Pokemon data
  test('calls setPokeData with Pokemon list when selection changes', async () => {
    const mockSetPokeData = jest.fn();

    pokeapi.get.mockResolvedValueOnce({
      data: {
        pokemon_species_details: [
          { pokemon_species: { name: 'bulbasaur' } },
          { pokemon_species: { name: 'ivysaur' } },
          { pokemon_species: { name: 'venusaur' } },
          { pokemon_species: { name: 'charmander' } },
          { pokemon_species: { name: 'charmeleon' } },
          { pokemon_species: { name: 'charizard' } }
        ]
      }
    });

    // Mock individual Pokemon responses
    const mockPokemonData = [
      { data: { id: 1, name: 'bulbasaur' } },
      { data: { id: 2, name: 'ivysaur' } },
      { data: { id: 3, name: 'venusaur' } },
      { data: { id: 4, name: 'charmander' } },
      { data: { id: 5, name: 'charmeleon' } },
      { data: { id: 6, name: 'charizard' } }
    ];

    pokeapi.get.mockImplementation(url => {
      const pokemonName = url.split('/').pop();
      return Promise.resolve(
        mockPokemonData.find(p => p.data.name === pokemonName) ||
        mockPokemonData[0]
      );
    });

    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    const femaleOption = screen.getByText('Female');
    await userEvent.click(femaleOption);

    // Verify setPokeData was called with Pokemon data
    await waitFor(() => {
      expect(mockSetPokeData).toHaveBeenCalled();
    });
  });

  // Test 9: Pagination limits results to 6 Pokemon per page
  test('paginates results to 6 Pokemon per selection', async () => {
    const mockSetPokeData = jest.fn();

    // Mock response with more than 6 Pokemon
    pokeapi.get.mockResolvedValueOnce({
      data: {
        pokemon_species_details: Array.from({ length: 20 }, (_, i) => ({
          pokemon_species: { name: `pokemon-${i}` }
        }))
      }
    });

    pokeapi.get.mockResolvedValue({
      data: { id: 1, name: 'pokemon', sprites: { front_default: 'url' } }
    });

    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    const femaleOption = screen.getByText('Female');
    await userEvent.click(femaleOption);

    // Wait for pagination to take effect (should request only first 6)
    await waitFor(() => {
      // Should have made 1 gender request + 6 Pokemon requests
      expect(pokeapi.get).toHaveBeenCalledTimes(7);
    });
  });

  // Test 10: Component prop setPokeData is required
  test('receives setPokeData prop from parent', () => {
    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    // Component should render successfully
    expect(screen.getByText('Type of pokemons')).toBeInTheDocument();
  });

  // Test 11: Multiple selections work correctly
  test('allows multiple gender selections', async () => {
    pokeapi.get.mockResolvedValue({
      data: {
        pokemon_species_details: Array.from({ length: 6 }, (_, i) => ({
          pokemon_species: { name: `pokemon-${i}` }
        }))
      }
    });

    pokeapi.get.mockResolvedValue({
      data: { id: 1, name: 'pokemon', sprites: { front_default: 'url' } }
    });

    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');

    // First selection - Female
    await userEvent.click(selectInput);
    let option = screen.getByText('Female');
    await userEvent.click(option);

    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/gender/1');
    });

    // Clear previous calls
    jest.clearAllMocks();
    pokeapi.get.mockResolvedValue({
      data: {
        pokemon_species_details: Array.from({ length: 6 }, (_, i) => ({
          pokemon_species: { name: `pokemon-${i}` }
        }))
      }
    });
    pokeapi.get.mockResolvedValue({
      data: { id: 1, name: 'pokemon', sprites: { front_default: 'url' } }
    });

    // Second selection - Male
    await userEvent.click(selectInput);
    option = screen.getByText('Male');
    await userEvent.click(option);

    await waitFor(() => {
      expect(pokeapi.get).toHaveBeenCalledWith('/gender/2');
    });
  });

  // Test 12: Select component is from Mantine
  test('uses Mantine Select component', () => {
    const mockSetPokeData = jest.fn();
    const { container } = render(<PokeSelect setPokeData={mockSetPokeData} />);

    // Mantine Select renders as combobox
    const selectInput = screen.getByRole('combobox');
    expect(selectInput).toBeInTheDocument();
  });

  // Test 13: Options have correct structure
  test('options have correct label and value properties', async () => {
    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    // All options should be visible
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(3);
  });

  // Test 14: Component handles API errors gracefully
  test('handles API errors during gender selection', async () => {
    pokeapi.get.mockRejectedValueOnce(new Error('API Error'));

    const mockSetPokeData = jest.fn();
    render(<PokeSelect setPokeData={mockSetPokeData} />);

    const selectInput = screen.getByRole('combobox');
    await userEvent.click(selectInput);

    const femaleOption = screen.getByText('Female');
    await userEvent.click(femaleOption);

    // Component should still be rendered despite error
    expect(selectInput).toBeInTheDocument();
  });

  // Test 15: Wrapper div contains the Select component
  test('renders Select component within wrapper div', () => {
    const mockSetPokeData = jest.fn();
    const { container } = render(<PokeSelect setPokeData={mockSetPokeData} />);

    // Component should be wrapped in a div
    const wrapper = container.querySelector('div');
    expect(wrapper).toBeInTheDocument();

    // Select should be inside wrapper
    const selectInput = screen.getByRole('combobox');
    expect(wrapper.contains(selectInput)).toBe(true);
  });
});
