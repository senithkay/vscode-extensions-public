import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        statusContainer: {
            height: theme.spacing(4),
            borderRadius: 16,
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            minWidth: theme.spacing(12),
            paddingLeft: theme.spacing(1.25),
            paddingRight: theme.spacing(1),
            backgroundColor: "#F7F8FB"
        },
        dot: {
            height: 8,
            width: 8,
            borderRadius: "50%",
            display: "inline-block",
            marginRight: theme.spacing(1.25),
            // @ts-ignore
            backgroundColor: props => props.filledColor
        },
        statusText: {
            textTransform: "capitalize",
            fontSize: 13,
            fontWeight: "normal",
            color: "#32324d"
        }
    })
);
