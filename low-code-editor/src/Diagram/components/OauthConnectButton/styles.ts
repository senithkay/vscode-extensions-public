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
            marginTop: 8
        },
        title: {
            marginBottom: 12,
            marginRight: 6,
            fontSize: 15,
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
            height: theme.spacing(6),
            display: "flex",
            width: "100%",
            borderRadius: 5,
            padding: theme.spacing(0.5),
            paddingLeft: theme.spacing(2.5),
            borderColor: "#ff000000",
            border: "1px solid",
            '& .MuiFormControlLabel-root': {
                width: "100%",
            },
            '& span.MuiTypography-root.MuiFormControlLabel-label.MuiTypography-body1': {
                whiteSpace: "nowrap",
                width: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            '&:hover': {
                boxSizing: "border-box",
                border: "1px solid #E6E7EC",
                borderRadius: theme.spacing(0.5),
                backgroundColor: "#F7F8FB"
            }
        },
        radioButton: {
            width: 16,
        },
        radioBtnTitle: {
            margin: 0,
            fontWeight: 400,
        },
        radioBtnSubtitle: {
            fontSize: 13,
            color: "#222228",
            margin: "-5px 0",
        },
        box: {
            width: "auto",
            borderRadius: 5,
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
                paddingLeft: theme.spacing(2.5),
                padding: "0.7rem"
            }
        },
        radio: {
            display: "none",
            '&$checked': {
                color: theme.palette.primary.main,
            },
        },
        radioContainer: {
            overflowY: "scroll",
            overflowX: "hidden",
            marginBottom: theme.spacing(3.5),
            scrollBehavior: 'smooth',
            maxHeight: theme.spacing(18.375),
            '&::-webkit-scrollbar': {
                width: 4
            },
            '&::-webkit-scrollbar-thumb': {
                background: "#e6e7ec",
                borderRadius: 4
            },
            '&::-webkit-scrollbar-track': {
                backgroundColor: "transparent"
            }
        },
        radioGroup: {
            zIndex: 200
        },
        mainConnectBtn: {
            height: theme.spacing(6),
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
        searchBox: {
            height: 32,
            width: "100%",
            borderRadius: 6,
            color: "#8D91A3",
            fontFamily: "Gilmer",
            fontSize: 13,
            boxShadow: "inset 0 0 0 1px #dee0e7, inset 0 2px 1px 0 rgba(0, 0, 0, 0.07), 0 0 0 0 rgba(50, 50, 77, 0.07)",
            padding: "0 1rem",
            border: 0,
            "&:focus": {
                outline: "none",
                border: "1px solid #5567d5"
            }
        },
        searchWrapper: {
            marginBottom: 5,
        },
        oauthConnectionText: {
            fontSize: 15,
            fontWeight: 500,
        },
        oauthConnectionTextWrapper: {
            width: 244,
            marginBottom: 18,
            marginTop: 10
        },
        oauthConnectionAltTextWrapper: {
            textAlign: "center",
            marginTop: 3,
            marginBottom: theme.spacing(1)
        },
        oauthConnectionAltText: {
            fontSize: 13,
            fontWeight: 200,
            color: "#8D91A3"
        },
        divider: {
            marginRight: 5,
            marginLeft: 5,
            backgroundColor: "#E6E7EC !important"
        },
        activeConnectionWrapper: {
            display: "flex",
            marginTop: -8,
            marginBottom: 8
        },
        activeConnectionWrapperChild1: {
            width: "63%",
            float: "left"
        },
        activeConnectionWrapperChild2: {
            width: "37%",
            float: "right",
        },
        activeConnectionBox: {
            width: "100%",
            borderRadius: 5,
            padding: theme.spacing(0.5),
            borderColor: "#ff000000",
            border: "0px solid",
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
        connectionContainer: {
            marginTop: theme.spacing(2.5)
        },
        saveBtnWrapper: {
            display: "flex",
            justifyContent: "flex-end",
            height: "auto",
            marginTop: "2.5rem",
        },
        manualConfigBtnWrapper: {
            display: "flex",
            flexDirection: "column",
            marginTop: '1rem',
            position: "relative"
        },
        fullWidth: {
            width: "100%",
            "& .MuiFormControl-marginNormal": {
                margin: '0 !important',
            }
        },
        manualConfigBtnSquare: {
            height: "48px !important"
        },
    }),
);
