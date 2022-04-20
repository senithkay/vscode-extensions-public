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
import { ConfigElementProps } from "../../ConfigElement";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";

import { TextFieldInput, TextFieldInputProps } from "../../elements/TextFieldInput";
import { SchemaConstants } from "../../model";
import { SimpleTypeProps } from "../SimpleType";

/**
 * A high level config property which can contain configurable maps.
 */
export interface UnionTypeProps extends SimpleTypeProps {
    value?: string;
    setUnionType?: (id: string, value: ConfigElementProps) => void;
}

export const UnionType = (props: UnionTypeProps): ReactElement => {
    const [unionValue, setUnionValue] = useState<ConfigElementProps>({
        id: props.id,
        name: props.name,
        isRequired: props.isRequired,
        description: props.description,
        type: props.type,
        value: props.value,
    });
    const returnElement: ReactElement[] = [];
    const { id, isRequired, value, setUnionType, placeholder } = props;

    const setUnionElememt = (id: string, value: any) => {
        const newUnionValue: ConfigElementProps = unionValue;
        if (newUnionValue.id === id) {
            newUnionValue.value = value;
        }
        setUnionValue(newUnionValue);
    };

    useEffect(() => {
        props.setUnionType(props.id, unionValue);
    }, [unionValue]);

    const textFieldInputProps: TextFieldInputProps = {
        id,
        isRequired: isRequired,
        value: value,
        type: "text",
        setTextFieldValue: setUnionElememt,
        placeholder: placeholder
    };

    const fieldLabelProps: FieldLabelProps = {
        name: props.name,
        type: getUnionType(props.schema[SchemaConstants.ANY_OF]),
        label: props.label,
        description: props.description,
        required: props.isRequired,
    };

    returnElement.push(
        (
            <div key={id + "-FIELD"}>
                <FieldLabel {...fieldLabelProps} />
                <TextFieldInput {...textFieldInputProps} />
            </div>
        ),
    );

    return <>{returnElement}</>;
};

export default UnionType;

function getUnionType(properties: object[]): string {
    let unionTypes: string[] = [];
    Object.keys(properties).forEach((key) => {
        unionTypes.push(properties[key].type);
    });
    return unionTypes.join(" | ");
};
