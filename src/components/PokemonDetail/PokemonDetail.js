import React,{ useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import pokeapi from '../../api/pokeapi';
import { Card, Text, Image, Grid, Modal} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import useStyles from './styles';

const PokemonDetail = props =>{
  const [detail, setDetail] = useState();
  const [showDetail,setShowDetail] = useState(false);
  const [descript, setDescription] = useState();
  const location = useLocation();
  const navigate = useNavigate();
  const { classes } = useStyles();
  let { index } = useParams();
  let pokeImageSrc = location?.state?.id ? location?.state?.id : index;
  const id = pokeImageSrc.toString()?.padStart(3, "0");

  // App hides the grid column holding this route below 768px (Mantine `sm`),
  // so render as a modal there instead. Must match that breakpoint exactly,
  // otherwise nothing is visible (card in a hidden column).
  const isDesktop = useMediaQuery('(min-width: 768px)', true);
  // Between 768px and 992px the card fills its grid column.
  const isNarrow = useMediaQuery('(min-width: 768px) and (max-width: 992px)', false);

  const closeDetail = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

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

  // inModal=true renders like the old ModalPokemonDetail: no Card class
  // (it used to hide the card on small screens), no glow decorations.
  const renderCard = (inModal) => (
      <Card
        shadow="sm"
        ml={inModal || !isNarrow ? '8vw' : 0}
        pb="xl"
        radius="md"
        className={inModal ? undefined : classes.Card}
        bg={`${descript?.data?.color?.name}`}
        withBorder
      >
        <Card.Section component="a">
          {!inModal && <div className={`${classes.GlowingCircle} ${classes.Glow}`}></div>}
          <Image src={id<10000 ? `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id}.png`: detail?.data.sprites.front_default} height={200} fit="contain" />
        </Card.Section>
        <Card.Section p="lg" >
            <Text weight={1000} className={classes.title}>{detail?.data.name}</Text>
            {!inModal && <div className={`${classes.GlowingSquare} ${classes.Glow}`}></div>}
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
  );

  if (isDesktop) {
    return <div>{renderCard(false)}</div>;
  }

  // Mobile: the grid column holding this route is hidden, so render the
  // detail in a Modal (portaled to <body>) instead. Closing it navigates
  // back so the URL never points at a closed detail view.
  return (
    <Modal opened onClose={closeDetail} size={300}>
      {renderCard(true)}
    </Modal>
  );
}

export default PokemonDetail;
