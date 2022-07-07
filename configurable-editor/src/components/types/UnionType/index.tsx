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

import { Box } from "@material-ui/core";

import ConfigElement, { ConfigElementProps } from "../../ConfigElement";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { RadioGroupInput, RadioGroupInputProps } from "../../elements/RadioGroupInput";
import { SchemaConstants } from "../../model";
import { getConfigProperties, getRecordName, getType } from "../../utils";
import { SimpleTypeProps } from "../SimpleType";

/**
 * A high level config property which can contain configurable maps.
 */
export interface UnionTypeProps extends SimpleTypeProps {
    value?: string;
    setUnionType?: (id: string, value: ConfigElementProps) => void;
}

export const UnionType = (props: UnionTypeProps): ReactElement => {
    const defaultFieldId: string = props.id + "-" + 1;
    const [fieldId, setFieldId] = useState<string>(defaultFieldId);

    const schema: object[] = props.schema[SchemaConstants.ANY_OF];
    const schemaProperties: object[] = getSchemaProperties(schema, props.id);
    const typeMap = getTypeMap(schema, props.id);

    const unionValue: ConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        schema: props.schema,
        type: props.type,
        value: props.value,
    };

    const setUnionElememt = (elementId: string, elementValue: any) => {
        if (unionValue.id === elementId) {
            unionValue.value = elementValue;
            props.setUnionType(props.id, unionValue);
        }
    };

    const getConfigElementProps = (property: object, type: string, element: ConfigElementProps): ConfigElementProps => {
        const configProperty = property[SchemaConstants.PROPERTIES];
        let configProperties: ConfigElementProps[];
        if (configProperty) {
            configProperties = getConfigProperties(property, props.id).properties;
        }
        const configElementProps: ConfigElementProps = {
            description: element.description,
            id: element.id,
            isRequired: element.isRequired,
            name: element.name,
            properties: configProperties,
            schema: property,
            setConfigElement: setUnionElememt,
            type: getType(getTypeFromLabel([property], type)),
            value: element.value,
        };
        return configElementProps;
    };

    let innerElement: ConfigElementProps = getConfigElementProps(schema[0], typeMap.get(defaultFieldId), props);

    const setReturnType = (parentId: string, elementId: string) => {
        if (props.id === parentId) {
            const hasPropperty: boolean = schemaProperties.some((obj) => obj[SchemaConstants.ID] === elementId);
            if (hasPropperty) {
                const innerSchema = schemaProperties.filter((obj) => {
                    return obj[SchemaConstants.ID] === elementId;
                });
                innerElement = getConfigElementProps(innerSchema[0], elementId, props);
                setFieldId(elementId);
            }
        }
    };

    const getFieldElement = (): ReactElement => {
        let returnElement: ReactElement = <></>;
        if (schema && fieldId) {
            const elementType = typeMap.get(fieldId);
            const innerSchema: object = schemaProperties.filter((obj) => {
                return obj[SchemaConstants.ID] === fieldId;
            });
            innerElement = getConfigElementProps(innerSchema[0], fieldId, props);
            if (innerSchema) {
                const configElementProps = getConfigElementProps(innerSchema[0], elementType, innerElement);
                configElementProps.unionId = fieldId;
                returnElement = <ConfigElement {...configElementProps}/>;
            }
        }
        return returnElement;
    };

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        label: props.label,
        name: props.name,
        required: props.isRequired,
        type: getUnionType(Array.from(typeMap.values())),
    };

    const radioGroupInputProps: RadioGroupInputProps = {
        id: props.id,
        setRadioGroupValue: setReturnType,
        types: typeMap,
        value: defaultFieldId,
    };

    return(
        <div key={props.id + "-FIELD"}>
            <FieldLabel {...fieldLabelProps} />
            <RadioGroupInput {...radioGroupInputProps}/>
            <Box>
                {getFieldElement}
            </Box>
        </div>
    );
};

export default UnionType;

function getSchemaProperties(schema: object[], id: string): object[] {
    const currentSchema: object[] = [];
    let count: number = 1;
    Object.keys(schema).forEach((key) => {
        const property = schema[key];
        property.id = id + "-" + count;
        count = count + 1;
        currentSchema.push(property);
    });
    return currentSchema;
}

function getTypeMap(properties: object[], id: string) {
    const typeMap = new Map<string, string>();
    if (properties === undefined) {
        return typeMap;
    }
    Object.keys(properties).forEach((key, index) => {
        const name: string = getRecordName(properties[key].name);
        typeMap.set(id + "-" + (index + 1), name ? name : properties[key].type);
    });
    return typeMap;
}

function getTypeFromLabel(schema: object[], name: string): string {
    let type: string = name;
    Object.keys(schema).forEach((key) => {
        const recordName: string = schema[key].name;
        if (recordName !== undefined && recordName.includes(name)) {
            type = schema[key].type;
        }
    });
    return type;
}

function getUnionType(types: string[]): string {
    return types.join(" | ");
}

function getAllTypeLabels(properties: object[]): string[] {
    const unionTypes: string[] = [];
    if (properties === undefined) {
        return unionTypes;
    }
    Object.keys(properties).forEach((key) => {
        const name: string = getRecordName(properties[key].name);
        unionTypes.push(name ? name : properties[key].type);
    });
    return unionTypes;
}
