import React from 'react';
import './styles/styles.css';
import { SimpleGrid } from '@mantine/core';
import PokemonCard from './PokemonCard';
import { useMediaQuery } from '@mantine/hooks';

const FrontPage = ({ pokeData, setOpenModal, isFavorite, onToggleFavorite }) => {
  const matches = useMediaQuery('(min-width: 576px)');
  return (
    <SimpleGrid cols={3} spacing="md">
      {pokeData && pokeData.map((src, index) => (
        <PokemonCard
          key={index}
          pokemon={src}
          matches={matches}
          setOpenModal={setOpenModal}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </SimpleGrid>
  );
};

export default FrontPage;
