import { makeStyles, Theme, createStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        clauseItem: {
            width: '100%',
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
                color: theme.palette.common.black,
                "& $deleteIcon": {
                    opacity: 1,
                }
            },
        },
        lineWrap:{
            width: 80,
            height: 25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            flexDirection: 'column'
        },
        line:{
            height: 6,
            width: 2,
            background: '#CBCEDB'
        },
        clauseKeyWrap: {
            border: '1px solid #CBCEDB',
            borderRadius: '8px',
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '26px 0',
            background: '#F7F8FB',
            width: 80,
            textAlign: 'center',
            fontWeight: 'bold'
        },
        clauseWrap: {
            background: 'white',
            borderRadius: '8px',
            height: 40,
            marginLeft: 25,
            marginRight: 10,
            display: 'flex',
            alignItems: 'center',
            padding: '26px 10px',
            boxShadow: '0px 5px 50px rgba(203, 206, 219, 0.5)',
        },
        buttonWrapper: {
            border: '1px solid #e6e7ec',
            borderRadius: '8px',
            right: "35px"
        },
        clauseItemKey: {
            marginLeft: 5
        },
        clauseExpression: {
            background: theme.palette.grey[100],
            borderRadius: 5,
            cursor: 'pointer',
            padding: 5,
            marginLeft: 5,
            marginRight: 5,
            transition: 'border 0.2s',
            border: `1px solid transparent`,
            '&:hover': {
                border: `1px solid ${theme.palette.grey[300]}`
            }
        },
        addIcon: {
            cursor: 'pointer',
            fontSize: '18px',
            color: '#5567D5',
            transition: 'all 0.2s',
            '&:hover': {
                color: '#384491',
            }
        },
        deleteIcon: {
            cursor: 'pointer',
            color: theme.palette.error.main,
            fontSize: '20px',
            transition: 'all 0.2s ease-in-out',
            opacity: 0,
            '&:hover': {
                color: theme.palette.error.dark,
            }
        },
        input: {
            maxWidth: '120px',
            padding: "5px",
            border: 0,
            '&:hover': { outline: 0 },
            '&:focus': { outline: 0 },
            background: 'transparent'
        },
        addButtonWrap: {
            position: 'absolute',
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            top: 0,
        },
        queryInputInputPortWrap: {
            width: 80,
            display: 'flex',
            justifyContent: 'center'
        },
        addMenu: {
            marginLeft: 5,
            marginTop: 10,
            '& .MuiMenuItem-root': {
                fontSize: '11px',
                paddingBottom: "1px",
                paddingTop: "1px"
            }
        }
    })
);