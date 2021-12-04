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
import React, { useState } from "react";

import { Box, Button, Card, CardActions, CardContent, Container, Typography } from "@material-ui/core";

import ConfigElements from "./ConfigElements";

enum ConfigType {
    NUMBER = "number",
    STRING = "string",
    BOOLEAN = "boolean",
}

export interface ConfigProperty {
    id: string;
    name: string;
    type: ConfigType;
    description: string;
    required: boolean;
    value?: string;
}

export interface ConfigProperties {
    moduleName: string;
    properties: ConfigProperty[];
}

export interface ConfigFormProps {
    configSchema: object;
    defaultButtonText: string;
    primaryButtonText: string;
    onClickDefaultButton: () => void;
    onClickPrimaryButton: (configProperties: ConfigProperties[]) => void;
}

const type: string = "type";
const description: string = "description";

function isUserDefinedModule(propertyObj: any): boolean {
    let isModule = false;
    Object.keys(propertyObj).forEach((key) => {
        if (key === "properties") {
            isModule = true;
        }
    });
    return isModule;
}

export const ConfigForm = ({
    configSchema,
    defaultButtonText,
    primaryButtonText,
    onClickDefaultButton,
    onClickPrimaryButton,
  }: ConfigFormProps) => {
    const [configs, setConfigs] = useState(new Array<ConfigProperties>());
    const [submitType, setSubmitType] = useState("");

    const configJsonSchema = configSchema;

    let schemaProperties: any;
    let projectProperties: any;
    let packageProperties: any;
    let requiredProperties: any;
    let moduleProperties: any;
    let allProperties: any;
    const configProperties: ConfigProperties[] = [];

    Object.keys(configJsonSchema).forEach((key) => {
        if (key === "properties") {
            schemaProperties = configJsonSchema[key];
        }
    });

    Object.keys(schemaProperties).forEach((key) => {
        if (key !== "" || key !== undefined) {
            projectProperties = schemaProperties[key].properties;
        }
    });

    Object.keys(projectProperties).forEach((key) => {
        if (key !== "" || key !== undefined) {
            packageProperties = projectProperties[key];
        }
    });

    Object.keys(packageProperties).forEach((key) => {
        if (key === "required") {
            requiredProperties = packageProperties[key];
        }
        if (key === "properties") {
            allProperties = packageProperties[key];
        }
    });

    Object.keys(allProperties).forEach((key) => {
        if (isUserDefinedModule(allProperties[key])) {
            moduleProperties = allProperties[key].properties;
            Object.keys(moduleProperties).forEach((moduleKey) => {
                addConfig(moduleProperties[moduleKey], key, moduleKey);
            });
        } else {
            addConfig(allProperties[key], "default", key);
        }
    });

    function addConfig(propertyObj: any, moduleName: string, configName: string) {
        let isRequired = false;
        if (requiredProperties) {
            requiredProperties.forEach((element: any) => {
                if (configName === element) {
                    isRequired = true;
                }
            });
        }

        const moduleEntry = configProperties.findIndex((e) => e.moduleName === moduleName);
        const config: ConfigProperty = {
            description: propertyObj[description],
            id: moduleName + "-" + configName,
            name: configName,
            required: isRequired,
            type: propertyObj[type],
        };

        if (configProperties[moduleEntry] !== undefined) {
            configProperties[moduleEntry].properties.push(config);
        } else {
            configProperties.push({ moduleName, properties: [config] });
        }
    }

    // TODO: Updating the form with existing config values

    const handleSubmit = (event: any) => {
        event.preventDefault();
        // TODO: Handle the submit for Choreo Console and Low Code based on a prop
        // console.log(JSON.stringify(configs));
        if (submitType === defaultButtonText) {
            onClickDefaultButton();
        } else if (submitType === primaryButtonText) {
            onClickPrimaryButton(configs);
        }
    };

    const handleSetConfigs = (e: ConfigProperties) => {
        const existingConfig = configs.findIndex((property) => property.moduleName === e.moduleName);
        if (existingConfig > -1) {
            configs[existingConfig].properties = e.properties;
        } else {
            configs.push(e);
        }
        setConfigs(configs);
    };

    const getConfigForm = (configProperty: ConfigProperties, index: number) => {
        return (
            <div key={index}>
                <Box m={2} pt={3}>
                    <h3>
                        Module:{" "}
                        <span style={{ fontFamily: "Verdana", color: "#3f51b5" }}>
                            {configProperty.moduleName}
                        </span>
                    </h3>
                    <ConfigElements
                        key={index}
                        elements={configProperty.properties}
                        moduleName={configProperty.moduleName}
                        setConfigs={handleSetConfigs}
                    />
                </Box>
            </div>
        );
    };

    const handleSetSubmitType = (value: string) => {
        setSubmitType(value);
    };

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
                                {configProperties.map(getConfigForm)}
                                <CardActions style={{ justifyContent: "center" }}>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            onClick={handleSetSubmitType.bind(this, defaultButtonText)}
                                        >
                                            {defaultButtonText}
                                        </Button>
                                    </Box>
                                    <Box m={2} pt={3} mb={6}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            onClick={handleSetSubmitType.bind(this, primaryButtonText)}
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
