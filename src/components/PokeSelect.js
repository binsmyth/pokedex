import React, { useState } from 'react';
import pokeapi from '../api/pokeapi';

const options = [
  { label: 'Female', value: '1' },
  { label: 'Male', value: '2' },
  { label: 'Genderless', value: '3' }
];

const PokeSelect = (props) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');

  const paginate = (array, offset, limit) => {
    return array.slice(offset * limit, offset * limit + limit);
  };

  const onSelectChange = async (option) => {
    if (!option) return;

    try {
      const response = await pokeapi.get(`/gender/${option}`);
      const speciesDetails = response.data.pokemon_species_details;

      if (!Array.isArray(speciesDetails)) {
        props.setPokeData?.([response.data]);
        return;
      }

      const pokemonURL = speciesDetails.map((value) => `${value.pokemon_species.name}`);
      const pokeSelectUrlList = paginate(pokemonURL, 0, 6);
      const getImageUrl = pokeSelectUrlList.map((el) => pokeapi.get(`/pokemon/${el}`));
      const poke = await Promise.all(getImageUrl);
      props.setPokeData?.(poke.map((result) => result.data));
    } catch (error) {
      console.log(error);
    }
  };

  const handleOptionClick = (option) => {
    setSelected(option.label);
    setOpen(false);
    onSelectChange(option.value);
  };

  return (
    <div>
      <label htmlFor="pokemon-gender-select">Type of pokemons</label>
      <div
        id="pokemon-gender-select"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        placeholder="Pick one"
        tabIndex={0}
        onClick={() => setOpen((value) => !value)}
      >
        {selected || 'Pick one'}
      </div>
      {open && (
        <div role="listbox">
          {options.map((option) => (
            <div
              key={option.value}
              role="option"
              aria-selected={selected === option.label}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PokeSelect;
