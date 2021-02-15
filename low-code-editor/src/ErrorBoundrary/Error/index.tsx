import * as React from "react";

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import errorSvg from "../../assets/images/default-error.svg";

import { useStyles } from "./style";

export default function Default() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <Grid
                container={true}
                direction="column"
                justify="center"
                alignItems="center"
                className={classes.gridContainer}
            >
                <Grid item={true}>
                    <img src={errorSvg} alt="Oops! this is embarrassing" />
                </Grid>
                <Grid item={true}>
                    <Typography variant="h1" className={classes.errorTitle} component="div">
                        Oops! this is embarrassing
                    </Typography>
                </Grid>
                <Grid item={true}>
                    <Typography variant="subtitle1" component="div" className={classes.errorMsg}>
                        Something went terribly wrong. Will you please refresh and try again
                    </Typography>
                </Grid>
            </Grid>
        </div>
    );
}
