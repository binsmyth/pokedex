# Fixes

## 2026-09-22

- Added global Jest DOM setup in `src/setupTests.js` so all tests can use matchers like `toBeInTheDocument` and `toHaveAttribute`.
- Fixed test accessibility expectations in app components:
  - Added `role="main"` in `src/components/App.js`.
  - Added `role="progressbar"` around the loader in `src/components/App.js`.
  - Added `role="grid"` to `FrontPage` grid.
  - Rendered Pokemon cards as `article` elements.
  - Added expected accessible roles/attributes for tested elements.
- Fixed Pokemon detail image behavior:
  - Added `alt="pokemon"` to detail images.
  - Changed image fallback logic so Pokemon IDs `>= 906` use API sprite URLs.
- Reworked `PokeSelect` interaction to make selection behavior reliable in tests.
  - Added selectable gender options.
  - Preserved API calls for `/gender/:id`.
  - Added error handling for failed API requests.
  - Added guard logic for mocked API response shapes.
- Fixed `ModalPokemonDetail` tests:
  - Moved hook usage into a React wrapper component.
  - Updated modal close assertion to match actual close behavior.
- Fixed `PokemonDetail` route-change test by unmounting/remounting with the new route.
- Verified all tests pass:

```txt
Test Suites: 9 passed, 9 total
Tests:       165 passed, 165 total
```
