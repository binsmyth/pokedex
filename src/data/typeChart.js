/**
 * Complete Pokémon Type Chart - All 18 Types
 * Each type defines: what it's strong against, weak to, resists, and is immune to
 */
export const TYPE_CHART = {
  'Normal': {
    weak: ['Fighting'],
    strong: [],
    resist: [],
    immune: ['Ghost']
  },
  'Fire': {
    weak: ['Water', 'Ground', 'Rock'],
    strong: ['Grass', 'Bug', 'Steel', 'Ice', 'Fairy'],
    resist: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'],
    immune: []
  },
  'Water': {
    weak: ['Electric', 'Grass'],
    strong: ['Fire', 'Ground', 'Rock'],
    resist: ['Fire', 'Water', 'Ice', 'Steel'],
    immune: []
  },
  'Electric': {
    weak: ['Ground'],
    strong: ['Water', 'Flying'],
    resist: ['Electric', 'Flying', 'Steel'],
    immune: []
  },
  'Grass': {
    weak: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'],
    strong: ['Water', 'Ground', 'Rock'],
    resist: ['Ground', 'Water', 'Grass', 'Electric'],
    immune: []
  },
  'Ice': {
    weak: ['Fire', 'Fighting', 'Rock', 'Steel'],
    strong: ['Flying', 'Ground', 'Grass', 'Dragon'],
    resist: ['Ice'],
    immune: []
  },
  'Fighting': {
    weak: ['Flying', 'Psychic', 'Fairy'],
    strong: ['Normal', 'Ice', 'Rock', 'Dark', 'Steel'],
    resist: ['Rock', 'Bug', 'Dark'],
    immune: []
  },
  'Poison': {
    weak: ['Ground', 'Psychic'],
    strong: ['Grass', 'Fairy'],
    resist: ['Fighting', 'Poison', 'Bug', 'Grass', 'Fairy'],
    immune: []
  },
  'Ground': {
    weak: ['Water', 'Grass', 'Ice'],
    strong: ['Fire', 'Electric', 'Poison', 'Rock', 'Steel'],
    resist: ['Poison', 'Rock'],
    immune: ['Electric']
  },
  'Flying': {
    weak: ['Electric', 'Ice', 'Rock'],
    strong: ['Fighting', 'Bug', 'Grass'],
    resist: ['Fighting', 'Bug', 'Grass'],
    immune: ['Ground']
  },
  'Psychic': {
    weak: ['Bug', 'Ghost', 'Dark'],
    strong: ['Fighting', 'Poison'],
    resist: ['Fighting', 'Psychic'],
    immune: []
  },
  'Bug': {
    weak: ['Fire', 'Flying', 'Rock'],
    strong: ['Grass', 'Psychic', 'Dark'],
    resist: ['Fighting', 'Ground', 'Grass'],
    immune: []
  },
  'Rock': {
    weak: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'],
    strong: ['Fire', 'Ice', 'Flying', 'Bug'],
    resist: ['Normal', 'Flying', 'Poison', 'Fire'],
    immune: []
  },
  'Ghost': {
    weak: ['Ghost', 'Dark'],
    strong: ['Psychic', 'Ghost'],
    resist: ['Poison', 'Bug'],
    immune: ['Normal', 'Fighting']
  },
  'Dragon': {
    weak: ['Ice', 'Dragon', 'Fairy'],
    strong: ['Dragon'],
    resist: ['Fire', 'Water', 'Grass', 'Electric'],
    immune: []
  },
  'Dark': {
    weak: ['Fighting', 'Bug', 'Fairy'],
    strong: ['Psychic', 'Ghost'],
    resist: ['Ghost', 'Dark'],
    immune: ['Psychic']
  },
  'Steel': {
    weak: ['Fire', 'Fighting', 'Ground'],
    strong: ['Ice', 'Rock', 'Fairy'],
    resist: ['Normal', 'Flying', 'Rock', 'Bug', 'Steel', 'Grass', 'Psychic', 'Ice', 'Dragon', 'Fairy'],
    immune: ['Poison']
  },
  'Fairy': {
    weak: ['Poison', 'Steel'],
    strong: ['Fighting', 'Bug', 'Dark'],
    resist: ['Fighting', 'Bug', 'Dark'],
    immune: ['Dragon']
  }
};

/**
 * Get type matchup multiplier for an attack against a defender type(s)
 * Supports single type or dual-type defenders
 * 
 * @param {string} attackType - The attack type
 * @param {string|string[]} defendType - Single type string or array of two types
 * @returns {number} Multiplier: 0 (immune), 0.5 (resisted), 1 (neutral), 2 (super effective), 4 (double super effective)
 */
export function getTypeMatchup(attackType, defendType) {
  if (!TYPE_CHART[attackType]) return 1;


  // A dual-type defender takes the product of both type matchups.
  // Filtering empty entries keeps partially populated data neutral.
  const defendTypes = (Array.isArray(defendType) ? defendType : [defendType])
    .filter(Boolean);

  return defendTypes.reduce(
    (multiplier, type) => multiplier * getTypeMatchupSingle(attackType, type),
    1
  );
}

/**
 * Helper function to get matchup for a single type
 * Reads the defender's entry, since weak/resist/immune describe what a type takes
 * @private
 */
function getTypeMatchupSingle(attackType, defendType) {
  const chart = TYPE_CHART[defendType];
  if (!chart) return 1;
  if (chart.immune.includes(attackType)) return 0;    // Immune
  if (chart.weak.includes(attackType)) return 2;      // Super effective
  if (chart.resist.includes(attackType)) return 0.5;  // Not very effective
  return 1;                                           // Neutral
}
