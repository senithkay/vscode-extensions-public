import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
export const useStyles = makeStyles((theme: Theme) =>
    createStyles({

        root: {
            display: "flex",
        },

        checkbox: {
            color: '#40404B',

            "&$checked": {
                color: "#404040",

                "&:hover": {
                    background: "#404040",
                },

                "& .MuiIconButton-label": {
                    position: "relative",
                    zIndex: 0,
                    color: "#fff",
                },

                "& .MuiIconButton-label::after": {
                    content: '""',
                    left: 1,
                    top: 1,
                    width: 19,
                    height: 19,
                    position: "absolute",
                    backgroundColor: "#404040",
                    zIndex: -1,
                    border: "1px solid #404040",
                    borderRadius: 3,
                }
            }
        },

        checked: {},

        checkFormControl: {
            margin: theme.spacing(0.5)
        },

        disabled: {
            backgroundColor: "#afb9f6 !important",
            color: "#FFF !important",
        },
    })
);
