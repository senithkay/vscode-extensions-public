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

import React, { ReactElement, useContext, useEffect, useState } from "react";

import { Box, Card, CardContent, Collapse, IconButton, Tooltip } from "@material-ui/core";

import { DocIcon } from "../../../assets";
import ConfigElement, { ConfigElementProps } from "../../ConfigElement";
import { docLink } from "../../ConfigForm";
import ExpandMore from "../../elements/ExpandMore";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { ConfigType, SchemaConstants } from "../../model";
import { useStyles } from "../../style";
import { getRecordName } from "../../utils";
import { ObjectTypeProps } from "../ObjectType";
/**
 * A high level config property which can contain nested objects.
 */
export interface RecordTypeProps extends ObjectTypeProps {
    setConfigRecord?: (id: string, configValue: any) => void;
}

export const RecordType = (props: RecordTypeProps) => {
    const classes = useStyles();
    const connectionConfigs = props.connectionConfig;
    const { fullRecordName, shortenedRecordName } = getRecordName(props.schema[SchemaConstants.NAME]);
    const [recordValue, setRecordValue] =
        useState<ConfigElementProps>(getObjectElement(props, fullRecordName, connectionConfigs));
    const [expanded, setExpanded] = useState(true);
    const returnElement: ReactElement[] = [];

    useEffect(() => {
        setRecordValue(getObjectElement(props, fullRecordName, connectionConfigs));
    }, [props.unionId]);

    useEffect(() => {
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
            connectionConfig: props.connectionConfig,
            isRequired: props.isRequired ? property.isRequired : false,
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
        shortenedType: shortenedRecordName ? shortenedRecordName : ConfigType.MODULE,
        type: fullRecordName ? fullRecordName : ConfigType.MODULE,
    };

    const openTriggerDocs = () => {
        window.open(docLink);
    };

    const triggerDocIconButton = (
        props.name === SchemaConstants.CONFIG ? (
            <Tooltip title={"View Documentation"}>
                <Box className={classes.docIcon}>
                    <IconButton onClick={openTriggerDocs}><img src={DocIcon} /></IconButton>
                </Box>
            </Tooltip>
        ) : null
    );

    return (
        <Box className={classes.innerBoxCard}>
            <Card variant="outlined">
                <Box>
                    <Box className={classes.valueInnerBoxHead}>
                        <FieldLabel {...fieldLabelProps} />
                        {docLink && triggerDocIconButton}
                        <ExpandMore
                            expand={expanded}
                            onClick={handleExpandClick}
                        />
                    </Box>
                    <Collapse in={expanded} timeout="auto" unmountOnExit={false}>
                        <Box p={2} borderTop="1px solid #E0E2E9">
                            {returnElement}
                        </Box>
                    </Collapse>
                </Box>
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

function getObjectElement(configObject: ConfigElementProps, recordName: string,
                          connectionConfigs: any): ConfigElementProps {
    const nestedProperties: ConfigElementProps[] = getNestedElements(configObject.properties, connectionConfigs);
    return {
        connectionConfig: connectionConfigs,
        description: configObject.description,
        id: configObject.id,
        isFeaturePreview: configObject.isFeaturePreview,
        isInsideArray: false,
        isLowCode: configObject.isLowCode,
        isRequired: configObject.isRequired,
        name: configObject.name,
        properties: nestedProperties,
        schema: configObject.schema,
        type: recordName ? configObject.type : ConfigType.MODULE,
    };
}

function getNestedElements(nestedObjects: ConfigElementProps[], connectionConfigs: any): ConfigElementProps[] {
    if (nestedObjects === undefined) {
        return;
    }

    const properties: ConfigElementProps[] = [];
    nestedObjects.forEach((property) => {
        const nestedProperties: ConfigElementProps[] = getNestedElements(property.properties, connectionConfigs);
        properties.push({
            connectionConfig: connectionConfigs,
            description: property.description,
            id: property.id,
            isFeaturePreview: property.isFeaturePreview,
            isInsideArray: false,
            isLowCode: property.isLowCode,
            isRequired: property.isRequired,
            name: property.name,
            properties: nestedProperties,
            schema: property.schema,
            type: property.type,
            value: property.value,
            valueRef: property.valueRef,
        });
    });
    return properties;
}
