# Route Analysis - Inconsistencies & Battle Back-Button Bug

**Date:** 2026-10-06
**Status:** All 5 fixes implemented (see bottom of file)

---

## Table of Contents
1. [Current Route Map](#current-route-map)
2. [Bug 1: Battle Is Not a Route (Main Issue)](#bug-1-battle-is-not-a-route-main-issue)
3. [Bug 2: Search Bar Pollutes History on Every Keystroke](#bug-2-search-bar-pollutes-history-on-every-keystroke)
4. [Bug 3: Modal Close Doesn't Navigate Back](#bug-3-modal-close-doesnt-navigate-back)
5. [Dead / Broken Routes](#dead--broken-routes)
6. [Inconsistency: Detail vs Modal Chosen by Screen Size](#inconsistency-detail-vs-modal-chosen-by-screen-size)
7. [Layout Note: Detail Routes Render in a Column](#layout-note-detail-routes-render-in-a-column)
8. [Proposed Fix Order](#proposed-fix-order)

---

## Current Route Map

Defined in `src/index.js`:

```
/ (App layout)
├── /FrontPage                 → FrontPage         ⚠️ dead
├── /PokemonDetail/:index      → PokemonDetail     (renders in left column)
├── /ModalPokemonDetail/:index → ModalPokemonDetail (renders in left column)
└── /Search                    → ImageCard         ⚠️ broken
(Battle)                       → NOT a route at all ⚠️ main bug
```

Navigation entry points:

- `src/components/FrontPage.js:15` — card `Link` to `/PokemonDetail/:id` or `/ModalPokemonDetail/:id` (chosen by viewport)
- `src/SearchBar/SearchBar.js:25` — `navigate('/PokemonDetail/:id')` after API lookup
- `src/components/App.js:112` — `⚡ Start Battle` button toggles `showBattle` state (no navigation)
- `src/components/App.js:90` — `← Back to Pokédex` button toggles state back (no navigation)

---

## Bug 1: Battle Is Not a Route (Main Issue)

Battle is a `useState` flag inside `App.js`, not a route.

- **Start Battle** (`App.js:112`) → `setShowBattle(true)` — **the URL never changes**
- **Back button** (`App.js:90`) → `setShowBattle(false)` — again, no navigation

### Why this breaks the back button

1. Because battle pushed **no history entry**, pressing the browser Back button
   pops an *old* entry (e.g. from `/PokemonDetail/25` down to `/`), but
   `showBattle` is still `true` — the battle stays on screen while the URL has
   changed. **URL and UI are desynced.**
2. Keep pressing Back and history runs out → the browser performs a full page
   reload of the previous document → **lands on the main Pokédex page**.
   This matches the reported symptom: *"every time pressing back button it
   comes to main page of pokedex."*
3. Refreshing during battle also resets to the main page (state lost, no URL
   to restore).
4. Battle cannot be deep-linked, and Forward can't re-enter it either.

### Fix

Make battle a real route:

```jsx
// index.js
<Route path="/battle" element={<Battle />} />
```

```js
// App.js
onClick={() => navigate('/battle')}   // Start Battle
onClick={() => navigate('/')}        // Back to Pokédex (or navigate(-1))
```

Browser Back then works naturally, refresh keeps the battle, and the URL
always matches what's on screen.

---

## Bug 2: Search Bar Pollutes History on Every Keystroke

`SearchBar.js:33` — `handleChange` calls `setSearch({ title: ... })` on
**every key press**. In react-router v6, `setSearchParams` pushes a new
history entry by default (`replace: false`).

Typing "pikachu" adds ~8 history entries (`?title=p`, `?title=pi`, …).
Pressing Back walks through all of them before reaching anything meaningful.

### Fix

```js
setSearch({ title: e.target.value }, { replace: true });
```

Or drop the param entirely — it's only used by `console.log(search)`.

---

## Bug 3: Modal Close Doesn't Navigate Back

`ModalPokemonDetail.js:31`:

```js
<Modal opened={openModal} onClose={() => setOpenModal(false)} ...>
```

Closing the modal only hides it; the URL stays at `/ModalPokemonDetail/25`.

Resulting behavior:

1. Press Back → re-opens the closed-modal route (blank left column, modal
   not opened) — appears broken.
2. Press Back again → finally lands on `/` (main page).

### Fix

```js
onClose={() => navigate(-1)}   // or navigate('/')
```

---

## Dead / Broken Routes

| Route | Problem |
| --- | --- |
| `/FrontPage` | Nothing navigates to it. `<FrontPage />` is rendered with **no props**, so `pokeData` is undefined → empty grid; clicking cards would throw (`setOpenModal` undefined). App already renders `FrontPage` directly in the right column (`App.js:131`), so the route is redundant. |
| `/Search` | Nothing navigates to it. `<ImageCard />` receives **no props** → `props.id.toString()` throws `TypeError` — this route **crashes** if visited. |

---

## Inconsistency: Detail vs Modal Chosen by Screen Size

`FrontPage.js:15` picks the route via `useMediaQuery`:

- Desktop → `/PokemonDetail/:id`
- Mobile (<576px) → `/ModalPokemonDetail/:id`

But `SearchBar.js:25` **always** navigates to `/PokemonDetail/:id`, even on
mobile.

Consequences:

- Same Pokémon gets a different URL depending on how you arrived there.
- Resizing the window doesn't switch routes (URL and rendering style can
  disagree).
- Two components (`PokemonDetail`, `ModalPokemonDetail`) duplicate the same
  data-fetching logic for essentially the same view.

### Fix options

- One route (`/PokemonDetail/:id`) that renders as a modal on small screens
  and as a page on large screens (responsive rendering inside one component), or
- Keep two routes but make both entry points (cards + search) use the same
  viewport logic.

---

## Layout Note: Detail Routes Render in a Column

Detail/modal routes render inside `App`'s left grid column (`App.js:126`,
`<Outlet />`) while the paginated list stays in the right column. So a
"detail page" deep-link actually shows **two views at once**. It works, but it
makes "back to Pokédex" semantics unclear — there is no distinct page to go
back *to*, which contributes to the confusing back-button behavior.

---

## Proposed Fix Order

1. **Battle as a route** — fixes the reported back-button bug.
2. **`setSearch(..., { replace: true })`** — stops history pollution.
3. **Modal close navigates** (`navigate(-1)`).
4. **Remove `/FrontPage` and `/Search` routes** — dead code; `/Search` crashes.
5. **Unify detail/modal** — single responsive route, consistent entry points.

---

## Fixes Implemented (2026-10-06)

| # | Fix | Files |
| --- | --- | --- |
| 1 | Battle is now a top-level route `/battle` rendered by a new `BattlePage`; `⚡ Start Battle` calls `navigate('/battle')` and the back button calls `navigate(-1)` (falls back to `/` on deep links). Removed `showBattle` state from `App`. | `src/index.js`, `src/components/App.js`, `src/components/Battle/BattlePage.js` (new) |
| 2 | `setSearch(..., { replace: true })` — typing no longer pushes a history entry per keystroke. | `src/SearchBar/SearchBar.js` |
| 3 | Detail view close now navigates back (`navigate(-1)` → fallback `/`). | `src/components/PokemonDetail/PokemonDetail.js` |
| 4 | Removed `/FrontPage`, `/ModalPokemonDetail/:index`, and `/Search` routes and their imports. | `src/index.js` |
| 5 | Single `/PokemonDetail/:index` route: renders as a detail card on ≥576px and as a full-screen modal below that, so card links and search always use the same URL. `openModal` outlet context removed from `App`. | `src/components/PokemonDetail/PokemonDetail.js`, `src/components/FrontPage.js`, `src/components/App.js` |

**Verification:** `npx react-scripts build` compiles successfully (only pre-existing lint warnings).

**Notes:**
- `src/components/ModalPokemonDetail/ModalPokemonDetail.js` is now unused (route removed) and can be deleted — it is not bundled.
- `Battle.js`'s internal `showBattle` state (whether a match has started) is unrelated to routing and remains.
