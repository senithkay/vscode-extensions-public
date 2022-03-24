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

import React, { ReactElement, useEffect, useState } from "react";

import { Box, Card, CardContent, Typography } from "@material-ui/core";

import { useStyles } from "./style";
import OutlinedLabel from "./elements/OutlinedLabel";
import { AddInputButton } from "./elements/AddInputButton";
import { getDescription } from "./utils";
import { TextFieldInput } from "./elements/TextFieldInput";
import { ConfigType, SchemaConstants } from "./model";
import { RadioGroupInput } from "./elements/RadioGroupInput";
import { ConfigElementProps } from "./ConfigElement";

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
    id: string
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
        id,
        name,
        isRequired,
        additionalProperties,
        description,
        value
    };
}

export const ConfigMap = (configMapProps: ConfigMapProps): ReactElement => {
    if (configMapProps === undefined) {
        return;
    }

    const [mapValues, setMapValues] = useState<ConfigMapValue[]>([]);
    const classes = useStyles();

    const types: string[] = getMapType(configMapProps.additionalProperties);
    const typeLabel: string = getMapTypeLabel(types);
    if (types.length > 1 || types[0] === ConfigType.RECORD) {
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
            value: "Value"
        };
        setMapValues([...mapValues, mapValue]);
    };

    let removeMapField = (i: number) => {
        let newMapValues = [...mapValues];
        newMapValues.splice(i, 1);
        setMapValues(newMapValues)
    }

    const handleValueChange = (id: string, value: string) => {
        let newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newMapValues[existingMap].value = value;
        }
        setMapValues(newMapValues);
    };

    const handleKeyChange = (id: string, key: string) => {
        let newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newMapValues[existingMap].key = key;
        }
        setMapValues(newMapValues);
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
                        {mapValues.map((element) => (
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
                                            {getMapValueElement(types, configMapProps, handleValueChange)}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Box>
                        ))}
                    </Box>
                    <div key={configMapProps.id + "-ADD"}>
                        <AddInputButton onAdd={addMapField} />
                    </div>
                </CardContent>
            </Card>
        </Box>
    );
};

const getMapValueElement = (
    type: string[],
    configMapProps: ConfigMapProps,
    handleValueChange: (key: string, value: any) => void,
) => {
    const isUnion = type.length > 1;
    if (!isUnion) {
        if (type[0] === ConfigType.RECORD) {
            // TODO: Implement the Record Types
        } else if (type[0] === ConfigType.UNION) {
            // TODO: Implement the Union Types
        } else {
            switch (type[0]) {
                case ConfigType.BOOLEAN:
                    return (
                        <div key={configMapProps.id + "-CHECK"}>
                            <RadioGroupInput
                                id={configMapProps.id}
                                existingValue={configMapProps.value as boolean}
                                isRequired={configMapProps.isRequired}
                                setRadioGroupValue={handleValueChange}
                            />
                        </div>
                    );
                case ConfigType.STRING:
                case ConfigType.INTEGER:
                case ConfigType.NUMBER:
                    return (
                        <div key={configMapProps.id + "-" + configMapProps.id + "-FIELD"}>
                            <TextFieldInput
                                id={configMapProps.id}
                                isRequired={configMapProps.isRequired}
                                existingValue={"Value"}
                                type={type[0]}
                                setTextFieldValue={handleValueChange}
                            />
                        </div>
                    );
            }
        }
    }
};

function getMapTypeLabel(types: string[]): string {
    let unionType: string = "";
    types.forEach((type, index) => {
        if (index === 0) {
            unionType = unionType.concat(type);
        } else {
            unionType = unionType.concat(`|${type}`);
        }
    });
    return unionType;
}

function getMapType(propertiesObj: object): string[] {
    let types: string[] = [];
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
