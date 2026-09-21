import React,{ useState, useEffect } from 'react';
import { useLocation, useOutletContext, useParams } from 'react-router-dom';
import pokeapi from '../../api/pokeapi';
import { Card, Text, Image, Grid, Modal } from '@mantine/core';

    const ModalPokemonDetail = props =>{
        const [openModal, setOpenModal] = useOutletContext();
        const [detail, setDetail] = useState();
        const [showDetail,setShowDetail] = useState(false);
        const [descript, setDescription] = useState();
        const location = useLocation();
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
                <Modal opened={openModal} onClose={()=>setOpenModal(false)} size={300}>
                    <Card component="article" shadow="sm" ml="8vw" pb="xl" radius="md" withBorder >
                            <Card.Section component="a">
                                <Image alt="pokemon" src={Number(id)<906 ? `https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${id}.png`: detail?.data.sprites.front_default} height={200} fit="contain" />
                            </Card.Section>
                            <Card.Section p="lg" >
                                <Text weight={1000}>{detail?.data.name}</Text>
                                <Text onClick={()=>setShowDetail(!showDetail)} lineClamp={showDetail === false ? 2 : 3}>{descript?.data?.flavor_text_entries[0]?.flavor_text || "nil"}</Text>
                                <Grid bg="orange.2" mt="xs" p="lg">
                                    <Grid.Col lg={6} sm={3}>{detail?.data.height || detail?.height}</Grid.Col>
                                    <Grid.Col lg={6} sm={3}>base experience:</Grid.Col>
                                    <Grid.Col lg={6} sm={3}>height:</Grid.Col>
                                    <Grid.Col lg={6} sm={3}>{detail?.data.base_experience || detail?.base_experience || "nil"}</Grid.Col>
                                    <Grid.Col lg={6} sm={3}>types:</Grid.Col>
                                    <Grid.Col lg={6} sm={3}>{detail?.data.types.map((type,index)=><span key={index}>{type.type.name}{index < detail.length ? " | " : null} </span>)}</Grid.Col>
                                </Grid>
                            </Card.Section>
                        </Card>
                </Modal>
            )
        }

export default ModalPokemonDetail;
