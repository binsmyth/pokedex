import { getTypeMatchup } from '../data/typeChart';

/**
 * Calculate damage dealt by an attacker to a defender
 * Formula: power * (attack/defense) * typeMultiplier
 * 
 * @param {Object} attacker - Attacker pokemon { attack, type }
 * @param {Object} defender - Defender pokemon { defense, type or types }
 * @param {string} moveType - Type of the move being used
 * @param {number} movePower - Power value of the move
 * @returns {Object} Damage result with metadata
 */
export function calculateDamage(attacker, defender, moveType, movePower) {
  // Step 1: Base damage calculation (power * attack/defense)
  const baseRawDamage = movePower * (attacker.attack / defender.defense);
  
  // Step 2: Get type effectiveness (handles single and dual types)
  // Pass defender.types (array) or defender.type (string)
  const defenderTypes = Array.isArray(defender.types) ? defender.types : defender.type;
  const typeMultiplier = getTypeMatchup(moveType, defenderTypes);
  
  console.log(`Damage calc: ${moveType} attack vs ${JSON.stringify(defenderTypes)}`);
  console.log(`  Base: ${movePower} * (${attacker.attack}/${defender.defense}) = ${baseRawDamage.toFixed(2)}`);
  console.log(`  Type Multiplier: ${typeMultiplier}x`);
  
  // Step 3: Handle immunity as special case (0x = 0 damage, no minimum)
  if (typeMultiplier === 0) {
    console.log(`  Result: IMMUNE - 0 damage`);
    return {
      damage: 0,
      multiplier: 0,
      isSuperEffective: false,
      isNotVeryEffective: false,
      isImmune: true
    };
  }
  
  // Step 4: Apply type multiplier and floor result
  const rawDamage = baseRawDamage * typeMultiplier;
  
  // Step 5: Enforce minimum damage of 1 for non-immune attacks
  const finalDamage = Math.max(1, Math.floor(rawDamage));
  
  console.log(`  Final: ${finalDamage} damage`);
  
  return {
    damage: finalDamage,
    multiplier: typeMultiplier,
    isSuperEffective: typeMultiplier >= 2,
    isNotVeryEffective: typeMultiplier <= 0.5 && typeMultiplier > 0,
    isImmune: false
  };
}

/**
 * Determine turn order based on Speed stats
 * Higher speed acts first. On tie, opponent acts first
 * 
 * @param {number} playerSpeed - Player's speed stat
 * @param {number} opponentSpeed - Opponent's speed stat
 * @returns {Object} Turn order info { firstActor, secondActor, playerFirst }
 */
export function determineTurnOrder(playerSpeed, opponentSpeed) {
  if (playerSpeed > opponentSpeed) {
    return { firstActor: 'player', secondActor: 'opponent', playerFirst: true };
  } else {
    // Tie: opponent acts first
    return { firstActor: 'opponent', secondActor: 'player', playerFirst: false };
  }
}
