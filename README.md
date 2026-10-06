# Pokédex App

A React-based Pokédex web app that lets you browse, search, and inspect Pokémon — plus fight them in a turn-based 1v1 battle simulator.

**Repo:** [github.com/binsmyth/pokedex](https://github.com/binsmyth/pokedex)

## Features

- **Browse the Pokédex** — paginated grid of Pokémon fetched from the [PokéAPI](https://pokeapi.co/), with a jump-to-page input.
- **Search** — search bar to look up Pokémon by name.
- **Details** — click a Pokémon to see its stats, types, and image in a detail view or modal.
- **Battle Simulator** — pick two Pokémon and fight a turn-based 1v1 battle (`⚡ Start Battle` button):
  - Damage calculation with type effectiveness (`src/battle/damage.js`)
  - Type matchup chart (`src/data/typeChart.js`)
  - Move selection, health bars, battle log, floating damage numbers, and KO/victory screen
  - Sound effects (`src/utils/audio.js`)
  - Responsive, type-colored battle UI (`src/components/Battle/Battle.js`, `Battle.css`, `animations.css`)

## Tech Stack

- React 18 + React Router 6
- Mantine UI 5 (components, hooks, forms)
- axios for API calls
- Create React App (react-scripts 5)
- Plain CSS for battle animations

> Note: `react-redux` is installed as a dependency but not yet wired up (caching PokéAPI requests is a known TODO).

## Getting Started

### Prerequisites

- Node.js 18+ and npm (the devcontainer uses Node 18)
- Or use the included [dev container](.devcontainer/) in VS Code

### Install & Run

```bash
npm install
npm start      # dev server at http://localhost:3000/pokedex
npm test       # run tests
npm run build  # production build
npm run deploy # build + publish to GitHub Pages
```

### Environment Variables

Set in `.env` (committed for this project):

| Variable    | Purpose                                    |
| ----------- | ------------------------------------------ |
| `PUBLIC_URL` | Base path for routing and assets (`/pokedex`) |

`PUBLIC_URL` is used as the router `basename` in `src/index.js`, so the app is served under the `/pokedex` path.

## Routes

| Path                    | Component       | Description                                    |
| ----------------------- | --------------- | ---------------------------------------------- |
| `/`                     | `App`           | Layout with search + Pokédex grid              |
| `/PokemonDetail/:index` | `PokemonDetail` | Detail card on desktop, full-screen modal on mobile |
| `/battle`               | `BattlePage`    | Turn-based battle simulator                    |

Closing the detail view or the battle screen navigates back (with a fallback
to `/` when there's no history), so browser Back/Forward and refresh always
match what's on screen.

## Project Structure

```
src/
├── api/            PokéAPI client (axios)
├── battle/         Battle logic: damage calc, turn resolution
├── components/     UI: App, FrontPage, PokemonDetail, Battle/, themes/
├── data/           Static data: type chart, Pokémon/move catalogs
├── hooks/          useBattle state hook
├── SearchBar/      Search component
└── utils/          Audio helpers
```

## Known Limitations & Roadmap

- `src/battle/turnResolution.js`, `src/hooks/useBattle.js`, and several Battle components (`BattleArena`, `BattleResults`, `MoveSelector`, `PokemonSelection`) are **stubs** — the live battle flow currently lives in `Battle.js`.
- `src/data/pokemonCatalog.js` and `src/data/moveCatalog.js` are **empty placeholders**; the battle roster is inline in `Battle.js`.
- `src/data/typeChart.js` covers **6 types** so far (all 18 planned).
- No Redux store yet — each page load re-fetches Pokémon data.
- No test files yet (`npm test` runs but there's nothing to assert).

See `GAME_REQUIREMENTS.md` for the full vision and roadmap (multi-type matchups, teams, competitive features).

## Development Docs

Design and implementation notes, newest first:

- `BUILD_SUMMARY.md` — what was built for the Level 1 battle system
- `LEVEL1_IMPLEMENTATION.md` — Level 1 battle implementation notes
- `critique_gpt.md` / `critique_level1_game_mechanics.md` — reviews of the game mechanics spec
- `level1_game_mechanics.md` — 1v1 battle mechanics specification
- `GAME_REQUIREMENTS.md` — battle system vision and roadmap

## License

No license file has been added yet — all rights reserved by default. The `pocket_monk` font in `src/components/fonts/` is under a non-commercial license (see the included `FSLA_NonCommercial_License.html`).
