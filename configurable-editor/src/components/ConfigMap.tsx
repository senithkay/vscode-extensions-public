/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { Box, Card, CardContent, Typography } from "@material-ui/core";

import ConfigElement, { ConfigElementProps } from "./ConfigElement";
import { ConfigObjectProps, ConfigRecord } from "./ConfigRecord";
import { AddInputButton } from "./elements/AddInputButton";
import OutlinedLabel from "./elements/OutlinedLabel";
import { TextFieldInput } from "./elements/TextFieldInput";
import { ConfigType, SchemaConstants } from "./model";
import { useStyles } from "./style";
import { getConfigProperties, getDescription, getType } from "./utils";

/**
 * A high level config property which can contain configurable maps.
 */
export interface ConfigMapProps {
    id: string;
    name: string;
    isRequired: boolean;
    additionalProperties: object;
    description?: string;
    value?: any;
    setConfigMap?: (configValue: object) => void;

}

interface ConfigMapValue {
    id: string;
    key: string;
    value: any;
}

export function setConfigMapProps(
    id: string,
    name: string,
    isRequired: boolean,
    additionalProperties: object,
    description?: string,
    value?: any,
): ConfigMapProps {
    return {
        additionalProperties,
        description,
        id,
        isRequired,
        name,
        value,
    };
}

export const ConfigMap = (configMapProps: ConfigMapProps): ReactElement => {
    const [mapValues, setMapValues] = useState<ConfigMapValue[]>([]);
    const classes = useStyles();

    if (configMapProps === undefined) {
        return;
    }

    const types: string[] = getMapType(configMapProps.additionalProperties);
    const typeLabel: string = getMapTypeLabel(types);
    if (types.length > 1) {
        return(
            <Box className={classes.innerBoxCard}>
                <Card variant="outlined">
                    <CardContent className={classes.cardContent}>
                    <Box className={classes.mainLabelText}>
                        <Typography component="div" className={classes.unsupportedLabelText}>
                            Unsupported type found for {configMapProps.name}!
                        </Typography>
                    </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const addMapField = () => {
        const mapValue: ConfigMapValue = {
            id: configMapProps.id + "-" + (mapValues.length + 1),
            key: "Key",
            value: "Value",
        };
        setMapValues([...mapValues, mapValue]);
    };

    const removeMapField = (i: number) => {
        const newMapValues = [...mapValues];
        newMapValues.splice(i, 1);
        setMapValues(newMapValues);
    };

    const handleValueChange = (id: string, value: string) => {
        const newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newMapValues[existingMap].value = value;
        }
        setMapValues(newMapValues);
    };

    const handleKeyChange = (id: string, key: string) => {
        const newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newMapValues[existingMap].key = key;
        }
        setMapValues(newMapValues);
    };

    const getConfigElements = (element: ConfigMapValue) => {
        return(
            <Box key={element.id} className={classes.innerBoxCard}>
                <Card variant="outlined">
                    <CardContent className={classes.cardContent}>
                        <Box key={element.id + "-ENTRY"}>
                            <TextFieldInput
                                id={element.id}
                                isRequired={true}
                                existingValue={element.key}
                                type={"string"}
                                setTextFieldValue={handleKeyChange}
                            />
                            {getConfigElement(element.id)}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const getConfigElement = (id: string) => {
        const elementType = getType(types[0]);
        if (elementType === ConfigType.RECORD) {
            const configObjectProps: ConfigObjectProps = getConfigProperties(
                configMapProps.additionalProperties,
            );
            configObjectProps.name = "Value";
            return(
                <ConfigRecord {...configObjectProps as ConfigObjectProps} />
            );
        } else {
            const configElementProps: ConfigElementProps = {
                id,
                isArray: false,
                isRequired: false,
                name: configMapProps.name,
                type: elementType,
            };
            return(
                <ConfigElement {...configElementProps} />
            );
        }
    };

    return (
        <Box className={classes.innerBoxCard}>
            <Card variant="outlined">
                <CardContent className={classes.cardContent}>
                    <Box className={classes.labelCont}>
                        <Box className={classes.mainLabel}>
                            <Typography
                                component="div"
                                className={classes.mainLabelText}
                            >
                                {configMapProps.name}
                            </Typography>
                        </Box>
                        <Box className={classes.labelTag}>
                            <OutlinedLabel
                                type="success"
                                label={`map<${typeLabel}>`}
                                shape="square"
                            />
                        </Box>
                        {getDescription(configMapProps.description, classes)}
                    </Box>
                    <Box className={classes.formInputBox}>
                        {mapValues.map((element) => (getConfigElements(element)))}
                    </Box>
                    <div key={configMapProps.id + "-ADD"}>
                        <AddInputButton onAdd={addMapField} />
                    </div>
                </CardContent>
            </Card>
        </Box>
    );
};

function getMapTypeLabel(types: string[]): string {
    let unionType: string = "";
    types.forEach((type, index) => {
        unionType = index === 0 ? unionType.concat(type) : unionType.concat(`|${type}`);
    });
    return unionType;
}

function getMapType(propertiesObj: object): string[] {
    const types: string[] = [];
    const properties = propertiesObj[SchemaConstants.PROPERTIES];
    const anyOf = propertiesObj[SchemaConstants.ANY_OF];
    if (properties) {
        types.push(ConfigType.RECORD);
    } else if (anyOf) {
        anyOf.forEach((value: any) => {
            const type: string = (value.type === ConfigType.OBJECT) ? ConfigType.RECORD : value.type;
            types.push(value);
        });
    } else {
        types.push(propertiesObj[SchemaConstants.TYPE]);
    }
    return types;
}

export default ConfigMap;
