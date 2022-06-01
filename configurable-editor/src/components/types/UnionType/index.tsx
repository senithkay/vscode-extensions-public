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
    const schema: object[] = props.schema[SchemaConstants.ANY_OF];
    const typeLabels: string[] = getAllTypeLabels(schema);
    const [fieldType, setFieldType] = useState<string>(typeLabels[0]);

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

    let innerElement: ConfigElementProps = getConfigElementProps(schema[0], typeLabels[0], props);

    const setReturnType = (elementId: string, elementType: string) => {
        if (props.id === elementId) {
            const typeName: string = getTypeFromLabel(schema, elementType);
            const innerSchema = getCurrentSchema(schema, typeName);
            innerElement = getConfigElementProps(innerSchema, elementType, props);
            setFieldType(elementType);
        }
    };

    const getFieldElement = (elementType: string): ReactElement => {
        let returnElement: ReactElement = <></>;
        if (schema && typeLabels.length > 0) {
            const innerSchema = getCurrentSchema(schema,  getTypeFromLabel(schema, elementType));
            if (innerSchema) {
                const configElementProps = getConfigElementProps(innerSchema, elementType, innerElement);
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
        type: getUnionType(typeLabels),
    };

    const radioGroupInputProps: RadioGroupInputProps = {
        id: props.id,
        setRadioGroupValue: setReturnType,
        types: typeLabels,
        value: typeLabels[0],
    };

    return(
        <div key={props.id + "-FIELD"}>
            <FieldLabel {...fieldLabelProps} />
            <RadioGroupInput {...radioGroupInputProps}/>
            <Box>
                {getFieldElement(fieldType)}
            </Box>
        </div>
    );
};

export default UnionType;

function getCurrentSchema(schema: object[], type: string): object {
    let currentSchema: object;
    Object.keys(schema).forEach((key) => {
        if (schema[key].type !== undefined && schema[key].type === type) {
            currentSchema = schema[key];
        }
    });
    return currentSchema;
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
