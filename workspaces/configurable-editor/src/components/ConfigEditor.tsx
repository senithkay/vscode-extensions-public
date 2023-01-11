/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
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
