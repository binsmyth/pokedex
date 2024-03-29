import React from 'react';
import { Image } from '@mantine/core';

const ImageCard = props=>{
  const id = props.id.toString().padStart(3, "0");
  return (
    <div>
      <Image src={id < 906 ? `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id}.png` : props.urls} onError={e=>console.log('error')} alt="pokemon"/>
    </div>
  )
}

export default ImageCard;
