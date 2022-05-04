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

import ConfigElement, { ConfigElementProps } from "../../ConfigElement";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { RadioGroupInput, RadioGroupInputProps } from "../../elements/RadioGroupInput";
import { SchemaConstants } from "../../model";
import { getType } from "../../utils";
import { SimpleTypeProps } from "../SimpleType";

/**
 * A high level config property which can contain configurable maps.
 */
export interface UnionTypeProps extends SimpleTypeProps {
    value?: string;
    setUnionType?: (id: string, value: ConfigElementProps) => void;
}

export const UnionType = (props: UnionTypeProps): ReactElement => {
    const { description, id, isRequired, label, name, type, value, setUnionType, placeholder } = props;
    const [fieldType, setFieldType] = useState("");
    const [unionValue, setUnionValue] = useState<ConfigElementProps>({
        description,
        id,
        isRequired,
        name,
        type,
        value,
    });

    let fieldElement: ReactElement;

    const types: string[] = getAllTypes(props.schema[SchemaConstants.ANY_OF]);

    const setUnionElememt = (elementId: string, elementValue: any) => {
        const newUnionValue: ConfigElementProps = unionValue;
        if (newUnionValue.id === elementId) {
            newUnionValue.value = elementValue;
        }
        setUnionValue(newUnionValue);
    };

    if (fieldType !== "") {
        const inputFieldProps: ConfigElementProps = {
            id,
            isRequired,
            name: "value",
            placeholder,
            setConfigElement: setUnionElememt,
            type: getType(fieldType),
            value,
        };
        fieldElement = <ConfigElement {...inputFieldProps}/>;
    }

    const setReturnType = (elementId: string, elementType: string) => {
        setFieldType(elementType);
    };

    useEffect(() => {
        setUnionType(props.id, unionValue);
    }, [unionValue]);

    const fieldLabelProps: FieldLabelProps = {
        description,
        label,
        name,
        required: isRequired,
        type: getUnionType(types),
    };

    const radioGroupInputProps: RadioGroupInputProps = {
        id,
        setRadioGroupValue: setReturnType,
        types,
        value: types[0],
    };

    return(
        <div key={id + "-FIELD"}>
            <FieldLabel {...fieldLabelProps} />
            <RadioGroupInput {...radioGroupInputProps}/>
            {fieldElement}
        </div>
    );
};

export default UnionType;

function getUnionType(types: string[]): string {
    return types.join(" | ");
}

function getAllTypes(properties: object[]): string[] {
    const unionTypes: string[] = [];
    Object.keys(properties).forEach((key) => {
        unionTypes.push(properties[key].type);
    });
    return unionTypes;
}
