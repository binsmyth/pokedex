# Phase 2: Integration, Data & Tests - COMPLETE ✅
**Date: Oct 5, 2026**

---

## Summary

The Phase 1 battle logic is now wired into the UI, the roster has grown to 14 Pokémon (10 dual-type), battle data is validated before a fight, the results screen shows stats, opponent RNG is injectable, and the battle system has 391 passing tests.

Two Phase 1 bugs were found and fixed along the way (see below).

---

## 🐛 Phase 1 Bugs Fixed

### 1. Type matchups read the wrong side of the chart
**File:** `src/data/typeChart.js`

`getTypeMatchup()` looked up `TYPE_CHART[attackType]` and used its `weak`/`immune` lists. Those lists describe what a type *takes* when defending, so 65 of the 324 single-type matchups were wrong. Examples:

| Matchup | Before | Correct |
|---------|--------|---------|
| Flying vs Ground | 0x | 1x |
| Fire vs Ground | 0.5x | 1x |
| Electric vs Ground | 0.5x | 0x |
| Steel vs Poison | 0x | 1x |

**Fix:** look up each defending type and check `immune` → 0, `weak` → 2, `resist` → 0.5. Also added two missing resistances: Fire resists Ice, Poison resists Fairy. All 324 matchups are now tested against the reference chart.

### 2. `turnResolution.js` did not parse
The file had been saved as one line containing literal `\n` escapes. It was rewritten with the same logic and exports. One behaviour change: `resolveTurn()` no longer mutates the Pokémon objects passed in; HP now lives in the battle state.

---

## ✅ Phase 2 Items

### 1. Battle UI uses `resolveTurn()` ✅
**File:** `src/components/Battle/Battle.js`

- Replaced the inline "player always attacks first" logic with `resolveTurn()`
- Faster Pokémon attacks first; a KO'd Pokémon doesn't counterattack
- Each log entry is played back in order (second attack 300ms after the first) for sounds, animations and floating damage numbers
- Battle log messages show the real multiplier, e.g. `Super effective! (4x)`

### 2. Roster moved to a catalog and expanded ✅
**File:** `src/data/pokemonCatalog.js`

14 Pokémon, each with `hp`, `attack`, `defense`, `speed`, `types`, `emoji` and 3 moves:

| Pokémon | Types | Speed |
|---------|-------|-------|
| Gengar | Ghost/Poison | 110 |
| Garchomp | Dragon/Ground | 102 |
| Charizard | Fire/Flying | 100 |
| Pikachu | Electric | 90 |
| Lucario | Fighting/Steel | 90 |
| Gyarados | Water/Flying | 81 |
| Venusaur | Grass/Poison | 80 |
| Dragonite | Dragon/Flying | 80 |
| Gardevoir | Psychic/Fairy | 80 |
| Blastoise | Water | 78 |
| Scizor | Bug/Steel | 65 |
| Tyranitar | Rock/Dark | 61 |
| Lapras | Water/Ice | 60 |
| Machamp | Fighting | 55 |

Attack uses the higher of a Pokémon's Attack / Sp. Atk. New entries use base HP × 4; the original four kept their existing values.

### 3. Dual-type Pokémon ✅
- Pokémon store `types: [...]` instead of `type: '...'`
- Charizard is now Fire/Flying and Venusaur is Grass/Poison
- UI shows types as `Fire/Flying` via `formatTypes()`

### 4. Data validation at battle setup ✅
**File:** `src/battle/validation.js`

`validatePokemon(name, pokemon)` and `validateMove(move, label)` return a list of error messages:
- `hp`, `attack`, `defense`, `speed` must be positive finite numbers
- 1–2 types, all present in `TYPE_CHART`
- At least one move; each move needs a name, positive power and a known type

Clicking **Start Battle** with invalid data shows the errors and doesn't start the battle. Picking a different Pokémon clears them.

### 5. Battle summary stats ✅
**File:** `src/components/Battle/BattleResults.js`

When the battle ends, a results panel shows the winner, turn count, and for each side: damage dealt, damage taken, super effective / resisted / no-effect hits.

Log entries gained an `hpLost` field (HP actually removed), and `calculateTotalDamageDealt()` now sums it, so a finishing blow doesn't count overkill. Gengar KOing a 280 HP Pikachu shows 280 dealt, not 414.

### 6. Injectable RNG ✅
**Files:** `src/battle/opponent.js`, `src/components/Battle/Battle.js`

```javascript
chooseOpponentMove(moves, random = Math.random)  // → move index

<Battle />                      // uses Math.random
<Battle random={() => 0.5} />   // deterministic, for tests
```

### 7. Speed indicator ✅
The battle screen shows who acts first and why:
- `💨 Garchomp moves first (Speed 102 vs 100)`
- `💨 Gardevoir moves first (Speed tied at 80, opponent goes first)`

Green when the player goes first, orange when the opponent does.

### 8. Unit tests ✅

| File | Tests | Covers |
|------|-------|--------|
| `src/data/typeChart.test.js` | 329 | All 324 matchups vs reference chart, dual types, immunity, unknown types |
| `src/battle/validation.test.js` | 26 | Every roster entry is valid; each kind of bad data is reported |
| `src/battle/damage.test.js` | 11 | Formula, flooring, min 1 damage, immunity = 0, flags, turn order and ties |
| `src/battle/turnResolution.test.js` | 11 | Speed order, KO skips counter, slower Pokémon winning, HP floor, no mutation, totals |
| `src/battle/opponent.test.js` | 8 | Move index mapping, range clamping, `Math.random` default |
| `src/components/Battle/Battle.test.js` | 6 | Validation errors, speed indicator, full Gengar vs Pikachu battle with exact results, 0-damage immunity |

`src/setupTests.js` was added so `@testing-library/jest-dom` matchers (e.g. `toHaveTextContent`) are available.

---

## 🔁 API Changes

```javascript
// New: starting state for resolveTurn()
createBattleState(playerHP, opponentHP)
// → { currentTurn: 0, phase: 'player_select', winner: null, playerHP, opponentHP, battleLog: [] }

// resolveTurn() no longer reads/mutates pokemon.currentHP; HP comes from and returns in the state
const next = resolveTurn(state, playerPokemon, opponentPokemon, playerMove, opponentMove);
next.playerHP; next.opponentHP; next.winner;  // 'player' | 'opponent' | null

// Log entries gained hpLost
{ turn, actor, actorName, move, damage, hpLost, defenderHP, multiplier, isEffective, isResisted, isImmune }
```

---

## Files

| File | Change |
|------|--------|
| `src/data/typeChart.js` | Fixed matchup lookup; added 2 missing resistances |
| `src/data/pokemonCatalog.js` | 14-Pokémon roster, `getPokemon()`, `formatTypes()` |
| `src/battle/turnResolution.js` | Rewritten (was unparseable); `createBattleState()`, `hpLost` |
| `src/battle/validation.js` | New |
| `src/battle/opponent.js` | New |
| `src/components/Battle/Battle.js` | Uses catalog, `resolveTurn()`, validation, injectable RNG, speed indicator, results |
| `src/components/Battle/BattleResults.js` | Implemented (was a stub) |
| `src/setupTests.js` | New |
| `*.test.js` (6 files) | New |

---

## Verification

```bash
npm test -- --watchAll=false   # 391 tests
npm run build
```

---

## Known Issues

- Tests print a `ReactDOM.render is no longer supported in React 18` warning: `@testing-library/react` is v11, which predates React 18. Upgrading to v13+ removes it.
- Build has two pre-existing lint warnings: unused `useEffect` in `Battle.js` and unused `audioCache` in `audio.js`.
- The opponent picks moves at random, so some matchups are lopsided (e.g. Garchomp using Earthquake against Flying types does nothing).
- `src/data/moveCatalog.js` is still a stub; moves are defined per Pokémon in the catalog.

---

**Status:** Phase 2 Complete - Ready for Phase 3 ✅
