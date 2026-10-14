# `src/` function guide

A catalog of the named functions in `src/`, grouped by file. Descriptions explain each function's role in the current code. React component functions are included because they produce the UI and connect user actions to application logic.

## App entry and API

### `src/index.js`

- **`createRoot(...).render(...)`** — mounts the React application into the DOM element with ID `root`; wraps the routes in `BrowserRouter`.

### `src/api/pokeapi.js`

- **Default Axios client** — configured with the PokeAPI base URL, `https://pokeapi.co/api/v2/`. Components call its `.get()` method to retrieve Pokémon data.

## Pokédex UI and data loading

### `src/components/App.js`

- **`App()`** — top-level layout and state owner. Tracks the Pokémon results, result count, current page, loading, modal visibility, and whether the battle view is active. Renders the Pokédex or Battle.
- **`useStyles(theme)`** — creates responsive styles for the grid and its child grid.
- **`getPokeImageUrl(offset, limit)`** — fetches a page of Pokémon from PokeAPI, fetches each result's detailed record, stores the records with `setPokeData`, stores the total count with `setResponseCount`, and manages the loading flag.
- **`renderFrontPage()`** — returns a loader while data is loading; otherwise renders the Pokémon listing, pagination, and page-jump input.
- **Page `useEffect` callback** — calls `getPokeImageUrl` when the selected page changes.
- **Pagination `onChange` callback** — updates the selected page, which triggers the page effect.
- **Page-jump `onKeyDown` callback** — when Enter is pressed, parses the input and updates the page.
- **Start Battle `onClick` callback** — sets `showBattle` to true, switching the view to Battle.
- **Back-to-Pokédex `onClick` callback** — sets `showBattle` to false.

### `src/components/FrontPage.js`

- **`FrontPage(props)`** — maps `pokeData` into linked Pokémon cards. On wide screens, cards navigate to the full detail page; on narrow screens, they navigate to the modal detail page.
- **Card-link `onClick` callback** — calls `props.setOpenModal(true)` when a card is selected.

### `src/SearchBar/SearchBar.js`

- **`SearchBar({ onSubmit })`** — renders the search form and manages its term with Mantine's `useForm`. The `onSubmit` prop is accepted but is not used by the current implementation.
- **`onFormSubmit(event)`** — prevents the browser's default form submission and calls `onSearchSubmit` with the current term.
- **`onSearchSubmit(term)`** — requests `/pokemon/{term}` from PokeAPI and navigates to the detail route using the returned Pokémon ID. Logs request errors.
- **`handleChange(event)`** — updates the URL search parameters and the form's search term.

### `src/components/PokeSelect.js`

- **`PokeSelect(props)`** — renders a selector with Female, Male, and Genderless options.
- **`change(option)`** — forwards the selected value to `onSelectChange`.
- **`paginate(array, offset, limit)`** — returns a slice of an array for the requested page. Currently used to take the first six names.
- **`onSelectChange(option)`** — fetches the selected gender's Pokémon species, takes up to six species names, fetches their Pokémon records, then calls `props.setPokeData` with the records.

### `src/components/ImageCard.js`

- **`ImageCard(props)`** — renders a Pokémon image. Pads the ID to three digits and uses the Pokémon.com image URL for IDs below 906; otherwise falls back to the provided sprite URL.
- **Image `onError` callback** — logs an image-loading error.

### `src/components/AvatarImage/AvatarImage.js`

- **`AvatarImage({ urls, id })`** — wraps `ImageCard` in a Mantine `Avatar`.

## Pokémon detail views

### `src/components/PokemonDetail/PokemonDetail.js`

- **`PokemonDetail()`** — reads the Pokémon ID from route params or navigation state, fetches its Pokémon and species records, and renders its image, name, description, height, experience, and types.
- **Pokémon-data `useEffect` callback / `getDetail()`** — fetches `pokemon/{id}` and stores the response with `setDetail`.
- **Species-data `useEffect` callback / `getDescription()`** — fetches `pokemon-species/{id}` and stores the response with `setDescription`.
- **Description `onClick` callback** — toggles whether the flavor text is clamped.

### `src/components/ModalPokemonDetail/ModalPokemonDetail.js`

- **`ModalPokemonDetail()`** — reads shared modal state from the parent route, fetches Pokémon and species records, and renders them in a Mantine modal.
- **Pokémon-data `useEffect` callback / `getDetail()`** — fetches `pokemon/{id}` and stores the response with `setDetail`.
- **Species-data `useEffect` callback / `getDescription()`** — fetches `pokemon-species/{id}` and stores the response with `setDescription`.
- **Modal `onClose` callback** — calls `setOpenModal(false)` to close the modal.
- **Description `onClick` callback** — toggles whether the flavor text is clamped.

## Battle UI and effects

### `src/components/Battle/Battle.js`

- **`Battle()`** — owns the active battle UI and local battle state: Pokémon choices, HP, move choices, turn status, battle log, last damage, and floating damage labels. Pokémon and their move/stat data are currently defined inside this component.
- **`triggerAnimation(ref, animationClass)`** — removes and reapplies a CSS class to restart an animation, then removes the class after 500 ms.
- **`createFloatingDamage(x, y, damage, type)`** — adds a temporary floating damage entry to state and removes it after 1.5 seconds.
- **`handleStartBattle()`** — if both Pokémon are selected, plays a selection sound, initializes their HP, clears turn-related state, and switches to the battle screen.
- **`handleSelectMove(playerMoveIndex)`** — ignores input if either Pokémon is defeated; otherwise plays a sound, chooses a random opponent move, stores both move choices, and marks the turn as ready to resolve.
- **`handleResolveAttacks()`** — looks up the selected moves, calls `resolveTurn`, then applies the first attack event immediately and the second after 300 ms if present. Updates HP, the log, last-damage display, sounds, animations, and win/loss effects.
- **`applyAttackEvent(event)`** (nested in `handleResolveAttacks`) — creates a readable log message, plays effectiveness-aware damage audio, animates the target, and displays floating damage.
- **`applyOutcome()`** (nested in `handleResolveAttacks`) — plays the end sound and applies victory/defeat animation based on the turn outcome.
- **`setDisplayedLastDamage(event)`** (nested in `handleResolveAttacks`) — stores the event's damage and a user-facing effectiveness label.
- **Move button `onClick` callback** — calls `handleSelectMove` with the selected player move index.
- **Resolve button `onClick` callback** — calls `handleResolveAttacks`.
- **Reset Battle `onClick` callback** — restores both Pokémon to maximum HP and clears turn, log, and damage state.
- **New Battle / Back to Selection callbacks** — return to Pokémon selection; the in-battle back callback also clears turn UI state.

### `src/components/Battle/HealthBar.js`

- **`HealthBar({ pokemon, maxHP, currentHP })`** — computes the HP percentage and renders the label and bar. The bar changes from green to orange below 25% HP and red below 10%.

### `src/components/Battle/index.js`

- Re-exports **`Battle`** and **`BattleArena`** for imports from the Battle directory.

### Placeholder battle components

These currently only render placeholder text and contain no battle logic:

- **`BattleArena()`** in `src/components/Battle/BattleArena.js` — returns “Battle Arena”.
- **`BattleResults()`** in `src/components/Battle/BattleResults.js` — returns “Battle Results”.
- **`MoveSelector()`** in `src/components/Battle/MoveSelector.js` — returns “Move Selector”.
- **`PokemonSelection()`** in `src/components/Battle/PokemonSelection.js` — returns “Pokemon Selection”.

## Battle rules and data

### `src/battle/turnResolution.js`

- **`describeEffectiveness(result)`** — translates damage flags into `super`, `notVery`, `immune`, or `neutral`.
- **`createAttackEvent(attacker, move, result)`** — builds a turn event containing the attacker side, move, damage, and effectiveness.
- **`resolveTurn(state, moves)`** — calculates the player's attack first. If the opponent survives, calculates the opponent's response. Returns updated HP, ordered events, and an outcome (`ongoing`, `playerWin`, `playerLoss`, or `draw`). If a Pokémon is already defeated, returns the corresponding terminal outcome without attack events.

### `src/battle/damage.js`

- **`calculateDamage(attacker, defender, moveType, movePower)`** — calculates base damage from move power and attack/defense, applies the type multiplier, and returns damage plus effectiveness flags. Immunity returns zero damage; otherwise damage is at least one.

### `src/data/typeChart.js`

- **`getTypeMatchup(attackType, defendType)`** — looks up the attacking type's chart and returns 2 for strong, 0.5 for weak, 0 for immune, or 1 for neutral/unknown.

### `src/data/pokemonCatalog.js`

- **`getPokemon()`** — currently a stub that returns `null`; `POKEMON_CATALOG` is empty.

### `src/data/moveCatalog.js`

- **`getMove()`** — currently a stub that returns `null`; `MOVE_CATALOG` is empty.

### `src/hooks/useBattle.js`

- **`useBattle()`** — exposes `battleState` and its React setter. This hook is not currently used by the active `Battle` component.

## Audio utility

### `src/utils/audio.js`

- **`playSound(sound)`** — plays the supplied sound using the browser audio API, if available.
- **`playSoundForDamage(isSuperEffective, isNotVeryEffective, isImmune)`** — selects the sound for super-effective, resisted, immune, or normal damage.
- **`playEndSound(playerWon)`** — plays the victory or defeat ending sound.

`SOUNDS` is the exported collection of sound identifiers/data used by the Battle UI; it is a constant, not a function.

## Tests and non-function source files

- **`src/battle/turnResolution.test.js`** — tests turn-resolution behavior; it is test code, not an application function catalog.
- CSS files and files under `src/components/fonts/` contain styles/font assets rather than JavaScript functions.
