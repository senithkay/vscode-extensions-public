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

import { Box, Card, CardContent, Collapse } from "@material-ui/core";

import ConfigElement, { ConfigElementProps } from "../../ConfigElement";
import ExpandMore from "../../elements/ExpandMore";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { ConfigType } from "../../model";
import { useStyles } from "../../style";
import { ObjectTypeProps } from "../ObjectType";

/**
 * A high level config property which can contain nested objects.
 */
export interface RecordTypeProps extends ObjectTypeProps {
    setConfigRecord?: (id: string, configValue: any) => void;
}

export const RecordType = (props: RecordTypeProps) => {
    const classes = useStyles();
    const [recordValue, setRecordValue] = useState<ConfigElementProps>(getObjectElement(props));
    const [expanded, setExpanded] = useState(true);
    const returnElement: ReactElement[] = [];

    useEffect(() => {
        props.setConfigRecord(props.id, getObjectElement(props));
        setExpanded(props.isRequired);
    }, []);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const handleValueChange = (id: string, value: any) => {
        let newRecordValue = recordValue;
        newRecordValue = updateRecordValue(newRecordValue, id, value);
        setRecordValue(newRecordValue);
        props.setConfigRecord(props.id, newRecordValue);
    };

    Object.keys(recordValue.properties).forEach((key, index) => {
        const property = recordValue.properties[key];
        const configElementProps: ConfigElementProps = {
            ...property,
            setConfigElement: handleValueChange,
        };

        returnElement.push(
            (
                <div key={props.id + "-" + index}>
                    <ConfigElement {...configElementProps} />
                </div>
            ),
        );
    });

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        label: props.label,
        name: props.name,
        required: props.isRequired,
        type: ConfigType.RECORD,
    };

    return (
        <Box className={classes.innerBoxCard}>
            <Card variant="outlined">
                <CardContent className={classes.cardContent}>
                    <Box className={classes.innerBoxHead}>
                        <FieldLabel {...fieldLabelProps} />
                        <ExpandMore
                            expand={expanded}
                            onClick={handleExpandClick}
                        />
                    </Box>
                    <Collapse in={expanded} timeout="auto" unmountOnExit={true}>
                        {returnElement}
                    </Collapse>
                </CardContent>
            </Card>
        </Box>
    );
};

export default RecordType;

function updateRecordValue(recordObject: ConfigElementProps, id: string, value: any): ConfigElementProps {
    if (recordObject.properties !== undefined) {
        const key = recordObject.properties.findIndex(((item) => item.id === id));
        if (key > -1) {
            recordObject.properties[key] = value;
        } else {
            Object.keys(recordObject.properties).forEach((propertyKey) => {
                const property: ConfigElementProps = recordObject.properties[propertyKey];
                recordObject.properties[propertyKey] = updateRecordValue(property, id, value);
            });
        }
    } else if (recordObject.id === id) {
        recordObject = value;
    }
    return recordObject;
}

function getObjectElement(configObject: ConfigElementProps): ConfigElementProps {
    return {
        description: configObject.description,
        id: configObject.id,
        isRequired: configObject.isRequired,
        name: configObject.name,
        properties: getNestedElements(configObject.properties),
        schema: configObject.schema,
        type: configObject.type,
    };
}

function getNestedElements(nestedObjects: ConfigElementProps[]): ConfigElementProps[] {
    if (nestedObjects === undefined) {
        return;
    }

    const properties: ConfigElementProps[] = [];
    nestedObjects.forEach((property) => {
        properties.push({
            description: property.description,
            id: property.id,
            isRequired: property.isRequired,
            name: property.name,
            properties: getNestedElements(property.properties),
            schema: property.schema,
            type: property.type,
            value: property.value,
        });
    });
    return properties;
}
