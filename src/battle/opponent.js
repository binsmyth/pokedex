/**
 * Pick the opponent's move for this turn
 *
 * @param {Object[]} moves - The opponent's available moves
 * @param {Function} random - Returns a number in [0, 1); pass a seeded/fixed function in tests
 * @returns {number} Index of the chosen move
 */
export function chooseOpponentMove(moves, random = Math.random) {
  return Math.min(moves.length - 1, Math.floor(random() * moves.length));
}
