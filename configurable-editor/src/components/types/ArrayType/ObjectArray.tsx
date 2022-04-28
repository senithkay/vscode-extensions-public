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

import { ConfigElementProps } from "../../ConfigElement";
import { AddInputButton } from "../../elements/AddInputButton";
import DeleteButton from "../../elements/DeleteButton";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { SchemaConstants } from "../../model";
import { useStyles } from "../../style";
import { getConfigProperties } from "../../utils";
import ObjectType, { ObjectTypeProps } from "../ObjectType";

import { ArrayTypeProps } from ".";
export interface ObjectArrayProps extends ArrayTypeProps {
    values?: any[];
    setArrayElement?: (id: string, objectArrayValue: any) => void;
}

const ObjectArray = (props: ObjectArrayProps): ReactElement => {
    const classes = useStyles();
    const returnElement: ReactElement[] = [];
    const [arrayValues, setArrayValues] = useState<ConfigElementProps[]>([]);
    const [counter, setCounter] = useState(arrayValues.length + 1);

    const elementSchema: object[] = props.schema[SchemaConstants.ITEMS];

    const element: ConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
    };

    useEffect(() => {
        props.setArrayElement(props.id, element);
        if (props.value) {
            const initialValue: ConfigElementProps[] = [];
            let newCounter = counter;
            Object.keys(props.value).forEach((key) => {
                const objectArrayProps: ObjectArrayProps = {
                    description: props.schema[SchemaConstants.DESCRIPTION],
                    id: props.id + "-" + newCounter,
                    isRequired: false,
                    name: "",
                    properties: getConfigProperties(elementSchema, props.id + "-" + newCounter).properties,
                    schema: elementSchema,
                    type: props.arrayType,
                    value: props.value[key],
                };
                newCounter = newCounter + 1;
                initialValue.push(objectArrayProps);
            });
            setCounter(newCounter);
            setArrayValues(initialValue);
        }
    }, []);

    const addArrayElememt = () => {
        let propertiesValue: ConfigElementProps;
        if (elementSchema[SchemaConstants.PROPERTIES] !== undefined) {
            propertiesValue = getConfigProperties(elementSchema, props.id + "-" + counter);
        }

        const objectArrayProps: ObjectArrayProps = {
            description: props.schema[SchemaConstants.DESCRIPTION],
            id: props.id + "-" + counter,
            isRequired: false,
            name: "",
            properties: propertiesValue.properties,
            schema: elementSchema,
            type: props.arrayType,
        };
        setCounter((prevState) => prevState + 1);
        setArrayValues((prevState) => [...prevState, objectArrayProps]);
    };

    const removeArrayElement = (id: string) => {
        let newArrayValues = [...arrayValues];
        newArrayValues = newArrayValues.filter((arrayElement) => {
            return arrayElement.id !== id;
        });
        setArrayValues(newArrayValues);
    };

    const handleValueChange = (id: string, value: any) => {
        const newArrayValues = [...arrayValues];
        const existingMap = newArrayValues.findIndex(
            (property) => property.id === id,
        );
        if (existingMap > -1) {
            newArrayValues[existingMap] = value;
        }
        setArrayValues(newArrayValues);
    };

    useEffect(() => {
        const newArrayValues: ConfigElementProps[] = [];
        arrayValues.forEach(entry => {
            if (entry.properties !== undefined && entry.properties.length > 0) {
                entry.value = undefined;
            }
            newArrayValues.push(entry);
        });
        element.value = newArrayValues;
        props.setArrayElement(props.id, element);
    }, [arrayValues]);

    arrayValues.forEach((arrayElement) => {
        const objectTypeProps: ObjectTypeProps = {
            ...arrayElement,
            setObjectConfig: handleValueChange,
        };

        returnElement.push(
            (
                <Grid
                    key={arrayElement.id}
                    container={true}
                    spacing={1}
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Grid item={true} xs={11}>
                        <Box key={arrayElement.id + "-ENTRY"}>
                            <ObjectType {...objectTypeProps} />
                        </Box>
                    </Grid>
                    <Grid item={true} xs={1}>
                        <DeleteButton onDelete={removeArrayElement} id={arrayElement.id}/>
                    </Grid>
                </Grid>
            ),
        );
    });

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        name: props.name,
        required: props.isRequired,
        type: "array",
    };

    return (
        <Box className={classes.innerBoxCard}>
            <Card variant="outlined">
                <CardContent className={classes.cardContent}>
                    <FieldLabel {...fieldLabelProps}/>
                    <Box className={classes.formInputBox}>
                        {returnElement}
                    </Box>
                    <div key={props.id + "-ADD"}>
                        <AddInputButton onAdd={addArrayElememt} />
                    </div>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ObjectArray;
