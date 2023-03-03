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
import React, { ReactElement, useEffect, useState } from "react";

import { Box,  Card, CardActions, CardContent, Collapse, FormLabel } from "@material-ui/core";

import Button from "./ChoreoSystem/Button/Button";
import ConfigElement, { ConfigElementProps } from "./ConfigElement";
import ButtonContainer from "./elements/ButtonContainer";
import ExpandMore from "./elements/ExpandMore";
import {
    ConfigSchema,
    ConfigType,
    ConnectionSchema,
    SchemaConstants,
} from "./model";
import { useStyles } from "./style";
import {
    getConfigProperties,
    getMetaData,
    getPackageConfig,
    setExistingValues,
} from "./utils";

export interface ConfigFormProps {
    configSchema: ConfigSchema;
    connectionConfig?: ConnectionSchema[];
    existingConfigs: object;
    defaultButtonText: string;
    primaryButtonText: string;
    onClickDefaultButton: () => void;
    onClickPrimaryButton: (configProperties: ConfigElementProps) => void;
    isLowCode?: boolean;
    isFeaturePreview?: boolean;
    env?: string;
}

const BALLERINA_CENTRAL_PROD = "https://lib.ballerina.io";
const BALLERINA_CENTRAL_STAGE = "https://staging-lib.ballerina.io";
const BALLERINA_CENTRAL_DEV = "https://dev-lib.ballerina.io";

const SENTRY_DEV = "V2_DEV";
const SENTRY_STAGE = "V2_STAGE";

export let docLink = "";

export const generateDocURL = (env: string, configSchema: ConfigSchema) => {
    const packageConfig = getPackageConfig(configSchema);
    const propertiesObj: object = packageConfig[SchemaConstants.PROPERTIES];
    const requiredProperties: string[] = packageConfig[SchemaConstants.REQUIRED];
    const propertyType: string = packageConfig[SchemaConstants.TYPE];

    if (requiredProperties
        && requiredProperties.includes(SchemaConstants.CONFIG)
        && propertyType === ConfigType.OBJECT
    ) {
        const moduleName = propertiesObj[SchemaConstants.CONFIG][SchemaConstants.NAME].split(":")[0];

        docLink = env === SENTRY_DEV ? `${BALLERINA_CENTRAL_DEV}/${moduleName}/latest` : env === SENTRY_STAGE ?
        `${BALLERINA_CENTRAL_STAGE}/${moduleName}/latest` : `${BALLERINA_CENTRAL_PROD}/${moduleName}/latest`;
    }
};

export const ConfigForm = (props: ConfigFormProps) => {
    const classes = useStyles();
    const defaultableFields: ReactElement[] = [];
    const [configValue, setConfigValue] = useState<ConfigElementProps[]>([]);
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        setExpanded(!expanded);
    }, []);

    const {
        configSchema,
        connectionConfig,
        existingConfigs,
        env,
        defaultButtonText,
        primaryButtonText,
        onClickDefaultButton,
        onClickPrimaryButton,
        isFeaturePreview,
        isLowCode,
    } = props;
    // The config property object retrieved from the config schema.
    const configElements: ConfigElementProps = getConfigProperties(
        getPackageConfig(configSchema), connectionConfig, isFeaturePreview, isLowCode,
    );
    generateDocURL(env, configSchema);
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
            isRequired: true,
            name: "root",
            properties: [...configValue],
            type: ConfigType.OBJECT,
        };
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
    configElements.properties.forEach((element) => {
        if (element.isRequired) {
            requiredElements.push(element);
        } else {
            defaultableElements.push(element);
        }
    });

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    if (defaultableElements.length > 0) {
        defaultableFields.push(
            (
                <Box key="defaultable fields" className={classes.innerBoxCard}>
                    <Card variant="outlined">
                        <Box>
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
                            <Collapse
                                in={expanded}
                                timeout="auto"
                                unmountOnExit={false}
                            >
                                <Box p={2} borderTop="1px solid #E0E2E9">
                                    {defaultableElements.map(ConfigElement)}
                                </Box>
                            </Collapse>
                        </Box>
                    </Card>
                </Box>
            ),
        );
    }

    return (
        <Box width="100%">
            <form className="ConfigForm" onSubmit={handleSubmit}>
                {requiredElements.map(ConfigElement)}
                {defaultableFields}
                <CardActions>
                    <ButtonContainer justifyContent="flex-end" size="small">
                        <Button
                            variant="outlined"
                            color="secondary"
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

ConfigForm.defaultProps = {
    isLowCode: false,
};
