# Critique of `GAME_REQUIREMENTS.md`

## Overall assessment

The document is a useful feature brainstorm, but it is not yet an implementation-ready requirements specification. It mixes a Pokémon battle simulator, a Pokémon Trading Card Game, and a future competitive RPG-style battle system. The MVP can be made much smaller and clearer before coding begins.

## Highest-priority issues

### 1. Define the game being built
The title says “Pokémon Card Game,” but the described mechanics are mostly a real-time-data Pokémon battle simulator: Pokémon species, Speed, Attack/Defense, moves, abilities, and six-Pokémon teams. A card game would normally require cards, decks, resources, turns, attacks, and card-specific rules.

**Recommendation:** Rename it to “Pokémon Battle Simulator” unless cards are genuinely required. Explicitly define the player objective, audience, platform, and whether this is single-player only.

### 2. The MVP is too large and internally inconsistent
The MVP includes selection, remote data loading, move pools, opponent AI, type calculations, stats, turn ordering, animation sequencing, battle logging, results, replay, and sharing. “Replay/Share” is also listed as an MVP interaction but has no storage or link format behind it.

**Recommendation:** Make the first vertical slice:

1. Choose from a fixed local list of 3–6 Pokémon.
2. Fight one fixed opponent.
3. Give each Pokémon exactly 2–4 curated moves.
4. Select a move; opponent chooses randomly.
5. Resolve damage and display win/loss.
6. Reset or start another battle.

Defer favorites, replay, sharing, arbitrary Pokédex selection, and live move-pool generation.

### 3. Core rules are underspecified
Important rules are ambiguous or missing:

- Are stats raw base stats or level-scaled battle stats?
- What is the Pokémon level?
- Are moves physical or special? Which attacking and defending stats apply?
- Are moves with `power: null` excluded?
- How is damage rounded, and is there a minimum damage of 1?
- Does same-type attack bonus apply?
- Are type immunities absolute?
- What happens when the faster Pokémon faints the slower one before it attacks?
- What exactly happens on a Speed tie? The document gives multiple possible answers.
- Is damage random or deterministic?
- Does an invalid or unavailable move appear in the UI?
- Can the player select a move after a battle has ended?

**Recommendation:** Write a small, normative rules section with one exact algorithm and examples. Avoid “or,” “optional,” and “reasonable range” in implementation rules.

### 4. The damage formula is not a coherent Pokémon formula
`Move Power × Type Multiplier × ATK/DEF` is acceptable as an intentionally simplified game formula, but it is not the Pokémon formula and produces potentially extreme outcomes. Clamping the stat ratio to `0.5x–2.0x` is not enough to define balance. The requirements also omit STAB, level, move category, rounding, minimum damage, randomness, and critical hits.

**Recommendation:** Either:

- clearly label this as a custom arcade formula and specify fixed constants, or
- implement a documented subset of the official formula.

For a first version, use curated battle stats and a deterministic formula such as:

```text
rawDamage = move.power * attacker.attack / defender.defense
finalDamage = max(1, floor(rawDamage * typeMultiplier))
```

Then test neutral, super-effective, resistant, and immune cases.

### 5. Move data cannot be obtained as described
PokeAPI Pokémon records do not directly provide a ready-to-use “available move pool” with complete battle data. Building a pool requires filtering Pokémon move entries by version group and learn method, then fetching individual move resources. Many moves have no power and have effects the MVP does not support.

**Recommendation:** Use a local curated move catalog for the MVP. If PokeAPI remains the source, specify the supported game/version, learn method, request strategy, caching, loading states, and filtering rules.

### 6. Architecture is premature in some places and insufficient in others
The proposed component tree is reasonable, but the requirements do not define module boundaries for the actual game rules, data normalization, or state transitions. “Reuse 1v1 battle logic for each matchup” will not be sufficient for 6v6 switching, entry effects, forced switches, team state, or replacement decisions.

**Recommendation:** Keep the MVP simple but isolate pure modules:

- `data/pokemonCatalog`
- `data/moveCatalog`
- `battle/damage`
- `battle/resolveTurn`
- `battle/types`
- React UI components

Use a reducer or explicit state machine for battle phases (`setup`, `awaiting_player_move`, `resolving`, `finished`) rather than scattered state updates. Do not choose Redux merely for future possibilities.

## Missing implementation requirements

### Data and API behavior
Specify API failure behavior, retries, request cancellation, loading states, cache duration, missing sprites, generation scope, and whether the app must work offline. PokeAPI availability should not determine whether a previously loaded battle can finish.

### UX and accessibility
The requirements need keyboard-operable move buttons, visible focus states, text alternatives for sprites and animations, non-color-only type indicators, reduced-motion behavior, mobile layout, and readable contrast. Damage and battle results must be announced to assistive technology.

### Testing
Add acceptance tests for:

- each type multiplier, including dual types and immunity;
- damage rounding and minimum damage;
- Speed order and ties;
- a first-hit knockout;
- both Pokémon reaching zero in the same resolution;
- move selection and disabled states;
- reset and rematch;
- API failure and incomplete data.

The pure battle functions should be tested independently of React.

### Scope and delivery
There are no explicit non-goals, milestones with completion criteria, or performance targets. The roadmap contains many “future” features that can distract from shipping the core loop.

**Recommendation:** Add a Definition of Done for the MVP: a user can start a battle, make valid move selections, see deterministic rule-correct outcomes, finish, rematch, and use the feature on a mobile viewport without console errors.

## Suggested revised MVP acceptance criteria

- A battle can start using a local catalog without a network request.
- Each side has one Pokémon with known HP, stats, type, and 2–4 valid moves.
- Every move has a defined power and type.
- The player can select only an available move while the battle is active.
- Turn order follows the specified Speed rule, including a specified tie rule.
- Damage is calculated by one tested, deterministic formula.
- Dual-type effectiveness is multiplied correctly.
- A fainted Pokémon cannot act.
- The battle ends exactly once and displays winner, turns, and damage totals.
- Reset returns the game to a clean setup state.
- Loading, API error, missing image, keyboard, mobile, and reduced-motion states are handled.

## Editorial issues

- The file is named `GAME_REQUIREMENTS.md`, while the request refers to `game_requirements.md`; standardize naming if tooling depends on it.
- “Level 1,” “MVP,” and “Phase 1” overlap and make scope harder to follow.
- “Optional for MVP,” “or,” and “far future” leave decisions unresolved.
- The document says “Document Created: 2026-09-22,” which appears future-dated and should be corrected or generated automatically.
- “Replay/Share” is presented as a requirement but appears only as an unanswered future implementation problem.

## Bottom line

The strongest next step is not to build the full roadmap. First resolve the product identity, replace remote dynamic move data with a curated catalog, specify exact battle rules, and ship a tested local-data vertical slice. Once that loop is enjoyable and stable, API integration, richer moves, status effects, and team battles can be added as separate requirements.