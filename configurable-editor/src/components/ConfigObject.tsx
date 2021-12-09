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

import React, { ReactElement } from "react";

import { Box, Card, CardContent, Typography } from "@material-ui/core";

import { ConfigElementProps, getConfigElement } from "./ConfigElement";
import { ConfigValue } from "./model";
import { instanceOfConfigElement } from "./utils";

/**
 * A high level config property which can contain nested objects.
 */
export interface ConfigObjectProps {
    id: string;
    name: string;
    properties?: Array<ConfigElementProps | ConfigObjectProps>;
    setConfigElement?: (configValue: ConfigValue) => void;
}

export const getConfigObject = (configObjectProps: ConfigObjectProps) => {
    if (configObjectProps === undefined) {
        return;
    }

    configObjectProps.properties.forEach((entry) => {
        entry.setConfigElement = configObjectProps.setConfigElement;
    });

    return (
        <Box pt={2}>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="body1" component="div" style={{fontWeight: "600"}}>
                        {configObjectProps.name}
                    </Typography>
                    <Typography variant="body2" component="div">
                        {<ConfigObject {...configObjectProps.properties}/>}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

const ConfigObject = (configProperties: Array<ConfigElementProps | ConfigObjectProps>): ReactElement => {
    const returnElement: ReactElement[] = [];

    Object.keys(configProperties).forEach((key) => {
        if (instanceOfConfigElement(configProperties[key])) {
            returnElement.push(
                (
                    <div key={configProperties[key].id}>
                        {getConfigElement(configProperties[key] as ConfigElementProps)}
                    </div>
                ),
            );
        } else {
            returnElement.push(
                (
                    <div key={configProperties[key].id}>
                        {getConfigObject(configProperties[key] as ConfigObjectProps)}
                    </div>
                ),
            );
        }
    });
    return (<>{returnElement}</>);
};

export default ConfigObject;
