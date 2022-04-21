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

import { Box, Button, Card, CardActions, CardContent, Collapse, FormLabel } from "@material-ui/core";

import ButtonContainer from "./elements/ButtonContainer";
import {
    ConfigSchema,
    ConfigType,
} from "./model";
import {
    getConfigProperties,
    getMetaData,
    getPackageConfig,
    setExistingValues,
} from "./utils";
import ConfigElement, { ConfigElementProps } from "./ConfigElement";
import { useStyles } from "./style";
import ExpandMore from "./elements/ExpandMore";

export interface ConfigFormProps {
    configSchema: ConfigSchema;
    existingConfigs: object;
    defaultButtonText: string;
    primaryButtonText: string;
    onClickDefaultButton: () => void;
    onClickPrimaryButton: (configProperties: ConfigElementProps) => void;
}

export const ConfigForm = (props: ConfigFormProps) => {
    const classes = useStyles();
    const [configValue, setConfigValue] = useState<ConfigElementProps[]>([]);
    const [expanded, setExpanded] = useState(false);

    const {
        configSchema,
        existingConfigs,
        defaultButtonText,
        primaryButtonText,
        onClickDefaultButton,
        onClickPrimaryButton,
    } = props;

    // The config property object retrieved from the config schema.
    let configElements: ConfigElementProps = getConfigProperties(
        getPackageConfig(configSchema),
    );

    // Set the existing config values to the config property obtained.
    setExistingValues(configElements, existingConfigs, getMetaData(configSchema));

    const handleSetConfigValue = (id: string, value: any) => {
        setConfigValue((prevState) => {
            let newConfigValue: ConfigElementProps[] = [...prevState];
            const existingConfig = newConfigValue.findIndex(
                (property) => property.id === id,
            );
            if (existingConfig > -1) {
                newConfigValue[existingConfig] = value;
            } else {
                newConfigValue = newConfigValue.concat(value);
            }
            return [...newConfigValue];
        });
    };

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const returnElement: ConfigElementProps = {
            id: "1",
            name: "root",
            isRequired: true,
            type: ConfigType.OBJECT,
            properties: [...configValue],
        };
        console.log(returnElement);
        onClickPrimaryButton(returnElement);
    };

    const handleDefaultButtonClick = () => {
        onClickDefaultButton();
    };

    configElements.properties.forEach((entry) => {
        entry.setConfigElement = handleSetConfigValue;
    });

    const requiredElements: ConfigElementProps[] = [];
    const defaultableElements: ConfigElementProps[] = [];
    configElements.properties.forEach(element => {
        if (element.isRequired) {
            requiredElements.push(element);
        } else {
            defaultableElements.push(element);
        }
    });

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
        <Box width="100%">
            <form className="ConfigForm" onSubmit={handleSubmit}>
                {requiredElements.map(ConfigElement)}
                <Box className={classes.innerBoxCard}>
                    <Card variant="outlined">
                        <CardContent className={classes.cardContent}>
                            <Box className={classes.innerBoxHead}>
                                <FormLabel
                                    component="div"
                                    className={classes.mainLabelText}
                                >
                                    Defaultable Configurables
                                </FormLabel>
                                <ExpandMore
                                    expand={expanded}
                                    onClick={handleExpandClick}
                                />
                            </Box>
                            <Collapse in={expanded} timeout="auto" unmountOnExit={true}>
                                {defaultableElements.map(ConfigElement)}
                            </Collapse>
                        </CardContent>
                    </Card>
                </Box>
                <CardActions>
                    <ButtonContainer justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="default"
                            size="small"
                            onClick={handleDefaultButtonClick}
                        >
                            {defaultButtonText}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            type="submit"
                        >
                            {primaryButtonText}
                        </Button>
                    </ButtonContainer>
                </CardActions>
            </form>
        </Box>
    );
};

export default ConfigForm;
