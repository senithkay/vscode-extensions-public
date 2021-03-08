import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            // maxWidth:  300,
        },
        buttonMenuItem: {
            '&:hover': {
                backgroundColor: "none"
            }
        },
        titleWrap: {
            display: "flex",
        },
        title: {
            marginBottom: 12,
            marginRight: 6,
            fontSize: 13,
            letterSpacing: 0,
            fontWeight: 500,
            color: "#222228",
        },
        loaderTitle: {
            textAlign: "center",
            marginTop: theme.spacing(1),
            marginBottom: theme.spacing(2)
        },
        radioBox: {
            width: "100%",
            borderRadius: 5,
            padding: theme.spacing(0.5),
            paddingLeft: theme.spacing(2.5),
            marginBottom: theme.spacing(0.5),
            borderColor: theme.palette.secondary.main,
            '& .MuiFormControlLabel-root': {
                width: "100%",
            },
            '& span.MuiTypography-root.MuiFormControlLabel-label.MuiTypography-body1': {
                whiteSpace: "nowrap",
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }
        },
        radioButton: {
            width: 16,
        },
        radioBtnTitle: {
            marginBottom: 2,
            fontWeight: 400,
        },
        radioBtnSubtitle: {
            fontSize: "smaller",
            color: "#8d91a3"
        },
        box: {
            width: "100%",
            borderRadius: 5,
            padding: theme.spacing(1),
            paddingLeft: theme.spacing(2.5),
            marginBottom: theme.spacing(1),
            borderColor: theme.palette.secondary.main,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '& h6.MuiTypography-root.MuiTypography-subtitle2': {
                whiteSpace: "nowrap",
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }
        },
        radio: {
            '&$checked': {
                color: theme.palette.primary.main,
            },
        },
        mainConnectBtn: {
            width: "100%",
            padding: theme.spacing(2)
        },
        listConnectBtn: {
            width: "100%",
            padding: theme.spacing(1)
        },
        changeConnectionBtn: {
            padding: 3,
        },
    }),
);
