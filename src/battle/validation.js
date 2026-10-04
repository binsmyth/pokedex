import { TYPE_CHART } from '../data/typeChart';

const isPositiveNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * Validate a single move
 *
 * @param {Object} move - Move { name, power, type }
 * @param {string} label - Prefix used in error messages
 * @returns {string[]} Error messages (empty if valid)
 */
export function validateMove(move, label) {
  if (!move || typeof move !== 'object') return [`${label}: move is missing`];

  const errors = [];
  if (typeof move.name !== 'string' || !move.name) errors.push(`${label}: name is missing`);
  if (!isPositiveNumber(move.power)) errors.push(`${label}: power must be a positive number`);
  if (!TYPE_CHART[move.type]) errors.push(`${label}: unknown type "${move.type}"`);
  return errors;
}

/**
 * Validate a pokemon before it enters battle
 *
 * @param {string} name - Pokemon name, used in error messages
 * @param {Object} pokemon - Pokemon { hp, attack, defense, speed, types, moves }
 * @returns {string[]} Error messages (empty if valid)
 */
export function validatePokemon(name, pokemon) {
  if (!pokemon) return [`${name}: not found in the roster`];

  const errors = [];

  ['hp', 'attack', 'defense', 'speed'].forEach(stat => {
    if (!isPositiveNumber(pokemon[stat])) errors.push(`${name}: ${stat} must be a positive number`);
  });

  if (!Array.isArray(pokemon.types) || pokemon.types.length < 1 || pokemon.types.length > 2) {
    errors.push(`${name}: must have one or two types`);
  } else {
    pokemon.types
      .filter(type => !TYPE_CHART[type])
      .forEach(type => errors.push(`${name}: unknown type "${type}"`));
  }

  if (!Array.isArray(pokemon.moves) || pokemon.moves.length === 0) {
    errors.push(`${name}: must have at least one move`);
  } else {
    pokemon.moves.forEach((move, i) => {
      errors.push(...validateMove(move, `${name} move ${i + 1}`));
    });
  }

  return errors;
}
