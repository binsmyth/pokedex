import { useLocalStorage } from '@mantine/hooks';

const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage({
    key: 'pokemonFavorites',
    defaultValue: [],
  });

  const toggleFavorite = (id) => {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter((favId) => favId !== id)
        : [...current, id]
    );
  };

  const isFavorite = (id) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;
