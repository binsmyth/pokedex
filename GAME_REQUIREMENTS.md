# Pokémon Battle Simulator - Requirements & Roadmap

**Project Vision:** Add a 1v1 turn-based battle system to the Pokédex app where players can battle their favorite Pokémon using type matchups and stats. Implement as tiny incremental features, progressively building from simple to complex.

---

## Table of Contents
1. [Vision & Goals](#vision--goals)
2. [MVP (Level 1)](#mvp-level-1--ultra-simple)
3. [Progressive Roadmap](#progressive-roadmap)
4. [Technical Specifications](#technical-specifications)
5. [Data Requirements](#data-requirements)
6. [Architecture Decisions](#architecture-decisions)
7. [Future Considerations](#future-considerations)

---

## Vision & Goals

### Long-Term Goal
Create an engaging Pokémon card game where players can:
- Battle Pokémon with strategic matchups
- Experience visual and interactive gameplay
- Build teams and compete (far future)
- Eventually support competitive features (far future)

### Design Principles
- **Start Simple:** 1v1 matchups, fun over balance
- **Build Incrementally:** Tiny features that layer into complexity
- **Visual First:** Prioritize satisfying animations and feedback
- **Interactive:** Player choices matter each turn
- **Scalable Architecture:** Design for 6v6 teams from day one, even if MVP is 1v1

### Target Experience
- **Engagement:** Visual satisfaction + interactive turn-based gameplay
- **Speed:** Quick battles (2-5 minutes)
- **Fun:** Surprising matchups, not necessarily balanced or competitive

---

## MVP (Level 1) – Ultra Simple

### Feature Scope
**1v1 Battle System with Type Matchups + Stats**

### Battle Flow

```
SETUP PHASE:
1. Player selects their Pokémon (from Pokédex or favorites)
2. Opponent is assigned a random Pokémon
3. Both Pokémon appear on screen

BATTLE LOOP (each turn):
1. Player selects a move from their Pokémon's available move pool
2. Opponent selects a random move from their move pool
3. Determine turn order: Higher Speed stat goes first
4. Execute moves in order:
   - Calculate damage: (Move Power × Type Matchup) × (Attacker ATK / Defender DEF)
   - Display: Floating damage number + red flash on hit
   - Animate health bar depletion
5. Check if either Pokémon has fainted (HP = 0)
6. Repeat or show battle result

END CONDITION:
- First Pokémon to faint loses
- Show winner screen with battle summary
```

### Player Interactions
- **Pokémon Selection:** Pick their Pokémon from the Pokédex or use a random battle
- **Move Selection:** Click move from their Pokémon's available moves each turn
- **View Stats:** See current HP, types, stats during battle
- **Rematch:** Fight again or select different Pokémon

### Visual Elements Required

| Element | Description | Priority |
|---------|-------------|----------|
| Health Bars | Animated depletion from max HP to 0 | High |
| Damage Numbers | Floating text showing damage dealt | High |
| Red Flash | Visual feedback on hit | High |
| Speed Indicator | Show who goes first this turn | High |
| Pokémon Sprites | Large clear images of both Pokémon | High |
| Move UI | Button list of available moves | High |
| Type Badge | Show Pokémon type(s) with color | Medium |
| Move Info | Show move power, type, accuracy | Medium |
| Battle Log | Text summary of each turn's actions | Low |

### Win/Loss Conditions
- **Win:** Opponent's Pokémon reaches 0 HP
- **Loss:** Your Pokémon reaches 0 HP
- **Display:** Winner name + battle stats (turns, damage dealt, damage taken)

---

## Progressive Roadmap

### Level 1: Ultra Simple ✓ (THIS MVP)
**Type Matchups + Basic Stats**
- Type advantage (2x, 1x, 0.5x, 0x damage)
- Basic damage formula: Move Power × Type Matchup × (ATK/DEF ratio)
- Random opponent moves
- Speed-based turn order
- Visual feedback (damage numbers, red flash, health bars)

**Scope:** 1v1 only, fun matchups, no balance considerations

---

### Level 2: Simple + Stats
**Add Depth:** Move Strategy + Stat Variety
- Different moves have different power levels (not all equal)
- Stats vary significantly (some Pokémon are tanky, others are fast)
- Player might need to choose: Go for a strong attack or a tactical move
- Add move accuracy/critical hit chance (optional for MVP)

**New Features:**
- Move selection matters (not all moves are equally good)
- Stat distributions impact strategy
- Better visual representation of type matchups

**Architecture:** Keep battle loop the same, just more move variety

---

### Level 3: Medium Complexity
**Add Abilities & Status Effects**
- Pokémon abilities modify damage/mechanics (e.g., "Adaptability" boosts type moves)
- Status effects: Burn (reduce ATK), Paralyze (reduce Speed), Sleep, Freeze, Poison
- Some moves apply status effects
- Abilities activate conditionally

**New Features:**
- Ability descriptions on Pokémon cards
- Status effect icons and effects display
- Status effect calculations in damage formula
- More strategic depth in move choices

**Player Choices Expand:** Type matchups + stat advantage + status strategy + ability synergy

---

### Level 4: Complex – Full Game (Far Future)
**6v6 Team Battles & Strategic Depth**
- Build teams of 6 Pokémon
- Switch Pokémon between turns
- Type coverage strategy (does team cover weaknesses?)
- Held items (modify damage, apply effects)
- Advanced move effects (weather, terrain, stat changes)

**Architecture:** Reuse 1v1 battle logic for each matchup, loop 6 times

---

## Technical Specifications

### Damage Calculation Formula (Level 1)

Use this exact, deterministic formula:

```javascript
const calculateDamage = (moveData, attacker, defender) => {
  const baseRawDamage = moveData.power * (attacker.attack / defender.defense);
  const typeMultiplier = getTypeMatchup(moveData.type, defender.types);
  const rawDamage = baseRawDamage * typeMultiplier;
  const finalDamage = Math.max(1, Math.floor(rawDamage));
  return finalDamage;
};
```

**Formula Details:**
- `moveData.power`: The move's base power (never null; pre-curated moves only)
- `attacker.attack`: Base Attack stat (no level scaling for MVP)
- `defender.defense`: Base Defense stat
- `typeMultiplier`: Looked up from type matchup table
  - Dual-type: multiply damage vs Type1 × damage vs Type2 (e.g., Rock vs Fire/Flying = 2x × 2x = 4x)
  - Super effective: 2x
  - Resistant: 0.5x
  - Immune: 0x
- No STAB, no critical hits, no randomness in MVP
- **Minimum damage of 1** if result rounds below 1

**Examples:**
- Move Power 40, ATK 100, DEF 50, type 1x: `40 * (100/50) * 1 = 80 damage`
- Move Power 40, ATK 100, DEF 50, type 0.5x: `40 * (100/50) * 0.5 = 40 damage`
- Move Power 10, ATK 50, DEF 200, type 1x: `max(1, floor(10 * (50/200) * 1)) = max(1, floor(0.25)) = 1 damage`

### Turn Order & Resolution

**Speed-based turn order:**
- If `attacker.speed > defender.speed`: Attacker goes first
- If `attacker.speed <= defender.speed`: Defender goes first
  - (On a tie, defender always acts first to break symmetry)

**Critical rule: A Pokémon faints immediately upon reaching 0 HP**
- If the faster Pokémon KOs the slower one, the slower Pokémon does **not** get to act that turn
- If both reach 0 HP in the same turn (edge case): The turn order determines a winner (whoever would have acted last loses; first attacker wins)

**No simultaneous attacks in MVP**

### Battle State Machine

Battle progresses through discrete phases:

```
phase: "setup" | "player_select" | "resolving" | "finished"

Battle State:
{
  phase: "setup",  // Initial data loaded
  playerPokemon: { id, name, currentHP, maxHP, stats, moves, types },
  opponentPokemon: { id, name, currentHP, maxHP, stats, moves, types },
  currentTurn: number,
  battleLog: [ { turn, actor, action, damage, result } ],
  winner: null | "player" | "opponent"
}
```

**State Transitions:**
- `setup` → `player_select`: Both Pokémon loaded and ready
- `player_select` → `resolving`: Player selects a move
- `resolving` → `player_select`: Turn resolves, if both alive
- `resolving` → `finished`: Battle ends (either Pokémon at 0 HP)
- `finished` → `setup`: Player clicks Rematch/New Battle (reset all state)

---

## Data Requirements

### Move Catalog (Curated Local Data, MVP)

**For MVP, use a hand-curated move catalog with the following structure:**

```json
{
  "moves": [
    {
      "id": "move_123",
      "name": "Tackle",
      "power": 40,
      "type": "normal",
      "description": "A physical attack."
    },
    {
      "id": "move_124",
      "name": "Flame Charge",
      "power": 50,
      "type": "fire",
      "description": "A fire attack."
    }
  ]
}
```

**Why local curated moves?**
- PokeAPI move pools are version-specific and require complex filtering
- Many PokeAPI moves have `power: null` and unsupported effects
- A curated set ensures predictable battle balance and no surprises
- Easier to test and debug

**For Level 2+**, fetch move data from PokeAPI with filtering for `power != null` and version-specific learn methods.

### Pokémon Data (From PokeAPI or Pokédex Cache)

**Required fields for battle:**
- `id` (national dex number)
- `name`
- `stats` (array with keys: hp, attack, defense, sp_atk, sp_def, speed)
- `sprites.front_default` (battle image)
- `types` (array of 1-2 type objects)

**For MVP:** Cache Pokémon data once loaded in the Pokédex; reuse during battle. Do not require fresh API calls for battle startup.

### Type Matchup Table (Static Reference)

Embedding or loading from PokeAPI `/type/{type_id}` endpoint:
```
Damage Relations:
  - double_damage_to: types this type is strong against
  - half_damage_to: types this type resists
  - no_damage_to: types this type is immune to
```

**Dual-Type Calculation:**
```
Defender takes (Attack Type vs Def Type1) × (Attack Type vs Def Type2)

Example: Fire move vs Water/Flying Pokémon
  Fire vs Water = 0.5x (resists)
  Fire vs Flying = 2x (super effective)
  Total multiplier = 0.5x × 2x = 1x (neutral)
```

---

## Architecture Decisions

### Data Flow
```
Pokédex (existing) → Battle Feature (new)
  - Reuse cached Pokémon data from Pokédex
  - Link from Pokémon detail view to battle simulator
  - Battle system uses same type matchup data
```

### Component Structure
```
/src/components/
  /Battle/
    Battle.js (main battle container + state machine)
    BattleArena.js (visual battle display)
    MoveSelector.js (move button list, disabled when not in player_select phase)
    HealthBar.js (animated health display)
    DamageIndicator.js (floating damage numbers)
  /Game/ (or /CardGame/)
    BattleSetup.js (Pokémon selection screen)
    BattleResultsScreen.js (winner display)
```

### State Management (MVP)
- React `useState` for battle state
- Use a reducer pattern or explicit state machine for battle phases
- Keep all battle logic in pure, testable functions outside React:
  - `calculateDamage(move, attacker, defender)`
  - `resolveTurn(playerMove, opponentMove, state)`
  - `getTypeMatchup(moveType, defenderTypes)`
  - `determineFirstActor(attackerSpeed, defenderSpeed)`

### Not for MVP
- Redux, Context API (useState is sufficient)
- Persistent battle history or replay system
- Animations library beyond CSS transforms

### Future-Proofing
- **Battle Logic:** Extract to separate file/function so it can be reused for:
  - 6v6 team battles (loop 6 times)
  - AI battles (AI picks moves instead of random)
  - Battle replays (store and rerun same moves)
- **Animation System:** Use consistent library (Framer Motion, react-spring) so effects scale
- **Move/Ability System:** Modular so new effects can be added without rewriting core logic

---

## MVP Acceptance Criteria

A battle is shippable when:

**Core Gameplay:**
- [x] A battle can start using only local data (no required API calls)
- [x] Player can select their Pokémon from the Pokédex or random option
- [x] Opponent is assigned a random Pokémon
- [x] Each Pokémon has 2-4 valid, curated moves
- [x] Player can select only an available move while battle is in `player_select` phase
- [x] Speed stat correctly determines turn order (attacker goes first if higher, defender first on tie)
- [x] Damage is calculated using the exact formula specified above
- [x] Dual-type effectiveness is calculated correctly (multiplied)
- [x] A Pokémon with 0 HP faints immediately and cannot act
- [x] Battle ends exactly once
- [x] Winner, turns taken, and total damage dealt are displayed
- [x] Player can reset and start a new battle without page reload

**Visual & Interactive:**
- [x] Both Pokémon sprites visible side-by-side
- [x] Health bars animate smoothly from current to new HP
- [x] Damage numbers appear as floating text on hit
- [x] Type advantage/disadvantage is clearly indicated (colors or badges)
- [x] Move buttons are disabled outside of `player_select` phase
- [x] Move buttons are keyboard-operable (Tab, Enter)
- [x] Focus visible on interactive elements
- [x] Current turn and active Pokémon are clearly shown

**Robustness:**
- [x] Type matchups (neutral, super-effective, resistant, immune) are all correct
- [x] Minimum damage of 1 is enforced
- [x] Speed tie always resolves consistently (defender first)
- [x] Game handles missing sprites gracefully
- [x] No console errors during a full battle flow
- [x] Mobile viewport (320px-1200px) renders without horizontal scroll

**Testing:**
- [x] Pure damage calculation function has >90% coverage
- [x] Type matchup table is verified for all type combinations
- [x] Turn resolution includes tests for knockouts, order, and minimum damage

## Future Considerations

### Level 2+ Features (Not in MVP)
- [ ] Move accuracy/critical hits
- [ ] Abilities and hidden abilities
- [ ] Status effects (burn, paralyze, poison, sleep, freeze)
- [ ] Stat changes (ATK up/down, DEF up/down, Speed up/down)
- [ ] Conditional abilities (trigger on type, weather, terrain)
- [ ] Recoil damage, healing moves
- [ ] Protection moves (reduce damage next turn)
- [ ] Multi-turn moves (charge up then attack)
- [ ] Live move data fetching from PokeAPI
- [ ] Battle replay and sharing
- [ ] Sound effects and background music

### Level 3+ Features (Far Future)
- [ ] 6v6 team battles with switching
- [ ] Team builder UI
- [ ] Type coverage analysis ("Does your team cover all weaknesses?")
- [ ] Held items
- [ ] Weather effects (rain, sand, hail, sun)
- [ ] Terrain effects
- [ ] Move priority (some moves go first)
- [ ] Stat stage system (ATK +2, DEF -1, etc.)
- [ ] Competitive leaderboards
- [ ] Battle ratings/ELO
- [ ] AI opponent with strategy
- [ ] Replay/spectate battles
- [ ] Share battle links

### Social/Engagement (Far Future)
- [ ] Save favorite teams
- [ ] Battle history
- [ ] Win/loss records
- [ ] Trading cards (collect variants)
- [ ] Achievements/badges
- [ ] Seasonal events
- [ ] Daily challenges

### Technical Debt (Plan Early)
- Test coverage for damage calculations
- Performance optimization for animation rendering
- Mobile-responsive battle UI
- Accessibility (color-blind mode for type indicators)
- Offline support (cache PokeAPI data)

---

## Implementation Priority (Suggested)

### Phase 1: MVP (Level 1)
1. Battle UI mockup (both Pokémon side-by-side, health bars, move list)
2. Move selector component
3. Damage calculation function (testable, isolated)
4. Turn resolution logic (who goes first, apply damage)
5. Health bar animation
6. Damage number floating effect
7. Win/lose detection
8. Battle result screen

### Phase 2: Polish & Scale (Level 2)
- Add more visual effects
- Improve animations
- Add battle log/summary
- Optimize performance
- Mobile responsiveness

### Phase 3: Depth (Level 3)
- Abilities system
- Status effects
- More complex moves

### Phase 4: Teams (Level 4+)
- 6v6 battles
- Team builder
- Strategic depth

---

## Questions for Future Discussion

1. **Move Pool:** Should all Pokémon have the same 4 moves for simplicity, or use realistic move pools (complex)?
2. **Opponent Selection:** Random Pokémon or should player pick both?
3. **Animation Speed:** Fast & snappy or slow & dramatic?
4. **Stat Scaling:** Use raw stats or normalize them for more consistent battles?
5. **Visual Style:** Minimalist or elaborate animations?
6. **Sound:** Include sound effects and music or keep silent?

---

**Document Created:** 2026-09-22  
**Last Updated:** 2026-09-29  
**Status:** MVP Specification Complete - Ready for Implementation

---

## Implementation Checklist

### Phase 1: Setup & Core Logic (Week 1)
- [ ] Create `src/battle/` module with pure functions:
  - [ ] `calculateDamage.js` (with tests)
  - [ ] `typeMatchup.js` (type effectiveness table + lookup)
  - [ ] `resolveTurn.js` (turn order, damage application)
  - [ ] `battleState.js` (state machine logic)
- [ ] Create curated move catalog in `src/data/moves.json`
- [ ] Create test file with damage formula test cases

### Phase 2: React Components (Week 2)
- [ ] Build `BattleSetup.js` (Pokémon selection)
- [ ] Build `Battle.js` (state machine container)
- [ ] Build `BattleArena.js` (Pokémon display)
- [ ] Build `MoveSelector.js` (move buttons with keyboard support)
- [ ] Build `HealthBar.js` (animated bar)
- [ ] Build `DamageIndicator.js` (floating damage text)
- [ ] Build `BattleResults.js` (winner screen)

### Phase 3: Polish & Testing (Week 3)
- [ ] Add mobile responsiveness
- [ ] Implement type-based color indicators
- [ ] Add animation for health bar depletion
- [ ] Test all type matchups manually
- [ ] Test edge cases (knockouts, ties, minimum damage)
- [ ] Accessibility: keyboard navigation, focus states, ARIA labels

### Phase 4: Integration (Week 4)
- [ ] Link from Pokédex detail view to battle
- [ ] Cache Pokémon data from Pokédex
- [ ] Error handling and graceful degradation
- [ ] Performance review
