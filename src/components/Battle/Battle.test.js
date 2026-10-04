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

test('no-effect moves deal 0 damage and are shown as "No effect"', () => {
  const { container } = render(<Battle random={() => 0} />); // Gengar always uses Shadow Ball
  pickPlayer('Pikachu');
  pickOpponent('Gengar');
  fireEvent.click(screen.getByText(/Start Battle/));

  playTurn('Quick Attack (40 power)');
  const logLine = screen.getByText(/Pikachu uses Quick Attack! No effect! Deals 0 damage!/);
  expect(logLine).toHaveClass('battle-log-immune');
  expect(container.querySelector('.floating-damage.immune')).toHaveTextContent(/^No effect$/);
  expect(screen.getByText('Damage: 0 (No Effect)')).toBeInTheDocument();
  // Gengar's neutral Shadow Ball: 80 * (130 / 75) = 138
  expect(screen.getByText(/Gengar uses Shadow Ball! Deals 138 damage!/)).toHaveClass('battle-log-neutral');
  expect(container.querySelector('.floating-damage.neutral')).toHaveTextContent(/^-138$/);
});

test('super effective hits get the highlighted styles', () => {
  const { container } = render(<Battle random={() => 0} />); // Gyarados always uses Waterfall
  pickPlayer('Pikachu');
  pickOpponent('Gyarados');
  fireEvent.click(screen.getByText(/Start Battle/));

  // Electric vs Water/Flying = 4x: 90 * (65 / 79) * 4 = 296
  playTurn('Thunderbolt (90 power)');
  const logLine = screen.getByText(/Pikachu uses Thunderbolt! Super effective! \(4x\) Deals 296 damage!/);
  expect(logLine).toHaveClass('battle-log-super');
  expect(container.querySelector('.floating-damage.super')).toHaveTextContent(/^-296$/);
  expect(screen.getByText('Damage: 296 (Super Effective!)')).toBeInTheDocument();
});

test('resisted hits get the muted styles', () => {
  const { container } = render(<Battle random={() => 0} />);
  pickPlayer('Pikachu');
  pickOpponent('Venusaur');
  fireEvent.click(screen.getByText(/Start Battle/));

  // Electric vs Grass/Poison = 0.5x: 90 * (65 / 83) * 0.5 = 35
  playTurn('Thunderbolt (90 power)');
  expect(screen.getByText(/Pikachu uses Thunderbolt! Not very effective\.\.\. \(0.5x\) Deals 35 damage!/)).toHaveClass('battle-log-resisted');
  expect(container.querySelector('.floating-damage.resisted')).toHaveTextContent(/^-35$/);
  expect(screen.getByText('Damage: 35 (Not Very Effective)')).toBeInTheDocument();
});

describe('accessibility', () => {
  test('selected pokemon are exposed with aria-pressed, not just color', () => {
    render(<Battle />);
    pickPlayer('Gengar');

    const [playerButton, opponentButton] = screen.getAllByRole('button', { name: /Gengar \(Ghost\/Poison\)/ });
    expect(playerButton).toHaveAttribute('aria-pressed', 'true');
    expect(playerButton).toHaveTextContent(/^✓ Gengar/);
    expect(opponentButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('group', { name: 'Your Pokemon' })).toContainElement(playerButton);
  });

  test('focus follows the battle flow so keyboard users never lose their place', () => {
    render(<Battle random={() => 0.5} />);
    pickPlayer('Gengar');
    pickOpponent('Pikachu');
    fireEvent.click(screen.getByText(/Start Battle/));
    expect(screen.getByRole('heading', { name: 'Battle!' })).toHaveFocus();

    fireEvent.click(screen.getByText('Shadow Ball (80 power)'));
    expect(screen.getByRole('button', { name: /Resolve Attacks/ })).toHaveFocus();

    fireEvent.click(screen.getByText(/Resolve Attacks/));
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(screen.getByRole('button', { name: 'Shadow Ball (80 power)' })).toHaveFocus();

    playTurn('Shadow Ball (80 power)');
    playTurn('Shadow Ball (80 power)');
    expect(screen.getByRole('button', { name: 'Reset Battle' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Reset Battle' }));
    expect(screen.getByRole('heading', { name: 'Battle!' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Back to Selection' }));
    expect(screen.getByRole('heading', { name: 'Select Pokemon for Battle' })).toHaveFocus();
  });

  test('HP bars, battle log and results are exposed to assistive tech', () => {
    render(<Battle random={() => 0.5} />);
    pickPlayer('Gengar');
    pickOpponent('Pikachu');
    fireEvent.click(screen.getByText(/Start Battle/));

    const pikachuHP = screen.getByRole('progressbar', { name: 'Pikachu HP' });
    expect(pikachuHP).toHaveAttribute('aria-valuenow', '280');
    expect(pikachuHP).toHaveAttribute('aria-valuemax', '280');

    playTurn('Shadow Ball (80 power)');
    expect(pikachuHP).toHaveAttribute('aria-valuenow', '142');
    expect(pikachuHP).toHaveAttribute('aria-valuetext', '142 of 280 HP');
    expect(screen.getByRole('log', { name: 'Battle log' })).toHaveTextContent('Gengar uses Shadow Ball!');
    expect(screen.getByRole('status')).toHaveTextContent('Battle in Progress...');

    playTurn('Shadow Ball (80 power)');
    playTurn('Shadow Ball (80 power)');
    expect(screen.getByRole('status')).toHaveTextContent('You Won!');
    const table = screen.getByRole('table', { name: 'Battle statistics' });
    expect(table).toContainElement(screen.getByRole('rowheader', { name: 'Damage dealt' }));
    expect(screen.getByRole('columnheader', { name: 'Gengar' })).toBeInTheDocument();
  });
});
