import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Battle } from './Battle';

jest.mock('../../utils/audio', () => ({
  playSound: jest.fn(),
  playSoundForDamage: jest.fn(),
  playEndSound: jest.fn(),
  SOUNDS: {}
}));

// Real roster plus one bad entry to exercise setup validation
jest.mock('../../data/pokemonCatalog', () => {
  const actual = jest.requireActual('../../data/pokemonCatalog');
  return {
    ...actual,
    POKEMON_CATALOG: {
      ...actual.POKEMON_CATALOG,
      'Broken': { hp: 0, attack: 50, defense: 50, speed: 50, types: ['Lava'], emoji: '?', moves: [] }
    }
  };
});

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// Each pokemon appears once in the player column and once in the opponent column
const pickPlayer = (name) => fireEvent.click(screen.getAllByText(new RegExp(`^${name} \\(`))[0]);
const pickOpponent = (name) => fireEvent.click(screen.getAllByText(new RegExp(`^${name} \\(`))[1]);

const playTurn = (moveLabel) => {
  fireEvent.click(screen.getByText(moveLabel));
  fireEvent.click(screen.getByText(/Resolve Attacks/));
  act(() => {
    jest.advanceTimersByTime(400);
  });
};

test('shows dual types on the selection screen', () => {
  render(<Battle />);
  expect(screen.getAllByText(/^Charizard \(Fire\/Flying\)/)).toHaveLength(2);
});

test('blocks the battle and lists problems when data is invalid', () => {
  render(<Battle />);
  pickPlayer('Broken');
  pickOpponent('Pikachu');
  fireEvent.click(screen.getByText(/Start Battle/));

  expect(screen.getByRole('alert')).toHaveTextContent('Broken: hp must be a positive number');
  expect(screen.getByRole('alert')).toHaveTextContent('Broken: unknown type "Lava"');
  expect(screen.getByRole('alert')).toHaveTextContent('Broken: must have at least one move');
  expect(screen.queryByText('Battle!')).toBeNull();

  // Picking a different pokemon clears the errors
  pickPlayer('Gengar');
  expect(screen.queryByRole('alert')).toBeNull();
});

test('shows which pokemon moves first', () => {
  render(<Battle />);
  pickPlayer('Charizard');
  pickOpponent('Garchomp');
  fireEvent.click(screen.getByText(/Start Battle/));

  expect(screen.getByText(/Garchomp moves first/)).toHaveTextContent('Speed 102 vs 100');
});

test('explains the tie-break when speeds match', () => {
  render(<Battle />);
  pickPlayer('Venusaur');
  pickOpponent('Gardevoir');
  fireEvent.click(screen.getByText(/Start Battle/));

  expect(screen.getByText(/Gardevoir moves first/)).toHaveTextContent('Speed tied at 80, opponent goes first');
});

test('plays a full battle with a fixed opponent move and shows the results', () => {
  const random = jest.fn(() => 0.5); // Pikachu always picks move 2 of 3: Thunder Shock
  render(<Battle random={random} />);
  pickPlayer('Gengar');
  pickOpponent('Pikachu');
  fireEvent.click(screen.getByText(/Start Battle/));

  // Gengar: 80 * (130 / 75) = 138 per Shadow Ball; Pikachu has 280 HP
  playTurn('Shadow Ball (80 power)');
  expect(screen.getByText(/Gengar uses Shadow Ball! Deals 138 damage!/)).toBeTruthy();
  expect(screen.getByText(/Pikachu uses Thunder Shock!/)).toBeTruthy();
  playTurn('Shadow Ball (80 power)');
  playTurn('Shadow Ball (80 power)');

  expect(random).toHaveBeenCalledTimes(3);
  expect(screen.getByText('You Won!')).toBeTruthy();
  expect(screen.getByText('Gengar wins in 3 turns!')).toBeTruthy();
  // Overkill isn't counted: Gengar dealt exactly Pikachu's 280 HP
  expect(screen.getByText('Damage dealt').closest('tr')).toHaveTextContent('280');
  // Gengar is faster, so the KO'd Pikachu never counterattacked on turn 3:
  // only 2 Thunder Shocks of 40 * (65 / 60) = 43 landed
  expect(screen.getByText('Damage taken').closest('tr')).toHaveTextContent(/^Damage taken86280$/);
});

test('no-effect moves deal 0 damage', () => {
  render(<Battle random={() => 0} />); // Pikachu always uses Thunderbolt
  pickPlayer('Pikachu');
  pickOpponent('Gengar');
  fireEvent.click(screen.getByText(/Start Battle/));

  playTurn('Quick Attack (40 power)');
  expect(screen.getByText(/Pikachu uses Quick Attack! No effect! Deals 0 damage!/)).toBeTruthy();
});
