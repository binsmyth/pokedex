import React,{ useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import pokeapi from '../../api/pokeapi';
import { Card, Text, Image, Grid} from '@mantine/core';
import useStyles from './styles';

const PokemonDetail = props =>{
  const [detail, setDetail] = useState();
  const [showDetail,setShowDetail] = useState(false);
  const [descript, setDescription] = useState();
  const location = useLocation();
  const { classes } = useStyles();
  let { index } = useParams();
  let pokeImageSrc = location?.state?.id ? location?.state?.id : index;
  const id = pokeImageSrc.toString()?.padStart(3, "0");


  useEffect (()=>{
    const getDetail = async() => {
      const data = await pokeapi.get(`pokemon/${pokeImageSrc}`);
      setDetail(data);
    }
    getDetail();
  },[location, pokeImageSrc])

  useEffect(() => {
    const getDescription = async() =>{
      const data = await pokeapi.get(`pokemon-species/${pokeImageSrc}`);
      setDescription(data);
    }
    getDescription();
  },[pokeImageSrc]);
  return (
    <div>

      <Card component="article" shadow="sm" ml="8vw" pb="xl" radius="md" className={classes.Card} bg={`${descript?.data?.color?.name}`} withBorder >
        <Card.Section component="a">
          <div className={`${classes.GlowingCircle} ${classes.Glow}`}></div>
          <Image alt="pokemon" src={Number(id)<906 ? `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id}.png`: detail?.data.sprites.front_default} height={200} fit="contain" />
        </Card.Section>
        <Card.Section p="lg" >
            <Text weight={1000} className={classes.title}>{detail?.data.name}</Text>
            <div className={`${classes.GlowingSquare} ${classes.Glow}`}></div>
            <Grid mt="xs" p="lg" className={classes.CardDescription}>
              <Grid.Col lg={12}><Text onClick={()=>setShowDetail(!showDetail)} lineClamp={showDetail === false ? 2 : 3}>{descript?.data?.flavor_text_entries[0]?.flavor_text || "nil"}</Text>
</Grid.Col>
              <Grid.Col lg={6} sm={3} className={classes.ColumnTextJustify}>height:</Grid.Col>
              <Grid.Col lg={6} sm={3} className={classes.ColumnTextJustify}>{detail?.data.height || detail?.height}</Grid.Col>
              <Grid.Col lg={6} sm={3} className={classes.ColumnTextJustify}>base experience:</Grid.Col>
              <Grid.Col lg={6} sm={3} className={classes.ColumnTextJustify}>{detail?.data.base_experience || detail?.base_experience || "nil"}</Grid.Col>
              <Grid.Col lg={6} sm={3} className={classes.ColumnTextJustify}>types:</Grid.Col>
              <Grid.Col lg={6} sm={3} className={classes.ColumnTextJustify}>{detail?.data.types.map((type,index)=><span key={index}>{type.type.name}{index < detail.length ? " | " : null} </span>)}</Grid.Col>
            </Grid>
        </Card.Section>
      </Card>
    </div>
  )
}

export default PokemonDetail;
