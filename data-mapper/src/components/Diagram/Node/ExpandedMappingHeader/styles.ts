import { makeStyles, Theme, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            minWidth: 200,
        },
        header: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: 'center',
            height: 40,
            marginBottom: 10
        },
        title: {
            padding: "5px",
            fontFamily: "monospace",
            flex: 1,
        },
        buttonWrapper: {
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            right: "35px"
        },
        empty: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: 'center',
            color: theme.palette.primary.main
        },
        clause: {
            padding: "5px",
            fontFamily: "monospace",
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        clauseExpression: {
            background: theme.palette.grey[100],
            borderRadius: 5,
            cursor: 'pointer',
            padding: 5,
            // marginLeft: 5,
            transition: 'border 0.2s',
            border: `1px solid transparent`,
            '&:hover': {
                border: `1px solid ${theme.palette.grey[300]}`
            }
        },
        iconsButton: {
            padding: '8px',
            marginLeft: '5px',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        icon: {
            height: '15px',
            width: '15px',
            marginTop: '-7px',
            marginLeft: '-7px'
        },
        clauseWrap: {
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            color: theme.palette.grey[800],
            // height: 30,
            transitionDuration: '0.2s',
            '&:hover': {
                color: theme.palette.common.black
            }
        },
        addIcon: {
            cursor: 'pointer',
            fontSize: '18px',
            color: theme.palette.primary.main,
            transitionDuration: '0.2s',
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        topIcon: {
            position: 'absolute',
            right: '50%',
            top: -18
        },
        bottomIcon: {
            position: 'absolute',
            right: '50%',
            bottom: -18
        },
        deleteIcon: {
            cursor: 'pointer',
            color: theme.palette.error.main,
            fontSize: '18px',
            opacity: 0,
            transitionDuration: '0.2s',
            marginRight: 2,
            '&:hover': {
                backgroundColor: '#F0F1FB',
            }
        },
        deleteIconHovered: {
            opacity: 1,
        },
        element: {
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: theme.palette.common.white,
            padding: "8px 16px",
            boxShadow: '0px 5px 50px rgba(203, 206, 219, 0.5)',
            borderRadius: '12px',
        },
        input:{
            maxWidth: '120px',
            padding: "5px",
            fontFamily: "monospace",
            border: 0,
            '&:hover': { outline: 0 },
            '&:focus': { outline: 0 },
            background: 'transparent'
        }
    })
);