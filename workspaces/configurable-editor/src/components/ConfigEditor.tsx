/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import {
    Box,
    Card,
    CardContent,
    Container,
    Divider,
    Typography,
} from "@material-ui/core";

import { useStyles } from "./style";

interface ConfigEditorProps {
    children: JSX.Element;
}

function ConfigEditor(props: ConfigEditorProps) {
    const classes = useStyles();
    const { children } = props;
    return (
        <Card variant="outlined">
            <CardContent>
                <Box className={classes.cardMainHead}>
                    <Typography variant="h6" component="div">
                        Configure & Run
                    </Typography>
                </Box>

                <Box>{children}</Box>
            </CardContent>
        </Card>
    );
}

export default ConfigEditor;
