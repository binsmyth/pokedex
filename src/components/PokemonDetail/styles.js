import { createStyles } from "@mantine/core";

const useStyles=createStyles((theme) => ({
    Card:{
        width: '24vw',
        // Below md the card fills its grid column instead of being hidden:
        // visibility is now decided in JS (card vs modal), not by CSS.
        [`@media (max-width:${theme.breakpoints.md}px)`]:{
            width: '100%',
        },
    },

    GlowingCircle:{
        position:'absolute',
        left:'50%',
        top: '20%',
        backgroundColor:'white',
        width:'1px',
        height:'1px',
        borderRadius:'100px/50px',
    },
    GlowingSquare:{
        position:'absolute',
        left:'25%',
        top: '70%',
        backgroundColor:'white',
        opacity:0.8,
        width:'160px',
        height:'60px',
    },
    Glow: {
        boxShadow: '0 0 50px 60px #fff, 0 0 50px 60px #fff, 0 0 50px 60px #fff',
    },
    CardDescription:{
        position:'relative',
        zIndex:1000,
    },
    ColumnTextJustify:{
        textAlign: 'justify'
    },
    Title:{
        fontSize:54,
    }
}))

export default useStyles;