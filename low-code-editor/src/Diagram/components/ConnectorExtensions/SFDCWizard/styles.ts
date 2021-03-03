
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            height: "auto",
            display: 'flex',
            flexDirection: 'column',
        },
        stepper: {
            marginTop: '5rem',
        }
    })
);
