import { chooseOpponentMove } from './opponent';

const moves = ['a', 'b', 'c'];

describe('chooseOpponentMove', () => {
  test.each([
    [0, 0],
    [0.33, 0],
    [0.34, 1],
    [0.67, 2],
    [0.9999999999999999, 2]
  ])('random() = %p picks move %p', (value, expected) => {
    expect(chooseOpponentMove(moves, () => value)).toBe(expected);
  });

  test('stays in range even if random() returns 1', () => {
    expect(chooseOpponentMove(moves, () => 1)).toBe(2);
  });

  test('always picks the only move', () => {
    expect(chooseOpponentMove(['only'], () => 0.8)).toBe(0);
  });

  test('defaults to Math.random', () => {
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(chooseOpponentMove(moves)).toBe(1);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
