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

import { Box, Card, CardContent, Grid } from "@material-ui/core";
import React, { ReactElement, useEffect, useState } from "react";
import { ArrayTypeProps } from ".";
import { ConfigElementProps } from "../../ConfigElement";
import { AddInputButton } from "../../elements/AddInputButton";
import DeleteButton from "../../elements/DeleteButton";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { SchemaConstants } from "../../model";
import { useStyles } from "../../style";
import { getConfigProperties } from "../../utils";
import ObjectType, { ObjectTypeProps } from "../ObjectType";

export interface ObjectArrayProps extends ArrayTypeProps {
    values?: any[],
    setArrayElement?: (id: string, objectArrayValue: any) => void;
}

const ObjectArray = (props: ObjectArrayProps): ReactElement => {
    const classes = useStyles();
    const returnElement: ReactElement[] = [];
    const [arrayValues, setArrayValues] = useState<ConfigElementProps[]>([]);
    const [counter, setCounter] = useState(arrayValues.length + 1);

    const elementSchema: object[] = props.schema[SchemaConstants.ITEMS];

    const element: ConfigElementProps = {
        id: props.id,
        name: props.name,
        isRequired: props.isRequired,
        description: props.description,
        type: props.type,
        value: props.value,
    };

    const addArrayElememt = () => {
        let propertiesValue: ConfigElementProps = undefined;
        if (elementSchema[SchemaConstants.PROPERTIES] !== undefined) {
            propertiesValue = getConfigProperties(elementSchema, props.id + "-" + counter);
        }

        const objectArrayProps: ObjectArrayProps = {
            id: props.id + "-" + counter,
            isRequired: false,
            type: props.arrayType,
            schema: elementSchema,
            properties: propertiesValue.properties,
            description: props.schema[SchemaConstants.DESCRIPTION],
            name: ""
        };
        setCounter(prevState => prevState + 1);
        setArrayValues(prevState => [...prevState, objectArrayProps]);
    };

    const removeArrayElement = (id: string) => {
        let newArrayValues = [...arrayValues];
        newArrayValues = newArrayValues.filter((element) => {
            return element.id !== id;
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
        element.value = arrayValues;
        props.setArrayElement(props.id, element);
    }, [arrayValues]);

    arrayValues.forEach((element) => {
        const objectTypeProps: ObjectTypeProps = {
            ...element,
            setObjectConfig: handleValueChange,
        };

        returnElement.push(
            <Grid key={element.id} container spacing={1} direction="row" alignItems="center" justifyContent="center">
                <Grid item xs={11}>
                    <Box key={element.id + "-ENTRY"}>
                        <ObjectType {...objectTypeProps} />
                    </Box>
                </Grid>
                <Grid item xs={1}>
                    <DeleteButton onDelete={removeArrayElement} id={element.id}/>
                </Grid>
            </Grid>
        );
    });

    const fieldLabelProps: FieldLabelProps = {
        name: props.name,
        type: "array",
        description: props.description,
    };

    return (
        <Box className={classes.innerBoxCard}>
            <Card variant="outlined">
                <CardContent className={classes.cardContent}>
                    <FieldLabel {...fieldLabelProps} />
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
