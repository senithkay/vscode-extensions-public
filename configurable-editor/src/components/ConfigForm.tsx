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

import { Box, Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";

import { ConfigElementProps, getConfigElement } from "./ConfigElement";
import { ConfigObjectProps, getConfigObject } from "./ConfigObject";
import { MetaData, SchemaConstants, setMetaData } from "./model";
import { getConfigProperties, instanceOfConfigElement, setExistingValues } from "./utils";

let metaData: MetaData = null;

/**
 * A high level config value which can contain nested objects.
 */
interface ConfigValue {
    name: string;
    value: number | string | boolean | number[] | string[] | boolean[] | ConfigValue;
}

/**
 * Returns the config schema values for a package, removes the 2 top most root
 * properties and sets the meta data values.
 * @param configSchema The original config schema object.
 * @returns            The config schema object without the 2 top most root properties.
 */
function getPackageConfig(configSchema: object): object {
    const orgConfig: object = configSchema[SchemaConstants.PROPERTIES];
    const orgName = Object.keys(orgConfig)[0];

    const packageConfig: object = orgConfig[orgName][SchemaConstants.PROPERTIES];
    const packageName = Object.keys(packageConfig)[0];

    metaData = setMetaData(orgName, packageName);

    return packageConfig[packageName];
}

export interface ConfigFormProps {
    configSchema: object;
    existingConfigs: object;
    defaultButtonText: string;
    primaryButtonText: string;
}

const getConfigForm = (configProperty: ConfigObjectProps | ConfigElementProps) => {
    if (instanceOfConfigElement(configProperty)) {
        return (
            <div key={configProperty.id}>
                {getConfigElement(configProperty as ConfigElementProps)}
            </div>
        );
    } else {
        return (
            <div key={configProperty.id}>
                {getConfigObject(configProperty as ConfigObjectProps)}
            </div>
        );
    }
};

const handleSubmit = (event: any) => {
    event.preventDefault();
    // TODO: Handle the submit for Choreo Console and Low Code based on a prop
    // console.log(JSON.stringify(event.target));
};

export const ConfigForm = ({configSchema, existingConfigs, defaultButtonText, primaryButtonText }: ConfigFormProps) => {
    // The config property object retrieved from the config schema.
    const configObjectProps: ConfigObjectProps = getConfigProperties(getPackageConfig(configSchema));

    // Set the existing config values to the config property obtained.
    setExistingValues(configObjectProps, existingConfigs, metaData);

    return (
        <Box sx={{ mt: 5 }}>
            <Container maxWidth="sm">
                <Card variant="outlined">
                    <CardContent>
                        <Box m={2} pt={3} style={{ textAlign: "center" }}>
                            <Typography gutterBottom={true} variant="h5" component="div">
                                Configurable Editor
                            </Typography>
                        </Box>
                        <Typography variant="body2" component="div">
                            <form className="ConfigForm" onSubmit={handleSubmit}>
                                {configObjectProps.properties.map(getConfigForm)}
                                <CardActions style={{ justifyContent: "center" }}>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                        >
                                            {defaultButtonText}
                                        </Button>
                                    </Box>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                        >
                                            {primaryButtonText}
                                        </Button>
                                    </Box>
                                </CardActions>
                            </form>
                        </Typography>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default ConfigForm;
