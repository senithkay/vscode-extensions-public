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
import { ConfigElementProps } from "./ConfigElement";
import { ConfigObjectProps } from "./ConfigObject";
import OutlinedLabel from "./elements/OutlinedLabel";
import { AddInputButton } from "./elements/AddInputButton";
import { getDescription } from "./utils";
import { TextFieldInput } from "./elements/TextFieldInput";

/**
 * A high level config property which can contain configurable maps.
 */
export interface ConfigMapProps {
    id: string;
    name: string;
    isRequired: boolean;
    additionalProperties: object;
    properties?: Array<ConfigElementProps | ConfigObjectProps>;
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
    properties?: Array<ConfigElementProps | ConfigObjectProps>,
    description?: string,
    value?: any,
): ConfigMapProps {
    return {
        id,
        name,
        isRequired,
        additionalProperties,
        properties,
        description,
        value
    };
}

export const ConfigMap = (configMapProps: ConfigMapProps): ReactElement => {
    const type: string = "string";
    if (configMapProps === undefined) {
        return;
    }

    const [mapValues, setMapValues] = useState<ConfigMapValue[]>([]);
    const classes = useStyles();
    console.log(configMapProps);
    // configMapProps.properties.forEach((entry) => {
    //     entry.setConfigElement = configMapProps.setConfigElement;
    // });

    const addMapField = () => {
        console.log(mapValues);
        const mapValue: ConfigMapValue = {
            id: configMapProps.id + "-" + (mapValues.length + 1),
            key: "Key",
            value: "Value"
        };
        setMapValues([...mapValues, mapValue]);
        console.log(mapValues);
    };

    let removeMapField = (i: number) => {
        let newMapValues = [...mapValues];
        newMapValues.splice(i, 1);
        setMapValues(newMapValues)
    }

    const handleValueChange = () => {
        // setMapValues((prevValues) => {
        //     return new Map(prevValues).set(null, null);
        // });
    };

    const getMapField = (
        configMapProps: ConfigMapProps[],
        handleValueChange: (key: string, value: any) => void,
    ) => {
        {
            configMapProps.map((element, index) => (
                <div className="form-inline" key={index}>
                    <label>{element}</label>
                </div>
            ))
        }
    }

    useEffect(() => {
        if (configMapProps.value !== undefined) {
            const mapValue: ConfigMapValue = {
                id: configMapProps.id + "-" + mapValues.length + 1,
                key: "",
                value: ""
            };
            // const existingValue = mapValues.(x => x.id === mapValue.id);
            // const newMapArray = mapValues
            // setMapValues(mapValues.);
        }
    }, []);

    // useEffect(() => {
    //     const configValue = { key: configElement.id, value: values };
    //     configElement.setConfigElement(configValue);
    // }, [mapValues]);

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
                                label="map"
                                shape="square"
                            />
                        </Box>
                        {getDescription(configMapProps.description, classes)}
                    </Box>
                    <Box className={classes.formInputBox}>
                        {mapValues.map((element, index) => (
                            <Box key={element.id} className={classes.innerBoxCard}>
                                <Card variant="outlined">
                                    <CardContent className={classes.cardContent}>
                                        <Box key={element.id + "-ENTRY"}>
                                            <TextFieldInput
                                                id={element.id + "-" + index + "-KEY"}
                                                isRequired={true}
                                                existingValue={element.key}
                                                type={type}
                                                setTextFieldValue={handleValueChange}
                                            />
                                            {' '}
                                            <TextFieldInput
                                                id={element.id + "-" + index + "-VALUE"}
                                                isRequired={true}
                                                existingValue={element.value}
                                                type={type}
                                                setTextFieldValue={handleValueChange}
                                            />
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

export default ConfigMap;
