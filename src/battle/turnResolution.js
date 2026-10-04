import { calculateDamage, determineTurnOrder } from './damage';

/**
 * Create the starting state for a battle
 *
 * @param {number} playerHP - Player's starting HP
 * @param {number} opponentHP - Opponent's starting HP
 * @returns {Object} Fresh battle state
 */
export function createBattleState(playerHP, opponentHP) {
  return {
    currentTurn: 0,
    phase: 'player_select',
    winner: null,
    playerHP,
    opponentHP,
    battleLog: []
  };
}

/**
 * Resolve a complete turn in battle
 * Implements speed-based turn order with KO detection
 * Does not mutate its arguments; HP lives in the returned state
 *
 * @param {Object} battleState - Current battle state (from createBattleState)
 * @param {Object} playerPokemon - Player's pokemon { name, attack, defense, speed, types }
 * @param {Object} opponentPokemon - Opponent's pokemon { name, attack, defense, speed, types }
 * @param {Object} playerMove - Player's selected move { name, power, type }
 * @param {Object} opponentMove - Opponent's selected move { name, power, type }
 * @returns {Object} Updated battle state with turn results
 */
export function resolveTurn(
  battleState,
  playerPokemon,
  opponentPokemon,
  playerMove,
  opponentMove
) {
  // Step 1: Determine turn order based on speed stats
  const { firstActor, secondActor } = determineTurnOrder(playerPokemon.speed, opponentPokemon.speed);

  const turn = battleState.currentTurn + 1;
  const pokemon = { player: playerPokemon, opponent: opponentPokemon };
  const moves = { player: playerMove, opponent: opponentMove };
  const hp = { player: battleState.playerHP, opponent: battleState.opponentHP };
  const battleLog = [...battleState.battleLog];

  const attack = (attacker, defender) => {
    const move = moves[attacker];
    const result = calculateDamage(pokemon[attacker], pokemon[defender], move.type, move.power);
    const hpBefore = hp[defender];
    hp[defender] = Math.max(0, hpBefore - result.damage);

    battleLog.push({
      turn,
      actor: attacker,
      actorName: pokemon[attacker].name,
      move: move.name,
      damage: result.damage,
      hpLost: hpBefore - hp[defender],
      defenderHP: hp[defender],
      multiplier: result.multiplier,
      isEffective: result.isSuperEffective,
      isResisted: result.isNotVeryEffective,
      isImmune: result.isImmune
    });
  };

  // Step 2: First actor attacks
  attack(firstActor, secondActor);

  // Step 3: Second actor attacks only if it survived
  if (hp[secondActor] > 0) {
    attack(secondActor, firstActor);
  }

  // Step 4: Check for a winner
  let winner = null;
  if (hp[secondActor] <= 0) winner = firstActor;
  else if (hp[firstActor] <= 0) winner = secondActor;

  return {
    ...battleState,
    currentTurn: turn,
    phase: winner ? 'finished' : 'player_select',
    winner,
    playerHP: hp.player,
    opponentHP: hp.opponent,
    battleLog
  };
}

/**
 * Calculate total damage dealt by an actor in a battle
 * Counts HP actually removed, so a finishing blow doesn't count overkill
 *
 * @param {Array} battleLog - Array of battle log entries
 * @param {string} actor - 'player' or 'opponent'
 * @returns {number} Total damage dealt
 */
export function calculateTotalDamageDealt(battleLog, actor) {
  return battleLog
    .filter(entry => entry.actor === actor)
    .reduce((sum, entry) => sum + entry.hpLost, 0);
}

/**
 * Calculate total damage taken by an actor in a battle
 *
 * @param {Array} battleLog - Array of battle log entries
 * @param {string} actor - 'player' or 'opponent'
 * @returns {number} Total damage taken
 */
export function calculateTotalDamageTaken(battleLog, actor) {
  const opponent = actor === 'player' ? 'opponent' : 'player';
  return calculateTotalDamageDealt(battleLog, opponent);
}
