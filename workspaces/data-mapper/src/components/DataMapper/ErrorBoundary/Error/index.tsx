/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as React from "react";

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import ErrorGenSvg from "./ErrorSvg";
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
                    <ErrorGenSvg />
                </Grid>
                <Grid item={true}>
                    <Typography variant="h4" className={classes.errorTitle} component="div">
                        A problem occurred while rendering the Data Mapper.
                    </Typography>
                </Grid>
                <Grid item={true}>
                    <Typography variant="subtitle2" component="div" className={classes.errorMsg}>
                        Please raise an issue with the sample code in our <a href="https://github.com/wso2/ballerina-plugin-vscode/issues">issue tracker</a>
                    </Typography>
                </Grid>
            </Grid>
        </div>
    );
}
