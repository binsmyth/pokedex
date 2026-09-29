import { getTypeMatchup } from '../data/typeChart';

export function calculateDamage(attacker, defender, moveType, movePower) {
  // Simple formula: power * (attack/defense) * typeMultiplier
  
  const baseRawDamage = movePower * (attacker.attack / defender.defense);
  const typeMultiplier = getTypeMatchup(moveType, defender.type);
  
  console.log(`Damage calc: ${attacker.type} ${moveType} vs ${defender.type}`);
  console.log(`  Base: ${movePower} * (${attacker.attack}/${defender.defense}) = ${baseRawDamage.toFixed(2)}`);
  console.log(`  Multiplier: ${typeMultiplier}x`);
  
  if (typeMultiplier === 0) {
    return { damage: 0, multiplier: 0, isSuperEffective: false, isNotVeryEffective: false, isImmune: true };
  }
  
  const rawDamage = baseRawDamage * typeMultiplier;
  const finalDamage = Math.max(1, Math.floor(rawDamage));
  
  console.log(`  Final: ${finalDamage} damage`);
  
  return {
    damage: finalDamage,
    multiplier: typeMultiplier,
    isSuperEffective: typeMultiplier === 2,
    isNotVeryEffective: typeMultiplier === 0.5,
    isImmune: false
  };
}
