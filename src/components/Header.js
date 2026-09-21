import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Group, Text } from '@mantine/core';

const Header = ({ favoritesCount }) => {
  const location = useLocation();
  const isFavoritesActive = location.pathname === '/favorites';

  return (
    <Group position="center" mb="sm">
      <Link to="/favorites" style={{ textDecoration: 'none' }}>
        <Text weight={isFavoritesActive ? 700 : 500} color={isFavoritesActive ? 'red' : 'dark'}>
          ❤️ Favorites {favoritesCount > 0 && `(${favoritesCount})`}
        </Text>
      </Link>
    </Group>
  );
};

export default Header;
