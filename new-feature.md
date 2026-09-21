# Pokémon Favorites Feature

## Overview
Add a favorites/wishlist system that lets users bookmark Pokémon they like. Favorites persist across sessions using localStorage.

## Implementation Steps

### 1. Add Favorites State & Storage
- Create a custom hook `useFavorites()` that:
  - Reads favorites from localStorage on mount
  - Returns `favorites` array and `toggleFavorite(id)` function
  - Saves to localStorage whenever favorites change

### 2. Update FrontPage Component
- Add a heart icon button to each Pokémon card (top-right corner)
- Heart is filled/colored when Pokémon is in favorites, outline when not
- Clicking toggles favorite status
- Pass favorites state and toggle function as props

### 3. Add Favorites Route/View
- Create new `FavoritesList.js` component that displays only favorited Pokémon
- Show empty state when no favorites
- Reuse existing card layout (same as FrontPage)
- Add route in App.js (e.g., `/favorites`)

### 4. Add Navigation
- Add "Favorites" link in header/navigation (optional: show count badge like "❤️ 5")
- Link navigates to `/favorites` route

## Technical Details
- Use Mantine's `ActionIcon` with `IconHeart` or similar icon
- Store favorites as array of Pokémon IDs in localStorage under key `pokemonFavorites`
- Keep existing pagination/search on main page; favorites page can show all without pagination

## Files to Modify/Create
- `src/hooks/useFavorites.js` (new)
- `src/components/FrontPage.js` (add heart icon, integrate favorites)
- `src/components/FavoritesList.js` (new)
- `src/components/App.js` (add route, pass favorites to components)

## Testing
- Favorite a Pokémon, refresh page, verify it's still favorited
- Navigate to favorites view and see only favorited Pokémon
- Click heart to unfavorite, verify it's removed
