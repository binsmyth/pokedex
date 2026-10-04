import { calculateDamage, determineTurnOrder } from './damage';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('calculateDamage', () => {
  test('applies power * (attack / defense) and floors the result', () => {
    // 50 * (100 / 30) = 166.67 -> 166
    const result = calculateDamage({ attack: 100 }, { defense: 30, types: ['Normal'] }, 'Normal', 50);
    expect(result).toEqual({
      damage: 166,
      multiplier: 1,
      isSuperEffective: false,
      isNotVeryEffective: false,
      isImmune: false
    });
  });

  test('doubles damage and flags super effective hits', () => {
    const result = calculateDamage({ attack: 100 }, { defense: 100, types: ['Grass'] }, 'Fire', 50);
    expect(result.damage).toBe(100);
    expect(result.multiplier).toBe(2);
    expect(result.isSuperEffective).toBe(true);
  });

  test('handles 4x against dual types', () => {
    const result = calculateDamage({ attack: 100 }, { defense: 100, types: ['Fire', 'Flying'] }, 'Rock', 50);
    expect(result.damage).toBe(200);
    expect(result.multiplier).toBe(4);
    expect(result.isSuperEffective).toBe(true);
  });

  test('halves damage and flags resisted hits', () => {
    const result = calculateDamage({ attack: 100 }, { defense: 100, types: ['Water'] }, 'Fire', 50);
    expect(result.damage).toBe(25);
    expect(result.isNotVeryEffective).toBe(true);
  });

  test('flags 0.25x hits as not very effective', () => {
    const result = calculateDamage({ attack: 100 }, { defense: 100, types: ['Bug', 'Steel'] }, 'Grass', 80);
    expect(result.damage).toBe(20);
    expect(result.multiplier).toBe(0.25);
    expect(result.isNotVeryEffective).toBe(true);
  });

  test('deals at least 1 damage when not immune', () => {
    const result = calculateDamage({ attack: 1 }, { defense: 500, types: ['Water'] }, 'Fire', 10);
    expect(result.damage).toBe(1);
  });

  test('immunity deals exactly 0 damage, overriding the minimum', () => {
    const result = calculateDamage({ attack: 200 }, { defense: 10, types: ['Ghost'] }, 'Normal', 100);
    expect(result).toEqual({
      damage: 0,
      multiplier: 0,
      isSuperEffective: false,
      isNotVeryEffective: false,
      isImmune: true
    });
  });

  test('still accepts a single `type` string on the defender', () => {
    const result = calculateDamage({ attack: 100 }, { defense: 100, type: 'Grass' }, 'Fire', 50);
    expect(result.multiplier).toBe(2);
  });
});

describe('determineTurnOrder', () => {
  test('faster player acts first', () => {
    expect(determineTurnOrder(100, 50)).toEqual({ firstActor: 'player', secondActor: 'opponent', playerFirst: true });
  });

  test('faster opponent acts first', () => {
    expect(determineTurnOrder(50, 100)).toEqual({ firstActor: 'opponent', secondActor: 'player', playerFirst: false });
  });

  test('opponent wins speed ties', () => {
    expect(determineTurnOrder(75, 75)).toEqual({ firstActor: 'opponent', secondActor: 'player', playerFirst: false });
  });
});
