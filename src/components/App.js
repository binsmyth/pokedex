import React, { useEffect, useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import PokeSelect from './PokeSelect';
import { Outlet } from 'react-router-dom';
import { Grid, Container, Stack, Pagination, Space, Input, Flex, Loader, createStyles, MediaQuery, Center, Button, Group } from '@mantine/core';
import FrontPage from './FrontPage';
import pokeapi from '../api/pokeapi';
import { MantineProvider } from '@mantine/core';
import themes from './themes/themes';
import { Battle } from './Battle';

// import { ExampleContext } from './ModalContext';
const App=() => {
  const [responseCount, setResponseCount] = useState(0);
  const [pokeData,setPokeData] = useState();//data storage from api
  const limit = 6;
  const pagecount = Math.ceil(responseCount/limit);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false); //loader spinner need to make it better later on
  const [openModal, setOpenModal] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
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
  useEffect(()=>{
    getPokeImageUrl((page - 1) * 6,limit);
  },[page])

  if (showBattle) {
    return (
      <MantineProvider theme={themes}>
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Button
            onClick={() => setShowBattle(false)}
            style={{ position: 'fixed', top: 20, left: 20, zIndex: 999 }}
            variant="filled"
            color="gray"
            size="lg"
          >
            ← Back to Pokédex
          </Button>
          <Battle />
        </div>
      </MantineProvider>
    );
  }

  return (
    <MantineProvider theme={themes}>
      <Center>
      <Container size="lg" pb="10vh" pt="5vh" >
        <Stack align="center">
          <Group position="center" spacing="md" mb="md">
            <SearchBar />
            <Button
              onClick={() => setShowBattle(true)}
              variant="gradient"
              gradient={{ from: '#667eea', to: '#764ba2', deg: 135 }}
              size="md"
              style={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              ⚡ Start Battle
            </Button>
          </Group>
          <PokeSelect setPokeData={setPokeData} />
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