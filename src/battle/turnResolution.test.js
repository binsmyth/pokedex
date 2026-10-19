import {
  createBattleState,
  resolveTurn,
  calculateTotalDamageDealt,
  calculateTotalDamageTaken
} from './turnResolution';

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

// Neutral matchups with attack == defense, so damage == move power
const makePokemon = (name, speed, types = ['Normal']) => ({ name, attack: 100, defense: 100, speed, types });
const move = (power, type = 'Normal') => ({ name: `Hit ${power}`, power, type });

describe('createBattleState', () => {
  test('starts at turn 0 with full HP and an empty log', () => {
    expect(createBattleState(100, 80)).toEqual({
      currentTurn: 0,
      phase: 'player_select',
      winner: null,
      playerHP: 100,
      opponentHP: 80,
      battleLog: []
    });
  });
});

describe('resolveTurn', () => {
  test('faster pokemon attacks first and both attack when neither faints', () => {
    const state = resolveTurn(createBattleState(100, 100), makePokemon('Fast', 90), makePokemon('Slow', 50), move(30), move(20));

    expect(state.battleLog.map(e => e.actor)).toEqual(['player', 'opponent']);
    expect(state.opponentHP).toBe(70);
    expect(state.playerHP).toBe(80);
    expect(state.currentTurn).toBe(1);
    expect(state.phase).toBe('player_select');
    expect(state.winner).toBeNull();
  });

  test('opponent attacks first on a speed tie', () => {
    const state = resolveTurn(createBattleState(100, 100), makePokemon('A', 70), makePokemon('B', 70), move(10), move(10));
    expect(state.battleLog[0].actor).toBe('opponent');
  });

  test('a KO by the first attacker skips the counterattack', () => {
    const state = resolveTurn(createBattleState(50, 100), makePokemon('Slow', 10), makePokemon('Fast', 90), move(200), move(60));

    expect(state.battleLog).toHaveLength(1);
    expect(state.battleLog[0].actor).toBe('opponent');
    expect(state.playerHP).toBe(0);
    expect(state.opponentHP).toBe(100);
    expect(state.winner).toBe('opponent');
    expect(state.phase).toBe('finished');
  });

  test('the slower pokemon can still win with its counterattack', () => {
    const state = resolveTurn(createBattleState(100, 30), makePokemon('Slow', 10), makePokemon('Fast', 90), move(40), move(20));
    expect(state.battleLog).toHaveLength(2);
    expect(state.opponentHP).toBe(0);
    expect(state.winner).toBe('player');
  });

  test('HP never drops below 0 and hpLost excludes overkill', () => {
    const state = resolveTurn(createBattleState(100, 30), makePokemon('Fast', 90), makePokemon('Slow', 10), move(80), move(10));
    expect(state.opponentHP).toBe(0);
    expect(state.battleLog[0]).toMatchObject({ damage: 80, hpLost: 30, defenderHP: 0 });
  });

  test('logs type effectiveness for each attack', () => {
    const state = resolveTurn(
      createBattleState(500, 500),
      makePokemon('Gengar', 110, ['Ghost', 'Poison']),
      makePokemon('Snorlax', 30, ['Normal']),
      move(80, 'Ghost'),
      move(80, 'Normal')
    );
    expect(state.battleLog[0]).toMatchObject({ actorName: 'Gengar', damage: 0, isImmune: true, multiplier: 0 });
    expect(state.battleLog[1]).toMatchObject({ actorName: 'Snorlax', damage: 0, isImmune: true });
  });

  test('appends to the existing log and does not mutate its inputs', () => {
    const player = makePokemon('A', 90);
    const opponent = makePokemon('B', 10);
    const playerCopy = { ...player };
    const opponentCopy = { ...opponent };
    const start = createBattleState(100, 100);

    const turn1 = resolveTurn(start, player, opponent, move(10), move(10));
    const turn2 = resolveTurn(turn1, player, opponent, move(10), move(10));

    expect(start).toEqual(createBattleState(100, 100));
    expect(turn1.battleLog).toHaveLength(2);
    expect(player).toEqual(playerCopy);
    expect(opponent).toEqual(opponentCopy);
    expect(turn2.currentTurn).toBe(2);
    expect(turn2.battleLog.map(e => e.turn)).toEqual([1, 1, 2, 2]);
    expect(turn2.opponentHP).toBe(80);
  });
});

describe('damage totals', () => {
  const battleLog = [
    { actor: 'player', damage: 30, hpLost: 30 },
    { actor: 'opponent', damage: 20, hpLost: 20 },
    { actor: 'player', damage: 90, hpLost: 70 }
  ];

  test('calculateTotalDamageDealt sums HP actually removed', () => {
    expect(calculateTotalDamageDealt(battleLog, 'player')).toBe(100);
    expect(calculateTotalDamageDealt(battleLog, 'opponent')).toBe(20);
  });

  test('calculateTotalDamageTaken is the other side\'s damage dealt', () => {
    expect(calculateTotalDamageTaken(battleLog, 'player')).toBe(20);
    expect(calculateTotalDamageTaken(battleLog, 'opponent')).toBe(100);
  });

  test('empty log totals to 0', () => {
    expect(calculateTotalDamageDealt([], 'player')).toBe(0);
  });
});
