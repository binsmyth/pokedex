import React, { useEffect, useState } from 'react';
import { SimpleGrid, Text, Loader } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import PokemonCard from './PokemonCard';
import pokeapi from '../api/pokeapi';

const FavoritesList = ({ favorites, setOpenModal, isFavorite, onToggleFavorite }) => {
  const matches = useMediaQuery('(min-width: 576px)');
  const [favoritePokemon, setFavoritePokemon] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!favorites || favorites.length === 0) {
      setFavoritePokemon([]);
      return;
    }
    setLoading(true);
    Promise.all(favorites.map((id) => pokeapi.get(`/pokemon/${id}`)))
      .then((responses) => setFavoritePokemon(responses.map((r) => r.data)))
      .finally(() => setLoading(false));
  }, [favorites]);

  if (loading) return <Loader />;

  if (!favorites || favorites.length === 0) {
    return <Text align="center" color="dimmed">No favorites yet — click the heart on a Pokémon to add one!</Text>;
  }

  return (
    <SimpleGrid cols={3} spacing="md">
      {favoritePokemon.map((pokemon) => (
        <PokemonCard
          key={pokemon.id}
          pokemon={pokemon}
          matches={matches}
          setOpenModal={setOpenModal}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </SimpleGrid>
  );
};

export default FavoritesList;
