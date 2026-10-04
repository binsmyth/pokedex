/**
 * Battle roster
 * Stats are battle-ready values: attack uses the higher of Attack / Sp. Atk,
 * and HP is scaled up so battles last a few turns
 */
export const POKEMON_CATALOG = {
  'Pikachu': {
    hp: 280, attack: 65, defense: 75, speed: 90, types: ['Electric'], emoji: '⚡',
    moves: [
      { name: 'Thunderbolt', power: 90, type: 'Electric' },
      { name: 'Thunder Shock', power: 40, type: 'Electric' },
      { name: 'Quick Attack', power: 40, type: 'Normal' }
    ]
  },
  'Charizard': {
    hp: 312, attack: 84, defense: 78, speed: 100, types: ['Fire', 'Flying'], emoji: '🔥',
    moves: [
      { name: 'Flare Blitz', power: 120, type: 'Fire' },
      { name: 'Flame Charge', power: 50, type: 'Fire' },
      { name: 'Dragon Claw', power: 80, type: 'Dragon' }
    ]
  },
  'Blastoise': {
    hp: 316, attack: 83, defense: 100, speed: 78, types: ['Water'], emoji: '💧',
    moves: [
      { name: 'Hydro Pump', power: 110, type: 'Water' },
      { name: 'Water Gun', power: 40, type: 'Water' },
      { name: 'Ice Beam', power: 90, type: 'Ice' }
    ]
  },
  'Venusaur': {
    hp: 320, attack: 82, defense: 83, speed: 80, types: ['Grass', 'Poison'], emoji: '🌿',
    moves: [
      { name: 'Power Whip', power: 120, type: 'Grass' },
      { name: 'Vine Whip', power: 45, type: 'Grass' },
      { name: 'Sludge Bomb', power: 90, type: 'Poison' }
    ]
  },
  'Gyarados': {
    hp: 380, attack: 125, defense: 79, speed: 81, types: ['Water', 'Flying'], emoji: '🐉',
    moves: [
      { name: 'Waterfall', power: 80, type: 'Water' },
      { name: 'Bounce', power: 85, type: 'Flying' },
      { name: 'Crunch', power: 80, type: 'Dark' }
    ]
  },
  'Gengar': {
    hp: 240, attack: 130, defense: 60, speed: 110, types: ['Ghost', 'Poison'], emoji: '👻',
    moves: [
      { name: 'Shadow Ball', power: 80, type: 'Ghost' },
      { name: 'Sludge Bomb', power: 90, type: 'Poison' },
      { name: 'Dark Pulse', power: 80, type: 'Dark' }
    ]
  },
  'Dragonite': {
    hp: 364, attack: 134, defense: 95, speed: 80, types: ['Dragon', 'Flying'], emoji: '🐲',
    moves: [
      { name: 'Outrage', power: 120, type: 'Dragon' },
      { name: 'Wing Attack', power: 60, type: 'Flying' },
      { name: 'Fire Punch', power: 75, type: 'Fire' }
    ]
  },
  'Tyranitar': {
    hp: 400, attack: 134, defense: 110, speed: 61, types: ['Rock', 'Dark'], emoji: '🪨',
    moves: [
      { name: 'Stone Edge', power: 100, type: 'Rock' },
      { name: 'Crunch', power: 80, type: 'Dark' },
      { name: 'Earthquake', power: 100, type: 'Ground' }
    ]
  },
  'Lucario': {
    hp: 280, attack: 115, defense: 70, speed: 90, types: ['Fighting', 'Steel'], emoji: '🥋',
    moves: [
      { name: 'Aura Sphere', power: 80, type: 'Fighting' },
      { name: 'Flash Cannon', power: 80, type: 'Steel' },
      { name: 'Close Combat', power: 120, type: 'Fighting' }
    ]
  },
  'Gardevoir': {
    hp: 272, attack: 125, defense: 65, speed: 80, types: ['Psychic', 'Fairy'], emoji: '🔮',
    moves: [
      { name: 'Psychic', power: 90, type: 'Psychic' },
      { name: 'Moonblast', power: 95, type: 'Fairy' },
      { name: 'Shadow Ball', power: 80, type: 'Ghost' }
    ]
  },
  'Garchomp': {
    hp: 432, attack: 130, defense: 95, speed: 102, types: ['Dragon', 'Ground'], emoji: '🦈',
    moves: [
      { name: 'Earthquake', power: 100, type: 'Ground' },
      { name: 'Dragon Claw', power: 80, type: 'Dragon' },
      { name: 'Fire Fang', power: 65, type: 'Fire' }
    ]
  },
  'Scizor': {
    hp: 280, attack: 130, defense: 100, speed: 65, types: ['Bug', 'Steel'], emoji: '✂️',
    moves: [
      { name: 'X-Scissor', power: 80, type: 'Bug' },
      { name: 'Iron Head', power: 80, type: 'Steel' },
      { name: 'Bullet Punch', power: 40, type: 'Steel' }
    ]
  },
  'Lapras': {
    hp: 520, attack: 85, defense: 80, speed: 60, types: ['Water', 'Ice'], emoji: '🐚',
    moves: [
      { name: 'Surf', power: 90, type: 'Water' },
      { name: 'Ice Beam', power: 90, type: 'Ice' },
      { name: 'Thunderbolt', power: 90, type: 'Electric' }
    ]
  },
  'Machamp': {
    hp: 360, attack: 130, defense: 80, speed: 55, types: ['Fighting'], emoji: '💪',
    moves: [
      { name: 'Cross Chop', power: 100, type: 'Fighting' },
      { name: 'Rock Slide', power: 75, type: 'Rock' },
      { name: 'Knock Off', power: 65, type: 'Dark' }
    ]
  }
};

export function getPokemon(name) {
  return POKEMON_CATALOG[name] || null;
}

export function formatTypes(pokemon) {
  return pokemon.types.join('/');
}
