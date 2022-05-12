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

import { Box, Card, CardContent, Grid } from "@material-ui/core";

import ConfigElement, { ConfigElementProps } from "../../ConfigElement";
import { AddInputButton } from "../../elements/AddInputButton";
import DeleteButton from "../../elements/DeleteButton";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { TextFieldInput } from "../../elements/TextFieldInput";
import { ConfigType, SchemaConstants } from "../../model";
import { useStyles } from "../../style";
import { getConfigProperties } from "../../utils";
import { ObjectTypeProps } from "../ObjectType";

/**
 * A high level config property which can contain configurable maps.
 */
export interface MapTypeProps extends ObjectTypeProps {
    setConfigMap: (id: string, mapValue: any) => void;
}

export const MapType = (props: MapTypeProps): ReactElement => {
    const [mapValues, setMapValues] = useState<ConfigElementProps[]>([]);
    const [counter, setCounter] = useState(1);
    const classes = useStyles();

    const elementSchema: object[] = props.schema[SchemaConstants.ADDITIONAL_PROPERTIES];
    let propertyType = elementSchema[SchemaConstants.TYPE];

    let propertiesValue: ConfigElementProps[];
    if (elementSchema[SchemaConstants.PROPERTIES] !== undefined) {
        propertiesValue = getConfigProperties(elementSchema, props.id + "-" + counter).properties;
    } else if (elementSchema[SchemaConstants.ANY_OF] !== undefined) {
        propertyType = ConfigType.ANY_OF;
    }

    const element: ConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        properties: [],
        schema: props.schema,
        type: props.type,
        value: props.value,
    };

    useEffect(() => {
        props.setConfigMap(props.id, element);
        if (props.value) {
            const initialValue: ConfigElementProps[] = [];
            let newCounter = counter;
            Object.keys(props.value).forEach((key) => {
                const configElementProps: ConfigElementProps = {
                    description: elementSchema[SchemaConstants.DESCRIPTION],
                    id: props.id + "-" + newCounter,
                    isRequired: false,
                    label: "value",
                    name: key,
                    properties: propertiesValue,
                    schema: elementSchema,
                    type: propertyType,
                    value: props.value[key],
                };
                newCounter = newCounter + 1;
                initialValue.push(configElementProps);
            });
            setCounter(newCounter);
            setMapValues(initialValue);
        }
    }, []);

    const addMapField = () => {
        const configElementProps: ConfigElementProps = {
            description: elementSchema[SchemaConstants.DESCRIPTION],
            id: props.id + "-" + counter,
            isRequired: false,
            label: "value",
            name: "",
            properties: propertiesValue,
            schema: props.schema,
            type: propertyType,
        };
        setCounter((prevState) => prevState + 1);
        setMapValues([...mapValues, configElementProps]);
    };

    const removeMapField = (id: string) => {
        let newMapValues = [...mapValues];
        newMapValues = newMapValues.filter((entry) => {
            return entry.id !== id;
        });
        setMapValues(newMapValues);
    };

    const handleValueChange = (id: string, value: any) => {
        const newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            if (newMapValues[existingMap].properties !== undefined) {
                value.name = newMapValues[existingMap].name;
                value.label = "value";
                newMapValues[existingMap] = value;
            } else {
                newMapValues[existingMap].value = value.value;
            }
        }
        setMapValues(newMapValues);
    };

    const handleKeyChange = (id: string, value: string) => {
        const newMapValues = [...mapValues];
        const existingMap = newMapValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newMapValues[existingMap].name = value;
        }
        setMapValues(newMapValues);
    };

    useEffect(() => {
        if (mapValues.length > 0) {
            const newMapValues = [...mapValues];
            newMapValues.forEach((entry) => {
                const configProperty: ConfigElementProps = {
                    description: entry.description,
                    id: entry.id,
                    isRequired: entry.isRequired,
                    name: entry.name,
                    properties: entry.properties,
                    type: entry.type,
                    value: entry.properties ? undefined : entry.value,
                };
                const existingMap = element.properties.findIndex(
                    (property) => property.id === entry.id,
                );
                if (existingMap > -1) {
                    element.properties[existingMap] = configProperty;
                } else {
                    element.properties.push(configProperty);
                }
            });
            element.value = undefined;
            props.setConfigMap(props.id, element);
        }
    }, [mapValues]);

    const getConfigElements = (configElement: ConfigElementProps) => {
        configElement.setConfigElement = handleValueChange;
        return(
            <Box key={configElement.id} className={classes.innerBoxCard}>
                <Card variant="outlined">
                    <CardContent className={classes.cardContent}>
                        <Grid container={true} spacing={1} direction="row" alignItems="center" justifyContent="center">
                            <Grid item={true} xs={11}>
                                <Box key={configElement.id + "-ENTRY"}>
                                    <TextFieldInput
                                        id={configElement.id}
                                        isRequired={true}
                                        value={configElement.name}
                                        placeholder="key"
                                        type="string"
                                        setTextFieldValue={handleKeyChange}
                                    />
                                    <ConfigElement {...configElement}/>
                                </Box>
                            </Grid>
                            <Grid item={true} xs={1}>
                                <DeleteButton onDelete={removeMapField} id={configElement.id}/>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        label: props.label,
        name: props.name,
        required: props.isRequired,
        type: "map",
    };

    return (
        <Box className={classes.innerBoxCard}>
            <Card variant="outlined">
                <CardContent className={classes.cardContent}>
                    <FieldLabel {...fieldLabelProps} />
                    <Box className={classes.formInputBox}>
                        {mapValues.map(getConfigElements)}
                    </Box>
                    <div key={props.id + "-ADD"}>
                        <AddInputButton onAdd={addMapField} />
                    </div>
                </CardContent>
            </Card>
        </Box>
    );
};

export default MapType;
