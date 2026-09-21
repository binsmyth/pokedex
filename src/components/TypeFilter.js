import React from 'react';
import { Button, Group, Box } from '@mantine/core';

const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

const TypeFilter = ({ selectedType, onTypeChange }) => {
  return (
    <Box mb="md">
      <Group position="center" spacing="xs" sx={{ flexWrap: 'wrap' }}>
        <Button
          size="xs"
          variant={selectedType === null ? 'filled' : 'light'}
          onClick={() => onTypeChange(null)}
        >
          All Types
        </Button>
        {POKEMON_TYPES.map((type) => (
          <Button
            key={type}
            size="xs"
            variant={selectedType === type ? 'filled' : 'light'}
            onClick={() => onTypeChange(type)}
            sx={{ textTransform: 'capitalize' }}
          >
            {type}
          </Button>
        ))}
      </Group>
    </Box>
  );
};

export default TypeFilter;
