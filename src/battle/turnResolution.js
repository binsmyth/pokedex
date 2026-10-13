import { calculateDamage } from './damage';

function describeEffectiveness(result) {
  if (result.isSuperEffective) return 'super';
  if (result.isNotVeryEffective) return 'notVery';
  if (result.isImmune) return 'immune';
  return 'neutral';
}

function createAttackEvent(attacker, move, result) {
  return {
    attacker,
    move,
    damage: result.damage,
    effectiveness: describeEffectiveness(result),
  };
}

export function resolveTurn(state, moves) {
  if (state.player.hp <= 0 || state.opponent.hp <= 0) {
    const outcome = state.player.hp <= 0 && state.opponent.hp <= 0
      ? 'draw'
      : state.opponent.hp <= 0
        ? 'playerWin'
        : 'playerLoss';
    return {
      state: { playerHP: Math.max(0, state.player.hp), opponentHP: Math.max(0, state.opponent.hp) },
      events: [],
      outcome,
    };
  }

  const playerMoveResult = calculateDamage(
    state.player,
    state.opponent,
    moves.player.type,
    moves.player.power,
  );
  const opponentHP = Math.max(0, state.opponent.hp - playerMoveResult.damage);
  const events = [createAttackEvent('player', moves.player, playerMoveResult)];

  let playerHP = state.player.hp;
  if (state.opponent.hp > 0 && opponentHP > 0) {
    const opponentMoveResult = calculateDamage(
      state.opponent,
      state.player,
      moves.opponent.type,
      moves.opponent.power,
    );
    playerHP = Math.max(0, playerHP - opponentMoveResult.damage);
    events.push(createAttackEvent('opponent', moves.opponent, opponentMoveResult));
  }

  let outcome = 'ongoing';
  if (playerHP === 0 && opponentHP === 0) outcome = 'draw';
  else if (opponentHP === 0) outcome = 'playerWin';
  else if (playerHP === 0) outcome = 'playerLoss';

  return {
    state: { playerHP, opponentHP },
    events,
    outcome,
  };
}
