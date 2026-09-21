import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Text, Center, ActionIcon } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import AvatarImage from './AvatarImage/AvatarImage';

const PokemonCard = ({ pokemon, matches, setOpenModal, isFavorite, onToggleFavorite }) => {
  const favored = isFavorite(pokemon.id);

  return (
    <div style={{ position: 'relative' }}>
      <ActionIcon
        variant="transparent"
        color="red"
        style={{ position: 'absolute', top: 4, right: 4, zIndex: 2 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(pokemon.id);
        }}
        aria-label={favored ? 'Remove from favorites' : 'Add to favorites'}
      >
        {favored ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
      </ActionIcon>

      <Link
        to={matches ? `/PokemonDetail/${pokemon.id}` : `/ModalPokemonDetail/${pokemon.id}`}
        state={{ id: pokemon.id, urls: pokemon.sprites.front_default }}
        onClick={() => setOpenModal(true)}
      >
        <Card withBorder p="xl" pb="12vh" shadow="sm">
          <Center><AvatarImage urls={pokemon.sprites.front_default} id={pokemon.id} /></Center>
          <Card.Section>
            <Text component="p" align="center" lineClamp={1} size="xs">{pokemon.name}</Text>
          </Card.Section>
        </Card>
      </Link>
    </div>
  );
};

export default PokemonCard;
