/**
 * Copyright (c) 2021, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactElement, useEffect, useRef, useState } from "react";

import { Box,  Card, CardActions, CardContent, Collapse, FormLabel, Typography } from "@material-ui/core";

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
    isDisablePrimaryButton?: boolean;
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
    const configValue = useRef<ConfigElementProps[]>([]);
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
        isDisablePrimaryButton,
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
        const existingConfigIndex = configValue.current.findIndex(
            (property) => property.id === id
        );
        if (existingConfigIndex > -1) {
            configValue.current[existingConfigIndex] = value;
        } else {
            configValue.current.push(value);
        }
    };

    const handleSubmit = (event: any) => {
        event.preventDefault();
        const returnElement: ConfigElementProps = {
            id: "1",
            isRequired: true,
            name: "root",
            properties: [...configValue.current],
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
                </Box>
            ),
        );
    }

    const bannerTextForSensitiveFields = (
        <Box className={classes.primaryContained}>
            <Box className={classes.notificationInner}>
                <Box className={classes.notificationContent}>
                <Box>
                    <Typography variant="body2">
                        Updating sensitive content results in the removal of previously
                        added content and cannot be recovered.
                    </Typography>
                </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box width="100%">
            <form className="ConfigForm" onSubmit={handleSubmit}>
                {requiredElements.map(ConfigElement)}
                {defaultableFields}
                {!isLowCode && isFeaturePreview && bannerTextForSensitiveFields}
                <CardActions>
                    <ButtonContainer justifyContent="flex-end" size="small">
                        <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={handleDefaultButtonClick}
                            data-cyid="btn-back-configform"
                            testId="default-btn-configform"
                        >
                            {defaultButtonText}
                        </Button>
                        {
                            !isDisablePrimaryButton && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    type="submit"
                                    data-cyid="btn-submit-configform"
                                    testId="primary-btn-configform"
                                >
                                    {primaryButtonText}
                                </Button>
                            )
                        }

                    </ButtonContainer>
                </CardActions>
            </form>
        </Box>
    );
};

export default ConfigForm;

ConfigForm.defaultProps = {
    isDisablePrimaryButton: false,
    isLowCode: false,
};
