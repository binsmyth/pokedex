import { TYPE_CHART, getTypeMatchup } from './typeChart';

const TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground',
  'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];

// Reference chart (Gen 6+). Rows are the attacking type, columns the defending type, in TYPES order.
// h = 0.5
const REFERENCE = `
  1 1 1 1 1 1 1 1 1 1 1 1 h 0 1 1 h 1
  1 h h 1 2 2 1 1 1 1 1 2 h 1 h 1 2 1
  1 2 h 1 h 1 1 1 2 1 1 1 2 1 h 1 1 1
  1 1 2 h h 1 1 1 0 2 1 1 1 1 h 1 1 1
  1 h 2 1 h 1 1 h 2 h 1 h 2 1 h 1 h 1
  1 h h 1 2 h 1 1 2 2 1 1 1 1 2 1 h 1
  2 1 1 1 1 2 1 h 1 h h h 2 0 1 2 2 h
  1 1 1 1 2 1 1 h h 1 1 1 h h 1 1 0 2
  1 2 1 2 h 1 1 2 1 0 1 h 2 1 1 1 2 1
  1 1 1 h 2 1 2 1 1 1 1 2 h 1 1 1 h 1
  1 1 1 1 1 1 2 2 1 1 h 1 1 1 1 0 h 1
  1 h 1 1 2 1 h h 1 h 2 1 1 h 1 2 h h
  1 2 1 1 1 2 h 1 h 2 1 2 1 1 1 1 h 1
  0 1 1 1 1 1 1 1 1 1 2 1 1 2 1 h 1 1
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 h 0
  1 1 1 1 1 1 h 1 1 1 2 1 1 2 1 h 1 h
  1 h h h 1 2 1 1 1 1 1 1 2 1 1 1 h 2
  1 h 1 1 1 1 2 h 1 1 1 1 1 1 2 2 h 1
`.trim().split('\n').map(row => row.trim().split(/\s+/).map(v => (v === 'h' ? 0.5 : Number(v))));

describe('TYPE_CHART', () => {
  test('defines all 18 types with complete relationship lists', () => {
    expect(Object.keys(TYPE_CHART).sort()).toEqual([...TYPES].sort());
    TYPES.forEach(type => {
      ['weak', 'strong', 'resist', 'immune'].forEach(key => {
        expect(Array.isArray(TYPE_CHART[type][key])).toBe(true);
      });
    });
  });
});

describe('getTypeMatchup', () => {
  const cases = TYPES.flatMap((attack, i) => TYPES.map((defend, j) => [attack, defend, REFERENCE[i][j]]));

  test.each(cases)('%s vs %s = %px', (attack, defend, expected) => {
    expect(getTypeMatchup(attack, defend)).toBe(expected);
  });

  test('multiplies matchups for dual-type defenders', () => {
    expect(getTypeMatchup('Rock', ['Fire', 'Flying'])).toBe(4);
    expect(getTypeMatchup('Electric', ['Water', 'Flying'])).toBe(4);
    expect(getTypeMatchup('Fire', ['Water', 'Flying'])).toBe(0.5);
    expect(getTypeMatchup('Fighting', ['Bug', 'Steel'])).toBe(1);
    expect(getTypeMatchup('Grass', ['Bug', 'Steel'])).toBe(0.25);
  });

  test('immunity on either type makes the whole matchup 0', () => {
    expect(getTypeMatchup('Ground', ['Dragon', 'Flying'])).toBe(0);
    expect(getTypeMatchup('Normal', ['Ghost', 'Poison'])).toBe(0);
  });

  test('accepts a single type wrapped in an array', () => {
    expect(getTypeMatchup('Water', ['Fire'])).toBe(2);
  });

  test('treats unknown attack or defend types as neutral', () => {
    expect(getTypeMatchup('Lava', 'Fire')).toBe(1);
    expect(getTypeMatchup('Fire', 'Lava')).toBe(1);
  });
});
