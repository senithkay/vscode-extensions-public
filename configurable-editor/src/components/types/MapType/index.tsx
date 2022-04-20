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

import { AddInputButton } from "../../elements/AddInputButton";
import { TextFieldInput } from "../../elements/TextFieldInput";
import { ConfigType, SchemaConstants } from "../../model";
import { useStyles } from "../../style";
import { ObjectTypeProps } from "../ObjectType";
import ConfigElement, { ConfigElementProps } from "../../ConfigElement";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { getConfigProperties } from "../../utils";
import DeleteButton from "../../elements/DeleteButton";

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

    let propertiesValue: ConfigElementProps[] = undefined;
    if (elementSchema[SchemaConstants.PROPERTIES] !== undefined) {
        propertiesValue = getConfigProperties(elementSchema, props.id + "-" + counter).properties;
    } else if (elementSchema[SchemaConstants.ANY_OF] !== undefined) {
        propertyType = ConfigType.ANY_OF;
    }

    const element: ConfigElementProps = {
        id: props.id,
        name: props.name,
        isRequired: props.isRequired,
        description: props.description,
        type: props.type,
        value: props.value,
        schema: elementSchema,
        properties: [],
    };

    useEffect(() => {
        props.setConfigMap(props.id, element);
    }, []);

    const addMapField = () => {
        const configElementProps: ConfigElementProps = {
            id: props.id + "-" + counter,
            name: "",
            label: "value",
            isRequired: false,
            type: propertyType,
            schema: elementSchema,
            properties: propertiesValue,
            description: elementSchema[SchemaConstants.DESCRIPTION],
        };
        setCounter(prevState => prevState + 1);
        setMapValues([...mapValues, configElementProps]);
    };

    const removeMapField = (id: string) => {
        let newMapValues = [...mapValues];
        newMapValues = newMapValues.filter((element) => {
            return element.id !== id;
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
                value.label = "";
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
            newMapValues.forEach(entry => {
                const configProperty: ConfigElementProps = {
                    id: entry.id,
                    name: entry.name,
                    isRequired: entry.isRequired,
                    type: entry.type,
                    properties: entry.properties,
                    description: entry.description,
                    value: entry.value,
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
            props.setConfigMap(props.id, element);
        }
    }, [mapValues]);

    const getConfigElements = (element: ConfigElementProps) => {
        element.setConfigElement = handleValueChange;
        return(
            <Box key={element.id} className={classes.innerBoxCard}>
                <Card variant="outlined">
                    <CardContent className={classes.cardContent}>
                        <Grid container spacing={1} direction="row" alignItems="center" justifyContent="center">
                            <Grid item xs={11}>
                                <Box key={element.id + "-ENTRY"}>
                                    <TextFieldInput
                                        id={element.id}
                                        isRequired={true}
                                        value={element.value}
                                        placeholder="key"
                                        type="string"
                                        setTextFieldValue={handleKeyChange}
                                    />
                                    <ConfigElement {...element}/>
                                </Box>
                            </Grid>
                            <Grid item xs={1}>
                                <DeleteButton onDelete={removeMapField} id={element.id}/>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        );
    };

    const fieldLabelProps: FieldLabelProps = {
        name: props.name,
        label: props.label,
        type: "map",
        description: props.description,
        required: props.isRequired,
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
