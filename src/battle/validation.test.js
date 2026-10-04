import { validateMove, validatePokemon } from './validation';
import { POKEMON_CATALOG } from '../data/pokemonCatalog';

const validPokemon = () => ({
  hp: 100, attack: 50, defense: 50, speed: 50, types: ['Fire'],
  moves: [{ name: 'Ember', power: 40, type: 'Fire' }]
});

describe('validatePokemon', () => {
  test.each(Object.entries(POKEMON_CATALOG))('%s in the roster is valid', (name, pokemon) => {
    expect(validatePokemon(name, pokemon)).toEqual([]);
  });

  test('reports a missing pokemon', () => {
    expect(validatePokemon('Missingno', undefined)).toEqual(['Missingno: not found in the roster']);
  });

  test.each(['hp', 'attack', 'defense', 'speed'])('rejects a non-positive or non-numeric %s', (stat) => {
    [0, -5, '50', NaN, Infinity, undefined].forEach(value => {
      expect(validatePokemon('Test', { ...validPokemon(), [stat]: value }))
        .toEqual([`Test: ${stat} must be a positive number`]);
    });
  });

  test('requires one or two types', () => {
    const error = ['Test: must have one or two types'];
    expect(validatePokemon('Test', { ...validPokemon(), types: [] })).toEqual(error);
    expect(validatePokemon('Test', { ...validPokemon(), types: ['Fire', 'Water', 'Grass'] })).toEqual(error);
    expect(validatePokemon('Test', { ...validPokemon(), types: 'Fire' })).toEqual(error);
  });

  test('rejects unknown types', () => {
    expect(validatePokemon('Test', { ...validPokemon(), types: ['Fire', 'Lava'] }))
      .toEqual(['Test: unknown type "Lava"']);
  });

  test('requires at least one move', () => {
    expect(validatePokemon('Test', { ...validPokemon(), moves: [] })).toEqual(['Test: must have at least one move']);
    expect(validatePokemon('Test', { ...validPokemon(), moves: undefined })).toEqual(['Test: must have at least one move']);
  });

  test('reports every problem at once, numbering moves from 1', () => {
    const errors = validatePokemon('Test', {
      ...validPokemon(),
      hp: 0,
      moves: [{ name: 'Ember', power: 40, type: 'Fire' }, { name: 'Splash', power: 0, type: 'Water' }]
    });
    expect(errors).toEqual(['Test: hp must be a positive number', 'Test move 2: power must be a positive number']);
  });
});

describe('validateMove', () => {
  test('accepts a valid move', () => {
    expect(validateMove({ name: 'Ember', power: 40, type: 'Fire' }, 'm')).toEqual([]);
  });

  test('reports a missing move', () => {
    expect(validateMove(null, 'm')).toEqual(['m: move is missing']);
  });

  test('reports each bad field', () => {
    expect(validateMove({ name: '', power: -1, type: 'Lava' }, 'm')).toEqual([
      'm: name is missing',
      'm: power must be a positive number',
      'm: unknown type "Lava"'
    ]);
  });
});
