# Battle Game Mechanics

**Status:** Current mechanics reference
**Last verified against code:** 2026-10-11

This document describes the battle rules currently implemented in the Pokédex app. Product scope and roadmap live in `GAME_REQUIREMENTS.md`; verified delivery status lives in `IMPLEMENTATION_STATUS.md`. Historical critique and phase reports are background, not normative specifications.

## Battle scope

- Single-player, one Pokémon versus one Pokémon.
- The player selects both Pokémon from the roster loaded for the battle.
- Each Pokémon has a set of damaging moves loaded with its battle data. Status moves and moves without power are excluded.
- The opponent's move is selected randomly from its available moves. The random function is injectable for deterministic tests.
- No accuracy checks, critical hits, STAB, abilities, status effects, switching, or simultaneous attacks.

## Battle data

The battle setup loads a roster from PokeAPI through `src/api/battlePokemon.js`. The roster request is followed by Pokémon detail and move detail requests. Loading and retryable error states are shown in the UI; failed individual roster entries or move-detail requests are skipped where possible. At least two usable Pokémon must load to start selection.

For each Pokémon, battle data uses:

- `hp`: base HP multiplied by 4
- `attack`: the greater of base Attack and base Special Attack
- `defense`: the greater of base Defense and base Special Defense
- `speed`: base Speed
- one or two types, damaging moves, and the best available sprite URL

The type chart is static local data in `src/data/typeChart.js`; battle calculations do not fetch type relations. Pokémon and move data are validated before a battle starts.

## Type effectiveness

The static type chart covers all 18 types. A move's type is compared to each defending type, and dual-type multipliers are multiplied:

| Relation | Multiplier |
|---|---:|
| Super effective | 2× |
| Neutral | 1× |
| Resisted | 0.5× |
| Immune | 0× |

For example, Electric against Water/Flying is 2×2 = 4×; Fire against Water/Flying is 0.5×1 = 0.5×. The chart's entries describe defensive relations; use `getTypeMatchup()` rather than duplicating lookup logic.

## Damage

For a non-immune move:

```text
baseDamage = move.power × (attacker.attack / defender.defense)
finalDamage = max(1, floor(baseDamage × typeMultiplier))
```

An immune matchup deals exactly 0 damage; immunity is checked before the minimum-damage rule. Damage cannot exceed remaining HP for summary purposes: battle log `damage` is calculated damage, while `hpLost` is the HP actually removed.

## Turn resolution

1. The player selects one of their available moves; the opponent's move is selected randomly.
2. Higher Speed acts first. On a tie, the opponent acts first.
3. Apply the first attack and clamp remaining HP to zero.
4. If the defender fainted, it does not act. Otherwise, resolve the second attack.
5. If either Pokémon faints, the battle finishes. Otherwise, increment the completed-turn count and return to move selection.

The pure turn resolver is in `src/battle/turnResolution.js`. It returns a new state rather than mutating its inputs. Turn log entries identify actor role and name, move, calculated damage, actual HP lost, defender HP, and effectiveness.

## State and results

The battle state has `phase` (`player_select`, `finished`), `currentTurn` (completed turns; begins at 0), `winner` (`player`, `opponent`, or null), both current HP values, and a battle log. UI setup/resolution steps are represented separately by the component's interaction state.

The results view reports the winner, turns, damage dealt/taken, and effectiveness counts. Rematch resets HP and battle state for the selected Pokémon; New Battle returns to selection.

## Verification

Run `npm test -- --watchAll=false --runInBand` for the battle and type-chart tests, and `npm run build` for the production build. See `IMPLEMENTATION_STATUS.md` for the latest verified results.
