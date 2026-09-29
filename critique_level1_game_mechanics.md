# Critique: `level1_game_mechanics.md`

## Overall assessment

The document is a strong, readable MVP specification: it defines scope, a state machine, core formulas, UI expectations, and test targets. It is close to implementation-ready, but several contradictions and design decisions should be resolved before coding.

## Strengths

- Clear Level 1 scope: 1v1, curated moves, local data, and no status effects.
- Pure-function-oriented architecture makes the battle logic testable.
- Turn resolution correctly stops after a knockout.
- Dual-type effectiveness is correctly described as multiplicative.
- The document includes useful UI, accessibility, edge-case, and testing requirements.
- The deterministic rules are appropriate for a first implementation.

## Critical issues to fix

### 1. Immunity conflicts with the minimum-damage rule
The formula says `Math.max(1, ...)`, which turns a `0x` immunity into 1 damage. That contradicts the stated meaning of immunity and the recommendation to avoid immune moves.

**Recommendation:** Apply immunity as a special case before the minimum-damage clamp:

```js
if (typeMultiplier === 0) return 0;
return Math.max(1, Math.floor(rawDamage));
```

Then decide whether immune moves are allowed. If they are not, validate move pools and still keep the logic correct.

### 2. Several type-chart examples are factually wrong
The examples repeatedly describe Flying as resisting Fire, Electric, or Rock. In the official chart, Flying is weak to Electric and Rock, and Fire is neutral against Flying. Therefore:

- Fire vs Water/Flying = `0.5 × 1 = 0.5`, not `0.5 × 2 = 1`.
- Electric vs Water/Flying = `2 × 2 = 4`, not `2 × 0.5 = 1`.
- Rock vs Fire/Flying = `2 × 2 = 4` is correct.

Correct these examples before implementation, because they could directly produce incorrect tests or lookup data.

### 3. The UI mockup includes an unsupported move
The scope excludes move effects, but the mockup includes `Protect (Block one turn)`. Remove it or explicitly mark it as a future example. Otherwise developers may implement an out-of-scope mechanic.

### 4. “Random opponent move” is underspecified
The document says the opponent chooses randomly, but does not define the random source, whether moves are equally weighted, or how to test it.

**Recommendation:** Inject an RNG or move-selection function:

```js
selectOpponentMove(moves, rng = Math.random)
```

For tests, pass a deterministic RNG or a fixed selector. Document whether all moves have equal probability.

### 5. Turn numbering is ambiguous
The state starts with `currentTurn: number`, but it is unclear whether the initial value is 0 or 1. The summary uses `currentTurn`, while the log records the current turn before incrementing.

**Recommendation:** Start at 1 for presentation, define precisely when it increments, and separately calculate completed turns if needed.

### 6. Battle-summary actor identity is inconsistent
The log structure says `actor` is a Pokémon name, while `calculateTotalDamage` filters by a role (`player` or `opponent`). This will return incorrect totals unless the representation is standardized.

**Recommendation:** Store both fields:

```js
{ actorRole: "player", actorName: "Pikachu", ... }
```

### 7. Move selection and move availability need validation
The specification assumes every Pokémon always has 2–4 valid moves, but does not define fallback behavior when local data is incomplete or a selected move is stale.

**Recommendation:** Validate move IDs and powers at battle setup, reject invalid selections, and provide a deterministic fallback catalog or an explicit setup error.

### 8. Raw base stats may create extreme and untested battles
Using raw species stats is acceptable for a fun MVP, but HP, Attack, and Defense ranges can produce one-hit KOs or very long fights. The expected 3–6 turn length is not guaranteed by the formula.

**Recommendation:** Calculate sample matchups across the intended Pokémon pool and either accept the variance, normalize stats, or cap move power/damage. Add balance tests rather than relying only on examples.

### 9. Data and API guidance is contradictory
The document says local data is required during battle, but also suggests fetching the type table from PokeAPI. It also says the type table is embedded and cached. Pick one MVP path.

**Recommendation:** Ship a static, versioned type chart for Level 1. Make API loading an optional future enhancement with a local fallback.

### 10. “Ready for development” is premature
The checklist still has all core implementation and test items unchecked, and the version date is in the future relative to the surrounding project context. Label the document as a specification/draft until the implementation and tests exist.

## Smaller improvements

- Define valid stat constraints: positive integers, nonzero Defense, and HP initialization.
- Define behavior for duplicate types, malformed types, missing sprites, and empty move pools.
- Clarify whether a player may select a move after the battle has ended or while animations are running; use an action lock to prevent duplicate submissions.
- Make the battle reducer/state transitions the single authority for phase changes.
- Specify animation timing independently from game-state resolution so UI delays cannot change battle outcomes.
- Replace “all 18² combinations” with an automated table validation against the chosen canonical chart.
- Ensure accessibility does not depend on color alone; type badges should include text and ARIA labels.
- Add tests for rapid repeated clicks, rematch reset, abandoned battles, and opponent randomness injection.

## Suggested implementation order

1. Correct and freeze the type chart and examples.
2. Resolve immunity and minimum-damage semantics.
3. Define canonical state/log schemas and turn numbering.
4. Implement pure functions with deterministic RNG injection.
5. Add validation for Pokémon and move data.
6. Test representative and extreme matchups.
7. Build the UI around the tested reducer and keep animations presentation-only.

## Verdict

Good foundation for an MVP, but not yet safe to implement verbatim. The incorrect type examples and immunity contradiction are high priority; the remaining issues mainly concern determinism, data validation, state consistency, and balance expectations.