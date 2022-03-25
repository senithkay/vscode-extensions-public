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

import React, { ReactElement, useState } from "react";

import { Box, Card, CardContent, Collapse, Typography } from "@material-ui/core";

import { ConfigElementProps, getConfigElement } from "./ConfigElement";
import ExpandMore from "./elements/ExpandMore";
import { ConfigValue } from "./model";
import { useStyles } from "./style";
import { instanceOfConfigElement } from "./utils";

/**
 * A high level config property which can contain nested objects.
 */
export interface ConfigObjectProps {
    id: string;
    name: string;
    isRequired: boolean;
    properties?: Array<ConfigElementProps | ConfigObjectProps>;
    setConfigElement?: (configValue: ConfigValue) => void;

}

export const GetConfigObject = (configObjectProps: ConfigObjectProps) => {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(configObjectProps.isRequired);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    if (configObjectProps === undefined) {
        return;
    }

    configObjectProps.properties.forEach((entry) => {
        entry.setConfigElement = configObjectProps.setConfigElement;
    });

    return (
        <Box className={classes.innerBoxCard}>
            <Card variant="outlined">
                <CardContent className={classes.cardContent}>
                    <Box className={classes.innerBoxHead}>
                        <Typography className={classes.innerBoxTitle}>
                            {configObjectProps.name}
                        </Typography>
                        <ExpandMore
                            expand={expanded}
                            onClick={handleExpandClick}
                        />
                    </Box>

                    <Collapse in={expanded} timeout="auto" unmountOnExit={true}>
                        <ConfigObject {...configObjectProps.properties} />
                    </Collapse>
                </CardContent>
            </Card>
        </Box>
    );
};

const ConfigObject = (
    configProperties: Array<ConfigElementProps | ConfigObjectProps>,
): ReactElement => {
    const classes = useStyles();
    const returnElement: ReactElement[] = [];

    Object.keys(configProperties).forEach((key) => {
        if (instanceOfConfigElement(configProperties[key])) {
            returnElement.push(
                (
                    <div key={configProperties[key].id}>
                        {getConfigElement(configProperties[key] as ConfigElementProps, classes)}
                    </div>
                ),
            );
        } else {
            returnElement.push(
                (
                    <div key={configProperties[key].id}>
                        <GetConfigObject {...configProperties[key] as ConfigObjectProps} />
                    </div>
                ),
            );
        }
    });
    return <>{returnElement}</>;
};

export default ConfigObject;
