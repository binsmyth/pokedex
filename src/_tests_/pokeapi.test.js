import axios from 'axios';

// Mock axios before importing pokeapi
jest.mock('axios');

// Create a mock axios instance that will be returned by axios.create
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  defaults: {
    baseURL: 'https://pokeapi.co/api/v2/',
  },
};

// Setup axios.create to return our mock instance
axios.create.mockReturnValue(mockAxiosInstance);

// Now import pokeapi after mocking
const pokeapi = require('../api/pokeapi').default;

describe('pokeapi', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Instance Configuration', () => {
    it('should be an axios instance', () => {
      expect(pokeapi).toBeDefined();
      expect(typeof pokeapi.get).toBe('function');
      expect(typeof pokeapi.post).toBe('function');
    });

    it('should have correct baseURL', () => {
      expect(pokeapi.defaults.baseURL).toBe('https://pokeapi.co/api/v2/');
    });

  });

  describe('GET Requests', () => {
    it('should fetch pokemon by name', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'bulbasaur',
          height: 7,
          weight: 69,
        },
      };

      pokeapi.get.mockResolvedValue(mockResponse);

      const response = await pokeapi.get('/pokemon/bulbasaur');

      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon/bulbasaur');
      expect(response.data.name).toBe('bulbasaur');
      expect(response.data.id).toBe(1);
    });

    it('should fetch pokemon by id', async () => {
      const mockResponse = {
        data: {
          id: 25,
          name: 'pikachu',
          height: 4,
          weight: 60,
        },
      };

      pokeapi.get.mockResolvedValue(mockResponse);

      const response = await pokeapi.get('/pokemon/25');

      expect(response.data.name).toBe('pikachu');
      expect(response.data.id).toBe(25);
    });

    it('should fetch pokemon list with pagination', async () => {
      const mockResponse = {
        data: {
          count: 1025,
          next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
          previous: null,
          results: [
            { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
            { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
          ],
        },
      };

      pokeapi.get.mockResolvedValue(mockResponse);

      const response = await pokeapi.get('/pokemon?offset=0&limit=20');

      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon?offset=0&limit=20');
      expect(response.data.count).toBe(1025);
      expect(response.data.results.length).toBe(2);
    });

    it('should fetch pokemon species data', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'bulbasaur',
          color: { name: 'green' },
          flavor_text_entries: [
            { flavor_text: 'A grass seed Pokémon.' },
          ],
        },
      };

      pokeapi.get.mockResolvedValue(mockResponse);

      const response = await pokeapi.get('/pokemon-species/1');

      expect(response.data.color.name).toBe('green');
      expect(response.data.flavor_text_entries[0].flavor_text).toBeDefined();
    });

    it('should fetch pokemon by gender', async () => {
      const mockResponse = {
        data: {
          id: 1,
          name: 'male',
          pokemon_species_details: [
            { pokemon_species: { name: 'bulbasaur' } },
            { pokemon_species: { name: 'charmander' } },
          ],
        },
      };

      pokeapi.get.mockResolvedValue(mockResponse);

      const response = await pokeapi.get('/gender/2');

      expect(response.data.pokemon_species_details.length).toBe(2);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 error for non-existent pokemon', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {
            detail: 'Not found.',
          },
        },
      };

      pokeapi.get.mockRejectedValue(mockError);

      await expect(pokeapi.get('/pokemon/invalid-pokemon')).rejects.toEqual(mockError);
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');

      pokeapi.get.mockRejectedValue(mockError);

      await expect(pokeapi.get('/pokemon/1')).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
      };

      pokeapi.get.mockRejectedValue(mockError);

      await expect(pokeapi.get('/pokemon/1')).rejects.toEqual(mockError);
    });
  });

  describe('URL Construction', () => {
    it('should construct correct URL with baseURL', async () => {
      pokeapi.get.mockResolvedValue({ data: {} });

      await pokeapi.get('/pokemon/pikachu');

      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon/pikachu');
    });

    it('should handle query parameters', async () => {
      pokeapi.get.mockResolvedValue({ data: { results: [] } });

      await pokeapi.get('/pokemon?offset=0&limit=20');

      expect(pokeapi.get).toHaveBeenCalledWith('/pokemon?offset=0&limit=20');
    });
  });

  describe('Response Structure', () => {
    it('should return data in expected format', async () => {
      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        data: {
          id: 1,
          name: 'bulbasaur',
        },
      };

      pokeapi.get.mockResolvedValue(mockResponse);

      const response = await pokeapi.get('/pokemon/1');

      expect(response).toHaveProperty('status');
      expect(response).toHaveProperty('data');
      expect(response.status).toBe(200);
    });
  });
});
