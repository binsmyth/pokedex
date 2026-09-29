# Level 1 Game Mechanics - 1v1 Battle System
**Pokémon Battle Simulator - MVP Implementation Guide**

---

## Table of Contents
1. [Overview](#overview)
2. [Core Mechanics](#core-mechanics)
3. [Battle Flow & Phases](#battle-flow--phases)
4. [Damage Calculation System](#damage-calculation-system)
5. [Type Effectiveness System](#type-effectiveness-system)
6. [Turn Resolution](#turn-resolution)
7. [Win/Loss Conditions](#winloss-conditions)
8. [UI/UX Requirements](#uiux-requirements)
9. [Player Interactions](#player-interactions)
10. [State Machine](#state-machine)
11. [Edge Cases & Resolution](#edge-cases--resolution)
12. [Game Balance Considerations](#game-balance-considerations)

---

## Overview

**Level 1** is an ultra-simple 1v1 turn-based battle system focused on:
- **Type matchups** as the primary strategic element
- **Base stat differences** affecting damage and speed
- **Visual feedback** through animations and floating numbers
- **Fun over balance** — surprising matchups matter more than perfect equilibrium

### Scope Constraints
- ✅ Only 1v1 battles (no teams, no switching)
- ✅ 2-4 curated moves per Pokémon
- ✅ Deterministic damage (no randomness)
- ✅ Speed-based turn order
- ✅ Local data only (no required API calls during battle)

### Non-Scope for Level 1
- ❌ Move accuracy or critical hits
- ❌ Abilities or hidden abilities
- ❌ Status effects (burn, paralyze, etc.)
- ❌ Stat changes mid-battle
- ❌ Held items
- ❌ Weather or terrain

---

## Core Mechanics

### 1. Type Matchup System

**Type effectiveness determines damage multipliers:**

| Effectiveness | Multiplier | Description |
|---|---|---|
| Super Effective | 2x | Attacking type is strong against defending type |
| Neutral | 1x | No advantage or disadvantage |
| Not Very Effective | 0.5x | Defending type resists attacking type |
| Immune | 0x | Defending type is immune to attacking type |

**Dual-Type Calculation Rule:**
When a defender has two types, multiply the matchups together:

```
Final Multiplier = (Matchup vs Type1) × (Matchup vs Type2)

Examples:
- Fire move vs Water/Flying defender = 0.5x (Water resists) × 2x (Flying weak) = 1x neutral
- Electric move vs Water/Flying defender = 2x (Water weak) × 0.5x (Flying resists) = 1x neutral
- Rock move vs Fire/Flying defender = 2x (Fire weak) × 2x (Flying weak) = 4x super effective
```

**Key Principle:** Type matchups are **deterministic, pre-calculated** and embedded as a static reference table.

### 2. Stat System (Level 1)

**Stats used in Level 1:**
- **HP** — Current health points (0 = fainted)
- **Attack (ATK)** — Determines physical damage output
- **Defense (DEF)** — Reduces incoming physical damage
- **Speed** — Determines turn order (higher = acts first)

**Stats NOT used in Level 1:**
- Sp. Atk / Sp. Def (special attack/defense) — use Attack/Defense for all moves
- Level scaling — use base stats only
- IV/EV (individual/effort values) — ignore for MVP

### 3. Move System (Level 1)

**Each move has:**
- **Power** — Base damage of the move (always a number, never null)
- **Type** — Type of the move (determines type matchup)
- **Description** — Flavor text for player understanding

**Move Pool Rule:**
- Each Pokémon has 2-4 available moves
- Moves are hand-curated (not fetched from PokeAPI to avoid null powers)
- All moves are physical damage (no distinction between physical/special)
- No move effects (no accuracy, no priority, no secondary effects in Level 1)

**Example Move Catalog:**
```json
{
  "move_001": { "id": "move_001", "name": "Tackle", "power": 40, "type": "normal" },
  "move_002": { "id": "move_002", "name": "Flame Charge", "power": 50, "type": "fire" },
  "move_003": { "id": "move_003", "name": "Water Pulse", "power": 60, "type": "water" },
  "move_004": { "id": "move_004", "name": "Earthquake", "power": 100, "type": "ground" }
}
```

### 4. Speed & Turn Order

**Determining who acts first each turn:**

```javascript
if (playerSpeed > opponentSpeed) {
  // Player acts first
  turnOrder = [player, opponent];
} else {
  // Opponent acts first (tie-break: opponent first)
  turnOrder = [opponent, player];
}
```

**Critical Rule:** If the first actor knocks out the opponent, the opponent does NOT get to act that turn.

---

## Battle Flow & Phases

### Full Battle Timeline

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: SETUP                                      │
│ - Show Pokémon selection screen                     │
│ - Player picks their Pokémon (or "Random")          │
│ - Assign opponent a random Pokémon                  │
│ - Load both Pokémon data                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 2: PLAYER SELECT (Player's turn to act)       │
│ - Display both Pokémon side-by-side                 │
│ - Show health bars, types, stats                    │
│ - Display opponent's Pokémon's available moves      │
│ - Enable move buttons for PLAYER ONLY               │
│ - Player selects one of their available moves       │
│ - WAIT for player input                             │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 3: RESOLVING (AI picks move + battle logic)   │
│ - Opponent selects a random move from pool          │
│ - Determine turn order based on Speed stat          │
│ - Execute attacks in order:                         │
│   1. Calculate damage for 1st attacker              │
│   2. Animate damage on 1st defender                 │
│   3. Check if 1st defender fainted (HP = 0)         │
│   4. If not fainted, execute 2nd attacker's move    │
│   5. Animate damage on 2nd defender                 │
│   6. Check if 2nd defender fainted                  │
│ - Increment turn counter                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ DECISION POINT: Anyone fainted?                     │
│  YES → PHASE 4: FINISHED                            │
│  NO  → PHASE 2: PLAYER SELECT (repeat)              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ PHASE 4: FINISHED (Battle over)                     │
│ - Disable all move buttons                          │
│ - Show winner announcement                          │
│ - Display battle summary:                           │
│   • Winner name                                     │
│   • Total turns fought                              │
│   • Damage dealt by winner                          │
│   • Damage taken by winner                          │
│ - Show "Rematch" and "New Battle" buttons            │
└─────────────────────────────────────────────────────┘
```

### Detailed Turn Sequence Example

**Turn 1:** Player has Speed 90, Opponent has Speed 60
- Turn order: Player first
- Player attack resolves → Opponent takes damage
- If Opponent HP > 0: Opponent's move executes
- If either at 0 HP → Battle ends, if not → next turn

---

## Damage Calculation System

### Damage Formula (Exact - Custom Arcade Formula)

**IMPORTANT:** This is a simplified, custom arcade game formula, NOT the official Pokémon formula. It is intentionally simplified for clarity and speed of play.

```javascript
const calculateDamage = (moveData, attacker, defender) => {
  // Step 1: Base damage calculation
  const baseRawDamage = moveData.power * (attacker.attack / defender.defense);
  
  // Step 2: Get type effectiveness
  const typeMultiplier = getTypeMatchup(moveData.type, defender.types);
  
  // Step 3: Apply multiplier
  const rawDamage = baseRawDamage * typeMultiplier;
  
  // Step 4: Handle immunity as special case (0x = 0 damage, not 1)
  if (typeMultiplier === 0) {
    return 0;
  }
  
  // Step 5: Floor and enforce minimum of 1
  const finalDamage = Math.max(1, Math.floor(rawDamage));
  
  return finalDamage;
};
```

### Formula Components

| Component | Source | Notes |
|---|---|---|
| `moveData.power` | Move catalog | Always a positive number (40-100+) |
| `attacker.attack` | Base stat | Raw attack stat, no modifiers |
| `defender.defense` | Base stat | Raw defense stat, no modifiers |
| `typeMultiplier` | Type matchup table | 0x (immunity), 0.5x, 1x, or 2x |

### Formula Examples

**Example 1: Standard damage**
```
Move: Tackle (Power 40)
Attacker: Pikachu (ATK 55)
Defender: Squirtle (DEF 65)
Type Matchup: Normal vs Water = 0.5x (resisted)

Calculation:
- baseRawDamage = 40 * (55 / 65) = 40 * 0.846 = 33.84
- typeMultiplier = 0.5x
- rawDamage = 33.84 * 0.5 = 16.92
- finalDamage = floor(16.92) = 16
```

**Example 2: Super effective**
```
Move: Flame Charge (Power 50)
Attacker: Charmander (ATK 52)
Defender: Bulbasaur (DEF 43)
Type Matchup: Fire vs Grass = 2x (super effective)

Calculation:
- baseRawDamage = 50 * (52 / 43) = 50 * 1.209 = 60.47
- typeMultiplier = 2x
- rawDamage = 60.47 * 2x = 120.94
- finalDamage = floor(120.94) = 120
```

**Example 3: Minimum damage**
```
Move: Ember (Power 40)
Attacker: Tiny Pokémon (ATK 20)
Defender: Huge Pokémon (DEF 300)
Type Matchup: Fire vs Water = 0.5x (resisted)

Calculation:
- baseRawDamage = 40 * (20 / 300) = 40 * 0.067 = 2.67
- typeMultiplier = 0.5x
- rawDamage = 2.67 * 0.5x = 1.33
- finalDamage = max(1, floor(1.33)) = max(1, 1) = 1
```

### Critical Rules

1. **No STAB (Same Type Attack Bonus)** — Attacker being the same type as move does NOT increase damage
2. **No critical hits** — No random damage variation
3. **No randomness** — Damage is always deterministic and reproducible
4. **No accuracy** — All moves always hit (no miss mechanic)
5. **No environmental modifiers** — No weather, terrain, or items
6. **No level scaling** — Use base stats only, not level-scaled stats
7. **No stat changes** — Attack and Defense do not change mid-battle
8. **Immunity is zero damage** — Immune matchups (0x) deal 0 damage, NOT 1
9. **Minimum damage of 1 for non-immune attacks** — Even tiny Pokémon can chip away at giants, except for immune types

---

## Type Effectiveness System

### Type Matchup Table Structure

Each type has relationships defined:
- **Strong Against** (deals 2x damage)
- **Weak To** (takes 2x damage)
- **Resists** (takes 0.5x damage)
- **Immune To** (takes 0x damage)

### Matchup Resolution

**Single Type vs Single Type:**
```
If attacking type is in defender's "Weak To" → 2x
If attacking type is in defender's "Resists" → 0.5x
If attacking type is in defender's "Immune To" → 0x
Otherwise → 1x
```

**Dual Type Calculation:**
```
multiplier = matchup(attackType vs defType1) × matchup(attackType vs defType2)

Example: Electric attack vs Water/Flying defender
- Electric vs Water = 2x (super effective)
- Electric vs Flying = 0.5x (resisted)
- Final = 2x × 0.5x = 1x (neutral)
```

### Full Type Chart (18 Types)

```
Type matchups are derived from the official Pokémon type table.
Implement using:
1. Static JSON lookup table with all 18² type combinations
2. OR fetch from PokeAPI /type/{id}/damage_relations endpoint
3. Cache the table once loaded for fast lookups during battle

Key Matchups (examples):
- Fire: Strong vs Grass, Bug, Steel | Weak to Water, Ground, Rock
- Water: Strong vs Fire, Ground, Rock | Weak to Electric, Grass
- Electric: Strong vs Water, Flying | Weak to Ground
- Grass: Strong vs Water, Ground, Rock | Weak to Fire, Ice, Poison, Flying, Bug
- Ground: Strong vs Fire, Electric, Poison, Rock, Steel | Weak to Water, Grass, Ice
- Rock: Strong vs Fire, Ice, Flying, Bug | Weak to Water, Grass, Fighting, Ground, Steel
```

### Dual-Type Examples

| Attack Type | Defender Types | Matchup | Result |
|---|---|---|---|
| Fire | Water/Flying | 0.5x (Water resists) × 2x (Flying weak to Rock) | 1x |
| Electric | Water/Flying | 2x (Water weak) × 0.5x (Flying resists) | 1x |
| Rock | Fire/Flying | 2x (Fire weak) × 2x (Flying weak) | 4x |
| Water | Fire/Rock | 2x (Fire weak) × 2x (Rock weak) | 4x |
| Grass | Water/Ground | 2x (Water weak) × 2x (Ground weak) | 4x |
| Fighting | Normal/Ghost | 2x (Normal weak) × 0x (Ghost immune) | 0x (immune)

---

## Turn Resolution

### Turn Resolution Algorithm

```javascript
function resolveTurn(playerMove, opponentMove, playerPokemon, opponentPokemon, battleState) {
  // Step 1: Determine who acts first
  const [firstActor, secondActor] = determineOrder(
    playerPokemon.speed,
    opponentPokemon.speed,
    playerMove,
    opponentMove
  );

  // Step 2: First actor attacks
  const damage1 = calculateDamage(firstActor.move, firstActor.pokemon, secondActor.pokemon);
  secondActor.pokemon.currentHP = Math.max(0, secondActor.pokemon.currentHP - damage1);
  
  battleState.battleLog.push({
    turn: battleState.currentTurn,
    actor: firstActor.pokemon.name,
    move: firstActor.move.name,
    damage: damage1,
    defenderHP: secondActor.pokemon.currentHP
  });

  // Step 3: Check if second actor fainted
  if (secondActor.pokemon.currentHP <= 0) {
    battleState.winner = firstActor.role; // "player" or "opponent"
    battleState.phase = "finished";
    return;
  }

  // Step 4: Second actor attacks (only if still alive)
  const damage2 = calculateDamage(secondActor.move, secondActor.pokemon, firstActor.pokemon);
  firstActor.pokemon.currentHP = Math.max(0, firstActor.pokemon.currentHP - damage2);
  
  battleState.battleLog.push({
    turn: battleState.currentTurn,
    actor: secondActor.pokemon.name,
    move: secondActor.move.name,
    damage: damage2,
    defenderHP: firstActor.pokemon.currentHP
  });

  // Step 5: Check if first actor fainted
  if (firstActor.pokemon.currentHP <= 0) {
    battleState.winner = secondActor.role;
    battleState.phase = "finished";
    return;
  }

  // Step 6: Both alive, prepare for next turn
  battleState.currentTurn += 1;
  battleState.phase = "player_select";
}
```

### Turn Order Determination

```javascript
function determineFirstActor(playerSpeed, opponentSpeed) {
  // Higher speed acts first
  // On tie, opponent always acts first
  if (playerSpeed > opponentSpeed) {
    return "player"; // Player acts first
  } else {
    return "opponent"; // Opponent acts first (includes tie-break)
  }
}
```

### Critical Turn Resolution Rule

**If the first actor KOs the second actor, the second actor does NOT get to attack.**

This is crucial for turn order advantage. Higher speed is a real tactical advantage.

---

## Win/Loss Conditions

### Victory Conditions

A player **wins** when:
- Opponent's Pokémon HP reaches exactly 0 (or below)
- This can happen on any turn, regardless of order

### Display on Victory

Show a **Battle Results Screen** with:
- Large "You Won!" or "Opponent Won!" message
- Winner Pokémon name
- Total number of turns fought
- Total damage dealt by the winner
- Total damage taken by the winner
- Buttons: "Rematch" (same Pokémon) and "New Battle" (pick new Pokémon)

### Battle Summary Calculation

```javascript
const battleSummary = {
  winner: battleState.winner,
  winnerName: battleState.winner === "player" 
    ? playerPokemon.name 
    : opponentPokemon.name,
  turns: battleState.currentTurn,
  damageDealt: calculateTotalDamage(battleState.battleLog, battleState.winner),
  damageTaken: calculateTotalDamage(battleState.battleLog, 
    battleState.winner === "player" ? "opponent" : "player")
};

function calculateTotalDamage(battleLog, actor) {
  return battleLog
    .filter(log => log.actor === actor)
    .reduce((sum, log) => sum + log.damage, 0);
}
```

---

## UI/UX Requirements

### Battle Arena Layout

```
┌─────────────────────────────────────────────────────┐
│                    BATTLE SCREEN                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Opponent Pokémon          │          Player Pokémon │
│  [Sprite Image]            │          [Sprite Image]  │
│  Charizard                  │          Blastoise      │
│  Type: Fire/Flying          │          Type: Water     │
│                             │                        │
│  ████░░░░░░░ HP: 45/100    │     ██████░░░░ HP: 72/90 │
│                             │                        │
│  STATS:                     │          STATS:         │
│  ATK: 84  DEF: 78           │          ATK: 83  DEF: 100│
│  SPD: 100                   │          SPD: 78        │
│                             │                        │
├─────────────────────────────────────────────────────┤
│  TURN 3  |  Opponent uses Flame Burst!              │
│          |  Blastoise takes 35 damage!              │
│                                                     │
│          ┌─────────────────────────────────────┐    │
│          │ ⚡ YOUR TURN - SELECT A MOVE:       │    │
│          │ [A] Aqua Jet (60 Power, Water)    │    │
│          │ [B] Ice Beam (90 Power, Ice)      │    │
│          │ [C] Protect (Block one turn)      │    │
│          │ [D] Hydro Pump (110 Power, Water)│    │
│          └─────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Visual Feedback Elements

| Element | Purpose | Implementation |
|---|---|---|
| Health Bars | Show current HP visually | Animated bar that smoothly depletes |
| Damage Numbers | Floating text above hit Pokémon | "+35 DMG" floats up and fades |
| Red Flash | Impact feedback on defender | 200ms red tint overlay on sprite |
| Type Badges | Show Pokémon types visually | Colored circles with type names |
| Move Buttons | Select next move | Disabled outside `player_select` phase |
| Turn Counter | Track battle progress | "Turn 3" text updates each round |
| Speed Indicator | Show who's faster | "⚡ Opponent acts first this turn" |
| Battle Log | Text summary of actions | Scrollable log of moves and damage |

### Color & Visual Design

**Type Badge Colors** (standardized):
- Normal: Gray
- Fire: Red/Orange
- Water: Blue
- Electric: Yellow
- Grass: Green
- Ice: Cyan
- Fighting: Brown
- Poison: Purple
- Ground: Sandy Brown
- Flying: Light Blue
- Psychic: Pink
- Bug: Lime Green
- Rock: Gray Brown
- Ghost: Purple/Gray
- Dragon: Purple/Blue
- Dark: Dark Gray
- Steel: Silver
- Fairy: Pink

---

## Player Interactions

### Pokémon Selection Screen

**Flow:**
1. Player sees two options:
   - "Pick Your Pokémon" (browse Pokédex, click to select)
   - "Random Battle" (auto-select a random Pokémon)
2. Show selected Pokémon with stats and available moves
3. Opponent Pokémon assigned randomly
4. "Start Battle" button activates

### Move Selection

**Constraints:**
- Move buttons are ONLY enabled during `player_select` phase
- Clicking a move immediately locks in choice and transitions to `resolving` phase
- Once opponent's move is generated, both moves resolve

**Keyboard Support:**
- A/B/C/D or 1/2/3/4 keys map to move buttons
- Tab to cycle between move buttons
- Enter to select highlighted move
- Clear visual focus state on active button

### Rematch & New Battle

**After battle finishes:**
- "Rematch" button: Same Pokémon, fresh battle (reset HP)
- "New Battle" button: Return to Pokémon selection screen
- Both options reset `battleState.currentTurn` to 0

---

## State Machine

### Battle States

```
┌──────────┐
│  setup   │  Initial state, loading Pokémon data
└────┬─────┘
     │
     ↓
┌──────────────────┐
│ player_select    │  Waiting for player input on move
└────┬─────────────┘
     │
     ├─ Player selects move ──→ RESOLVING
     │
     └─ Player wants to quit ──→ FINISHED (abandoned)
           
┌──────────────────┐
│   resolving      │  Both moves locked in, executing turn
└────┬─────────────┘
     │
     ├─ One Pokémon faints ──→ FINISHED (battle end)
     │
     └─ Both alive ──→ PLAYER_SELECT (next turn)

┌──────────────────┐
│   finished       │  Battle over, show results
└────┬─────────────┘
     │
     ├─ Rematch ──→ SETUP (same Pokémon, reset HP)
     │
     └─ New Battle ──→ SETUP (back to selection)
```

### State Object Structure

```javascript
{
  // Metadata
  phase: "setup" | "player_select" | "resolving" | "finished",
  currentTurn: number,
  winner: null | "player" | "opponent",
  
  // Pokémon State
  playerPokemon: {
    id: number,
    name: string,
    currentHP: number,
    maxHP: number,
    stats: {
      hp: number,
      attack: number,
      defense: number,
      spAtk: number,
      spDef: number,
      speed: number
    },
    types: ["water", "ground"],
    moves: [
      { id: "move_001", name: "Aqua Jet", power: 60, type: "water" },
      // ...
    ],
    sprite: "url/to/sprite.png"
  },
  
  opponentPokemon: { /* same structure */ },
  
  // Battle Log
  battleLog: [
    {
      turn: number,
      actor: string,        // Pokémon name
      move: string,          // Move name
      damage: number,
      defenderHP: number,
      multiplier: number     // Type matchup used
    },
    // ...
  ]
}
```

---

## Edge Cases & Resolution

### Case 1: Speed Tie

**Scenario:** Both Pokémon have identical Speed stat

**Resolution:** Opponent always acts first (deterministic tie-break)

```javascript
if (playerSpeed > opponentSpeed) {
  firstActor = player;
} else {
  // This includes: opponent > player OR opponent === player
  firstActor = opponent;
}
```

### Case 2: One Pokémon KOs the Other on First Attack

**Scenario:** Player moves first, KOs opponent in one hit

**Resolution:** Opponent does NOT get to attack

```javascript
if (defenderHP <= 0 after firstAttack) {
  battleState.winner = firstActor;
  battleState.phase = "finished";
  // Second attacker's move is NOT executed
  return;
}
```

### Case 3: Both Pokémon Reach 0 HP in Same Turn

**Scenario:** Player's Pokémon KOs opponent, but opponent was moving second and somehow would KO player (hypothetical)

**Resolution:** This cannot happen in Level 1 because second attacker doesn't act if first attacker faints them. But if somehow both reach 0, first attacker wins (they acted first and fainted opponent).

### Case 4: Minimum Damage on Frail Attacker

**Scenario:** Tiny Pokémon attacking huge Pokémon with low damage roll

**Resolution:** Minimum damage of 1 is enforced

```javascript
const finalDamage = Math.max(1, Math.floor(rawDamage));
```

### Case 5: Immune Type Matchup

**Scenario:** Ghost move used on Normal-type Pokémon

**Resolution:** 0x multiplier, so damage = 0... but Level 1 enforces minimum 1

**Design Choice:** Either:
1. Enforce minimum damage of 1 (Ghost moves do 1 damage to Normal types)
2. OR prevent moves from being 0x damage by design (e.g., curated moves)

**Recommendation:** Use option 2 — curate move pools so super-resistant/immune combos don't appear in Level 1. This keeps damage always relevant.

### Case 6: Decimal Precision

**Scenario:** `40 * (55/65) * 0.5` produces a float

**Resolution:** Always floor the final damage before returning

```javascript
const finalDamage = Math.max(1, Math.floor(rawDamage));
```

---

## Game Balance Considerations

### What Affects Damage Output

**Factors IN Level 1:**
1. Move power (40-100+)
2. Attacker's Attack stat
3. Defender's Defense stat
4. Type matchup (0.5x, 1x, 2x)

**Factors NOT in Level 1:**
- Attacker's level
- Attacker's individual values (IVs)
- Attacker's effort values (EVs)
- Critical hits or random variance
- Status effects (burn lowers ATK, etc.)
- Abilities

### Expected Battle Lengths

**Typical 1v1 battles:**
- Average battle: 3-6 turns
- Longest battle: 10+ turns (if type-resisted)
- Shortest battle: 1 turn (super effective KO)

**Balance rule:** Type matchup is the primary balance lever. A 2x type advantage can swing a battle dramatically.

### Strategy Layer (Level 1)

**Player choice:** Select which move to use each turn
- High power move: High damage, but predictable
- Type-advantage move: Lower power, but leverages matchup
- Balanced move: Middle-ground option

This creates a small decision space. With only 2-4 moves, the player learns matchups quickly and makes informed choices.

---

## Implementation Checklist

### Before Starting Code
- [x] Understand type matchup table (18 types)
- [x] Understand damage formula (power × atk/def × type)
- [x] Understand turn order (speed-based with tie-break)
- [x] Understand win condition (first to 0 HP loses)
- [x] Understand state machine (4 phases)

### Core Logic (Test First)
- [ ] `calculateDamage(move, attacker, defender)` function
  - [ ] Test standard damage
  - [ ] Test super-effective (2x)
  - [ ] Test resisted (0.5x)
  - [ ] Test immune (0x → 1 minimum)
  - [ ] Test minimum damage of 1
- [ ] `getTypeMatchup(moveType, defenderTypes)` function
  - [ ] Test single-type matchups
  - [ ] Test dual-type matchups
  - [ ] Test all 18² type combinations
- [ ] `resolveTurn(playerMove, opponentMove, state)` function
  - [ ] Test turn order based on speed
  - [ ] Test KO on first attack
  - [ ] Test both attacks in a turn
  - [ ] Test HP cannot go below 0

### UI Components
- [ ] `BattleSetup.js` — Pokémon selection
- [ ] `BattleArena.js` — Main battle display
- [ ] `MoveSelector.js` — Move buttons
- [ ] `HealthBar.js` — Animated HP bar
- [ ] `DamageIndicator.js` — Floating damage numbers
- [ ] `BattleResults.js` — Winner screen

### Integration
- [ ] Link from Pokédex detail view to battle
- [ ] Cache Pokémon data
- [ ] Load move catalog
- [ ] Load type matchup table

---

## Document Version History

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-09-29 | Initial Level 1 Game Mechanics document |

---

**Status:** Ready for Development  
**Next Phase:** Level 2 (Move Strategy + Stat Variety)
