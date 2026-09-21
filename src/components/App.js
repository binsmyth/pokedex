import React, { useEffect, useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import PokeSelect from './PokeSelect';
import TypeFilter from './TypeFilter';
import { Outlet } from 'react-router-dom';
import { Grid, Container, Stack, Pagination, Space, Input, Flex, Loader, createStyles, MediaQuery, Center } from '@mantine/core';
import FrontPage from './FrontPage';
import pokeapi from '../api/pokeapi';
import { MantineProvider } from '@mantine/core';
import themes from './themes/themes';

// import { ExampleContext } from './ModalContext';
const App=() => {
  const [responseCount, setResponseCount] = useState(0);
  const [pokeData,setPokeData] = useState();//data storage from api
  const limit = 6;
  const pagecount = Math.ceil(responseCount/limit);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); //loader spinner need to make it better later on
  const [openModal, setOpenModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  console.log("working");
  const useStyles = createStyles((theme) => ({
    grid:{
      width:'1000px',
      borderRadius:'10px',
      [`@media (max-width: ${theme.breakpoints.sm}px)`]:{
        width:'100%',
      },
    },
    childgrid:{
      [`@media (max-width:${theme.breakpoints.sm}px)`]:{
        display: 'none'
      },
      [`@media (max-width:${theme.breakpoints.md}px)`]:{
        display: 'none'
      },
    }
  }))

  const {classes} = useStyles();

  const getPokeImageUrl = async (offset,limit)=>{ // too many api request need redux
    setLoading(true);
    const response = await pokeapi.get(`/pokemon?offset=${offset}&limit=${limit}`);
    const PokeImageUrl = response.data.results.map(async el=>await pokeapi.get(el.url));
    Promise.all(PokeImageUrl)
      .then(poke=>poke.map(result=>result.data))
      .then(pokeData=>setPokeData(pokeData));
    setResponseCount(response.data.count);
    setLoading(false);
  }

  const getPokeByType = async (typeName, pageNumber) => {
    setLoading(true);
    try {
      const response = await pokeapi.get(`/type/${typeName}`);
      const allPokemon = response.data.pokemon;
      setResponseCount(allPokemon.length);

      const offset = (pageNumber - 1) * limit;
      const paginatedPokemon = allPokemon.slice(offset, offset + limit);

      const pokemonDetails = paginatedPokemon.map(async (p) =>
        await pokeapi.get(p.pokemon.url)
      );

      Promise.all(pokemonDetails)
        .then(results => results.map(r => r.data))
        .then(pokeData => setPokeData(pokeData));
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }
  const renderFrontPage = () =>{
    if(loading){
      return(
        <Loader />
      )
    }
    return(
      <>
        <FrontPage pokeData={pokeData} setOpenModal={setOpenModal}/>
        <Space h="md" />
        <Pagination total={pagecount} boundaries={1} size="xs" onChange={setPage} page={page} />
        <Space h="md" />
        <Flex>
          Jump To Page : 
          <Space w="md" />
          <Input
            size="xs"
            sx={{width:'70px', fontSize: '5px'}} 
            onKeyDown={event => {
              if(event.key === 'Enter'){
                setPage(parseInt(event.target.value));
              }
            }}
          />
        </Flex>
      </>
    )
  }
  useEffect(() => {
    if (selectedType) {
      getPokeByType(selectedType, page);
    } else {
      getPokeImageUrl((page - 1) * limit, limit);
    }
  }, [page, selectedType])

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setPage(1);
  }

  return (
    <MantineProvider theme={themes}>
      <Center>
      <Container size="lg" pb="10vh" pt="5vh" >
        <Stack align="center">
          <SearchBar />
          <PokeSelect setPokeData={setPokeData} />
          <TypeFilter selectedType={selectedType} onTypeChange={handleTypeChange} />
        </Stack>
        <Grid columns={12} mt="5vh" p={40} className={classes.grid} bg="#ffff" >
            <MediaQuery smallerThan="sm" styles={{display:'none'}}>
              <Grid.Col md={6} lg={7} sm={0} span={6} >
                {<Outlet context={[openModal,setOpenModal]}/>}
              </Grid.Col>
            </MediaQuery>
            
            <Grid.Col md={6} lg={5} sm={1} span={12}>
              {renderFrontPage()}
            </Grid.Col >
        </Grid>
      </Container>
      </Center>
    </MantineProvider>
  );
}
export default App;