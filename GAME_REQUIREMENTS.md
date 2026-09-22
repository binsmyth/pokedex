# Pokémon Card Game - Requirements & Roadmap

**Project Vision:** Build a Pokémon card game with matchup battles, starting from the existing Pokédex app. Implement as tiny incremental features, progressively building from simple to complex.

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
- **Pokémon Selection:** Pick their Pokémon (or random option)
- **Move Selection:** Click move from their Pokémon's move pool each turn
- **View Stats:** See current HP, types, stats during battle
- **Replay/Share:** Save and view battle result

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

```
Base Damage = Move Power

Type Multiplier = Get from PokeAPI type matchups
  - 2x (super effective)
  - 1x (neutral)
  - 0.5x (resists)
  - 0x (immune)

Stat Modifier = Attacker ATK / Defender DEF
  - Clamp to reasonable range (0.5x - 2.0x)

FINAL DAMAGE = Base Damage × Type Multiplier × Stat Modifier

Apply to Defender HP:
  Defender HP = Defender HP - FINAL DAMAGE
  (Minimum 0)
```

### Turn Order
```
IF Attacker Speed > Defender Speed:
  Attacker goes first
ELSE:
  Defender goes first

(Ties: Defender goes first, or random, or simultaneous)
```

### State Management
```
Battle State:
{
  playerPokemon: {
    id, name, currentHP, maxHP, stats, moves, types
  },
  opponentPokemon: {
    id, name, currentHP, maxHP, stats, moves, types
  },
  currentTurn: number,
  battleLog: [
    { turn, actor, action, damage, result }
  ],
  winner: null | "player" | "opponent"
}
```

---

## Data Requirements

### From PokeAPI

**Pokémon Data:**
- `id` (national dex number)
- `name`
- `stats` (HP, Attack, Defense, Sp.Atk, Sp.Def, Speed)
- `sprites.front_default` (battle image)
- `types` (primary and secondary type)

**Moves Data:**
- `name`
- `power` (base power for damage calculation)
- `type` (for type matchup)
- `accuracy` (optional for Level 2+)
- `effect_chance` (for status effects in Level 3+)

**Type Matchups:**
- `/type/{type_id}`
  - `damage_relations.double_damage_to` (deals 2x to these types)
  - `damage_relations.half_damage_to` (deals 0.5x to these types)
  - `damage_relations.no_damage_to` (deals 0x to these types)
  - Reverse relations for defense

### How to Calculate Dual-Type Matchups
```
For Pokémon with Type1 and Type2:

Damage Taken Modifier = 
  (Damage vs Type1) × (Damage vs Type2)

Example: Fire/Flying type takes Damage from Rock:
  Rock vs Fire = 2x
  Rock vs Flying = 2x
  Total = 2x × 2x = 4x damage taken (very weak to Rock)
```

---

## Architecture Decisions

### Data Flow
```
Pokédex (existing) → Game Feature (new)
  - Reuse Pokémon cards/display
  - Link from detail view to battle simulator
  - Battle system is separate but consumes same PokeAPI data
```

### Component Structure (Suggested)
```
/src/components/
  /Battle/
    Battle.js (main battle container)
    BattleArena.js (visual battle display)
    MoveSelector.js (move button list)
    HealthBar.js (animated health display)
    DamageIndicator.js (floating damage numbers)
    BattleLog.js (turn summary)
  /Game/ (or /CardGame/)
    GameHome.js (battle entry point)
    BattleResultsScreen.js (winner display)
```

### State Management
- Local React state for MVP (useState)
- Could upgrade to Redux/Context for Level 3+ (multiple effects, status tracking)
- Keep battle logic in pure functions (easy to test, reuse, adapt)

### Future-Proofing
- **Battle Logic:** Extract to separate file/function so it can be reused for:
  - 6v6 team battles (loop 6 times)
  - AI battles (AI picks moves instead of random)
  - Battle replays (store and rerun same moves)
- **Animation System:** Use consistent library (Framer Motion, react-spring) so effects scale
- **Move/Ability System:** Modular so new effects can be added without rewriting core logic

---

## Future Considerations

### Level 2+ Features (Not in MVP)
- [ ] Move accuracy/critical hits
- [ ] Move accuracy stat (doesn't always hit)
- [ ] Abilities and hidden abilities
- [ ] Status effects (burn, paralyze, poison, sleep, freeze)
- [ ] Stat changes (ATK up/down, DEF up/down, Speed up/down)
- [ ] Conditional abilities (trigger on type, weather, terrain)
- [ ] Recoil damage, healing moves
- [ ] Protection moves (reduce damage next turn)
- [ ] Multi-turn moves (charge up then attack)

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
**Status:** Requirements Brainstorm Complete - Ready for Implementation Planning
