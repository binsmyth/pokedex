# Level 1 Battle System - Quick Reference

## 🎯 What's Done

### Phase 1 - Core Logic (`PHASE1_COMPLETION.md`)
1. **Type Chart** - All 18 Pokémon types
2. **Dual-Type Support** - Matchups multiply across both types
3. **Damage Formula** - Immunity (0x) deals 0 damage, everything else at least 1
4. **Turn Order** - Speed-based with tie-break and KO detection
5. **Turn Resolution** - Complete turn logic in `resolveTurn()`

### Phase 2 - Integration, Data & Tests (`PHASE2_COMPLETION.md`)
1. **Battle UI uses `resolveTurn()`** - Faster Pokémon attacks first, KO stops the counterattack
2. **14-Pokémon roster** in `pokemonCatalog.js`, 10 of them dual-type
3. **Validation** - Bad stats/types/moves block the battle with an error list
4. **Results screen** - Winner, turns, damage dealt/taken, effectiveness counts
5. **Injectable RNG** - `<Battle random={fn} />`
6. **Speed indicator** - "💨 Garchomp moves first (Speed 102 vs 100)"
7. **391 tests** - `npm test`
8. **Bug fixes** - Type matchup lookup (65/324 matchups were wrong), unparseable `turnResolution.js`

---

## 📂 Key Files

| File | Purpose | Status |
|------|---------|--------|
| `src/data/typeChart.js` | Type matchup system (18 types) | ✅ Complete |
| `src/data/pokemonCatalog.js` | Battle roster (14 Pokémon) | ✅ Complete |
| `src/battle/damage.js` | Damage calculation + turn order | ✅ Complete |
| `src/battle/turnResolution.js` | Turn resolution + damage totals | ✅ Complete |
| `src/battle/validation.js` | Pokémon/move data validation | ✅ Complete |
| `src/battle/opponent.js` | Opponent move choice (injectable RNG) | ✅ Complete |
| `src/components/Battle/Battle.js` | Battle UI | ✅ Integrated |
| `src/components/Battle/BattleResults.js` | End-of-battle stats | ✅ Complete |

---

## 🔧 How It Works

### Type Matchup Examples
```javascript
import { getTypeMatchup } from './data/typeChart';

// Single-type
getTypeMatchup('Fire', 'Grass')  // 2 (super effective)

// Dual-type (multiplicative)
getTypeMatchup('Water', ['Fire', 'Flying'])  // 2 (Fire weak) × 1 (Flying neutral) = 2
getTypeMatchup('Rock', ['Fire', 'Flying'])   // 2 × 2 = 4
getTypeMatchup('Ground', ['Dragon', 'Flying'])  // 1 × 0 = 0 (immune)
```

### Damage Calculation
```javascript
import { calculateDamage } from './battle/damage';

const result = calculateDamage(
  { attack: 100 },                     // Attacker stats
  { defense: 50, types: ['Water'] },   // Defender (one or two types)
  'Fire',                              // Move type
  50                                   // Move power
);
// 50 × (100 / 50) × 0.5 = 50
// → { damage: 50, multiplier: 0.5, isSuperEffective: false, isNotVeryEffective: true, isImmune: false }
```

### Turn Order
```javascript
import { determineTurnOrder } from './battle/damage';

determineTurnOrder(100, 50)   // Player faster → player acts first
determineTurnOrder(50, 100)   // Opponent faster → opponent acts first
determineTurnOrder(75, 75)    // Tie → opponent acts first (deterministic)
```

### Full Turn Resolution
```javascript
import { createBattleState, resolveTurn, calculateTotalDamageDealt } from './battle/turnResolution';
import { POKEMON_CATALOG } from './data/pokemonCatalog';

const gengar = { name: 'Gengar', ...POKEMON_CATALOG.Gengar };
const pikachu = { name: 'Pikachu', ...POKEMON_CATALOG.Pikachu };

let state = createBattleState(gengar.hp, pikachu.hp);
state = resolveTurn(state, gengar, pikachu, gengar.moves[0], pikachu.moves[1]);
// Returns a new state (inputs aren't mutated):
// - playerHP / opponentHP
// - winner: 'player' | 'opponent' | null, phase: 'player_select' | 'finished'
// - battleLog entries: { turn, actor, actorName, move, damage, hpLost, defenderHP,
//                        multiplier, isEffective, isResisted, isImmune }

calculateTotalDamageDealt(state.battleLog, 'player')  // HP actually removed (no overkill)
```

### Validation
```javascript
import { validatePokemon } from './battle/validation';

validatePokemon('Test', { hp: 0, attack: 50, defense: 50, speed: 50, types: ['Lava'], moves: [] })
// → ['Test: hp must be a positive number', 'Test: unknown type "Lava"', 'Test: must have at least one move']
```

### Deterministic Opponent
```javascript
import { chooseOpponentMove } from './battle/opponent';

chooseOpponentMove(moves)              // Math.random
chooseOpponentMove(moves, () => 0.5)   // always the middle move of 3

<Battle random={() => 0} />            // opponent always uses its first move
```

---

## ✅ Specification Compliance

### Type System
- [x] All 18 types implemented
- [x] All 324 single-type matchups match the reference chart (tested)
- [x] Dual-type matchups (multiplicative)
- [x] Correct immunity handling (0x = 0 damage)
- [x] Correct effectiveness tracking

### Battle Logic
- [x] Speed-based turn order
- [x] Tie-break (opponent first)
- [x] KO stops counter-attack
- [x] Damage formula: power × (atk/def) × multiplier
- [x] Minimum damage of 1 (except immunity)
- [x] Battle logging with metadata
- [x] Battle summary stats

### Data
- [x] Dual-type Pokémon in the roster
- [x] Pokémon/move validation before battle
- [x] Injectable RNG

---

## 🧪 Testing Commands

```bash
# Run all tests once
npm test -- --watchAll=false

# Run one file
npm test -- --watchAll=false src/battle/turnResolution.test.js

# Watch mode
npm test
```

`node -e "import(...)"` doesn't work for `src/battle/*.js`: they use extensionless imports, which only work through the CRA/Jest toolchain.

---

## 📋 Next Phase (Phase 3/4 from `IMPLEMENTATION_STATUS.md`)

### Remaining Tasks
1. Edge case tests for very long battles
2. Smarter opponent move choice (currently random)
3. Upgrade `@testing-library/react` to v13+ (removes the React 18 `ReactDOM.render` warning in tests)

---

## 📊 Feature Matrix

| Feature | Before Phase 1 | Now | Status |
|---------|----------------|-----|--------|
| Types | 6/18 | 18/18, all matchups tested | ✅ Complete |
| Dual-type | ❌ | ✅ Multiplicative, 10 dual-type Pokémon | ✅ Complete |
| Immunity | ❌ Wrong (1 damage) | ✅ 0 damage | ✅ Fixed |
| Turn order | ❌ Simultaneous | ✅ Speed-based, shown in UI | ✅ Complete |
| KO logic | ❌ Both attack | ✅ First KO stops | ✅ Complete |
| Turn resolution | ❌ Stub | ✅ Used by Battle UI | ✅ Complete |
| Roster | 4 hardcoded | 14 in catalog | ✅ Complete |
| Validation | ❌ | ✅ At battle setup | ✅ Complete |
| Results screen | ⚠️ Win/lose only | ✅ Stats table | ✅ Complete |
| Tests | ❌ None | ✅ 396 | ✅ Complete |

---

## 🎓 Key Concepts

### Type Effectiveness Multipliers
- **0x** = Immune (takes 0 damage)
- **0.25x** = Doubly resisted (both types resist)
- **0.5x** = Resisted (not very effective)
- **1x** = Neutral (normal damage)
- **2x** = Super effective (strong)
- **4x** = Double super effective (both types weak)

### Reading the Type Chart
Each entry in `TYPE_CHART` describes the type **when defending**:
- `weak` - attack types that deal 2x to it
- `resist` - attack types that deal 0.5x to it
- `immune` - attack types that deal 0x to it

`getTypeMatchup()` looks up the defender's entry. (`strong` is informational and not used for lookups.)

### Dual-Type Formula
```
multiplier = (matchup vs type1) × (matchup vs type2)

Examples:
- Fire vs Water/Flying = 0.5 × 1 = 0.5 (resisted)
- Electric vs Water/Flying = 2 × 2 = 4 (double super effective!)
- Rock vs Fire/Flying = 2 × 2 = 4 (double super effective!)
- Fighting vs Bug/Steel = 0.5 × 2 = 1 (neutral)
```

### Turn Order Priority
1. Compare speeds: higher speed → acts first
2. On tie: opponent acts first (deterministic)
3. After attack: check if defender fainted
4. If fainted: defender does NOT attack that turn

---

**Last Updated:** Oct 5, 2026
**Phase 1 Status:** ✅ COMPLETE
**Phase 2 Status:** ✅ COMPLETE
**Ready for:** Phase 3 (Testing edge cases) / Phase 4 (Polish & UX)
