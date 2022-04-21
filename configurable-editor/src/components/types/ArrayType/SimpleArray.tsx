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
import { ConfigValue } from "../../model";
import { useStyles } from "../../style";
import SimpleType, { SimpleTypeProps } from "../SimpleType";

import { ArrayTypeProps } from ".";

/**
 * The leaf level configurable type representing boolean values.
 */
export interface SimpleArrayProps extends ArrayTypeProps {
    setArrayElement?: (id: string, simpleArrayValue: any) => void;
}

const SimpleArray = (props: SimpleArrayProps): ReactElement => {
    const classes = useStyles();
    const returnElement: ReactElement[] = [];
    const [arrayValues, setArrayValues] = useState<ConfigValue[]>(getInitialValues(props.value, props.id));
    const [counter, setCounter] = useState(arrayValues.length + 1);

    const element: ConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
        value: props.value,
    };

    const addArrayElememt = () => {
        const configValue: ConfigValue = {
            key: props.id + "-" + counter,
            value: undefined,
        };
        setCounter((prevState) => prevState + 1);
        setArrayValues((prevState) => [...prevState, configValue]);
    };

    const removeArrayElement = (id: string) => {
        let newSimpleArray = [...arrayValues];
        newSimpleArray = newSimpleArray.filter((arrayElement) => {
            return arrayElement.key !== id;
        });
        setArrayValues(newSimpleArray);
    };

    const handleValueChange = (id: string, value: any) => {
        const newArrayValues = [...arrayValues];
        const existingMap = newArrayValues.findIndex(
            (property) => property.key === id,
        );
        if (existingMap > -1) {
            newArrayValues[existingMap].value = value.value;
        }
        setArrayValues(newArrayValues);
    };

    useEffect(() => {
        const values: any[] = [];
        arrayValues.forEach((entry) => {
            values.push(entry.value);
        });
        element.value = values;
        props.setArrayElement(props.id, element);
    }, [arrayValues]);

    arrayValues.forEach((arrayElement) => {
        const simpleTypeProps: SimpleTypeProps = {
            ...props,
            id: arrayElement.key,
            setSimpleConfig: handleValueChange,
            type: props.arrayType,
            value: arrayElement.value,
        };
        returnElement.push(
            (
                <Grid
                    key={arrayElement.key}
                    container={true}
                    spacing={1}
                    direction="row"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Grid item={true} xs={11}>
                        <Box>
                            <SimpleType {...simpleTypeProps} />
                        </Box>
                    </Grid>
                    <Grid item={true} xs={1}>
                        <DeleteButton onDelete={removeArrayElement} id={arrayElement.key}/>
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

export default SimpleArray;

function getInitialValues(values: any[], id: string): ConfigValue[] {
    const arrayValues: ConfigValue[] = [];
    if (values) {
        values.forEach((element, index) => {
            arrayValues.push({
                key: id + "-" + (index + 1),
                value: element,
            });
        });
    }
    return arrayValues;
}
