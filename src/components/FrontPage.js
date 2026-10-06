import React from 'react';
import { Link } from 'react-router-dom';
import './styles/styles.css';
import { SimpleGrid, Card, Text, Center } from '@mantine/core';
import AvatarImage from './AvatarImage/AvatarImage';

const FrontPage = props =>{
  return (
    <SimpleGrid cols={3} spacing="md">
      {props.pokeData && props.pokeData.map((src,index)=>{
        return (
          <div key={index} >
            <Link to={`/PokemonDetail/${src.id}`} state={{id:src.id, urls:src.sprites.front_default}}>
              <Card withBorder p="xl" pb="12vh" shadow="sm">
                <Center><AvatarImage urls={src.sprites.front_default} id={src.id}/></Center>
                <Card.Section><Text component="p" align="center" lineClamp={1} size="xs">{src.name}</Text></Card.Section>
              </Card>
            </Link>
          </div>
        )
      })}
    </SimpleGrid>
  )
};

export default FrontPage;
