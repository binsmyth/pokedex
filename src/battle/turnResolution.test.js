import { resolveTurn } from './turnResolution';

const pikachu = {
  name: 'Pikachu',
  hp: 280,
  attack: 65,
  defense: 75,
  type: 'Electric',
};

const blastoise = {
  name: 'Blastoise',
  hp: 316,
  attack: 83,
  defense: 100,
  type: 'Water',
};

const thunderbolt = { name: 'Thunderbolt', power: 90, type: 'Electric' };
const hydroPump = { name: 'Hydro Pump', power: 110, type: 'Water' };

describe('resolveTurn', () => {
  test('applies player attack first and returns ordered attack events and next HP', () => {
    const result = resolveTurn(
      { player: pikachu, opponent: blastoise },
      { player: thunderbolt, opponent: hydroPump },
    );

    expect(result).toMatchObject({
      state: { playerHP: 220, opponentHP: 199 },
      events: [
        { attacker: 'player', move: thunderbolt, damage: 117, effectiveness: 'super' },
        { attacker: 'opponent', move: hydroPump, damage: 60, effectiveness: 'notVery' },
      ],
      outcome: 'ongoing',
    });
  });

  test('does not let a knocked-out opponent retaliate', () => {
    const result = resolveTurn(
      { player: pikachu, opponent: { ...blastoise, hp: 10 } },
      { player: thunderbolt, opponent: hydroPump },
    );

    expect(result.state).toMatchObject({ playerHP: pikachu.hp, opponentHP: 0 });
    expect(result.events).toHaveLength(1);
    expect(result.outcome).toBe('playerWin');
  });

  test('reports a draw for a state where both combatants have zero HP', () => {
    const result = resolveTurn(
      { player: { ...pikachu, hp: 0 }, opponent: { ...blastoise, hp: 0 } },
      { player: thunderbolt, opponent: hydroPump },
    );

    expect(result.state).toMatchObject({ playerHP: 0, opponentHP: 0 });
    expect(result.outcome).toBe('draw');
    expect(result.events).toEqual([]);
  });

  test('preserves an existing knockout instead of resolving another attack', () => {
    const result = resolveTurn(
      { player: pikachu, opponent: { ...blastoise, hp: 0 } },
      { player: thunderbolt, opponent: hydroPump },
    );

    expect(result.state).toMatchObject({ playerHP: pikachu.hp, opponentHP: 0 });
    expect(result.outcome).toBe('playerWin');
    expect(result.events).toEqual([]);
  });
});
