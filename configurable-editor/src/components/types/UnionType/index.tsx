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
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
        value: props.value,
    });
    const returnElement: ReactElement[] = [];
    const { id, isRequired, value, setUnionType, placeholder } = props;

    const setUnionElememt = (elementId: string, elementValue: any) => {
        const newUnionValue: ConfigElementProps = unionValue;
        if (newUnionValue.id === elementId) {
            newUnionValue.value = elementValue;
        }
        setUnionValue(newUnionValue);
    };

    useEffect(() => {
        props.setUnionType(props.id, unionValue);
    }, [unionValue]);

    const textFieldInputProps: TextFieldInputProps = {
        id,
        isRequired,
        placeholder,
        setTextFieldValue: setUnionElememt,
        type: "text",
        value,
    };

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        label: props.label,
        name: props.name,
        required: props.isRequired,
        type: getUnionType(props.schema[SchemaConstants.ANY_OF]),
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
    const unionTypes: string[] = [];
    Object.keys(properties).forEach((key) => {
        unionTypes.push(properties[key].type);
    });
    return unionTypes.join(" | ");
}
