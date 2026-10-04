import React from 'react';
import { calculateTotalDamageDealt, calculateTotalDamageTaken } from '../../battle/turnResolution';

const countHits = (battleLog, actor, flag) =>
  battleLog.filter(entry => entry.actor === actor && entry[flag]).length;

const StatRow = ({ label, player, opponent }) => (
  <tr>
    <th scope="row" style={{ padding: '4px 8px', textAlign: 'left', opacity: 0.8, fontWeight: 'normal' }}>{label}</th>
    <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{player}</td>
    <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>{opponent}</td>
  </tr>
);

/**
 * End-of-battle summary built from the resolveTurn() battle log
 */
export function BattleResults({ battleState, playerName, opponentName }) {
  if (!battleState || !battleState.winner) return null;

  const { battleLog, currentTurn, winner } = battleState;
  const stats = (actor) => ({
    dealt: calculateTotalDamageDealt(battleLog, actor),
    taken: calculateTotalDamageTaken(battleLog, actor),
    superEffective: countHits(battleLog, actor, 'isEffective'),
    resisted: countHits(battleLog, actor, 'isResisted'),
    immune: countHits(battleLog, actor, 'isImmune')
  });
  const player = stats('player');
  const opponent = stats('opponent');

  return (
    <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
      <h3 style={{ marginTop: 0, color: winner === 'player' ? '#4caf50' : '#ff6b6b' }}>
        {winner === 'player' ? playerName : opponentName} wins in {currentTurn} {currentTurn === 1 ? 'turn' : 'turns'}!
      </h3>
      <table style={{ margin: '0 auto', borderCollapse: 'collapse', fontSize: '14px' }}>
        <caption style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>Battle statistics</caption>
        <thead>
          <tr>
            <td></td>
            <th scope="col" style={{ padding: '4px 8px' }}>{playerName}</th>
            <th scope="col" style={{ padding: '4px 8px' }}>{opponentName}</th>
          </tr>
        </thead>
        <tbody>
          <StatRow label="Damage dealt" player={player.dealt} opponent={opponent.dealt} />
          <StatRow label="Damage taken" player={player.taken} opponent={opponent.taken} />
          <StatRow label="Super effective hits" player={player.superEffective} opponent={opponent.superEffective} />
          <StatRow label="Resisted hits" player={player.resisted} opponent={opponent.resisted} />
          <StatRow label="No-effect hits" player={player.immune} opponent={opponent.immune} />
        </tbody>
      </table>
    </div>
  );
}
