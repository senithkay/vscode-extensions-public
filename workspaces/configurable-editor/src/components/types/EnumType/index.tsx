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

import Box from "@material-ui/core/Box";

import { ConfigElementProps } from "../../ConfigElement";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { SelectInput, SelectInputProps } from "../../elements/SelectInput";
import { TextFieldInput, TextFieldInputProps } from "../../elements/TextFieldInput";
import { SchemaConstants } from "../../model";
import { SimpleTypeProps } from "../SimpleType";

/**
 * A high level config property which can contain configurable maps.
 */
export interface EnumTypeProps extends SimpleTypeProps {
    setEnumType?: (id: string, value: ConfigElementProps) => void;
}

export const EnumType = (props: EnumTypeProps): ReactElement => {
    const [inputValue, setInputValue] = useState(String(props.value ? props.value : ""));

    const element: ConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
        value: props.value,
    };

    useEffect(() => {
        element.value = inputValue;
        props.setEnumType(props.id, element);
    }, [inputValue]);

    const setEnumValue = (id: string, value: any) => {
        if (id === props.id && value) {
            setInputValue(value);
        }
    };

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        label: props.label,
        name: props.name,
        required: props.isRequired,
        shortenedType: props.type,
        type: props.type,
    };

    if (props.schema) {
        let enumType = [];
        enumType = props.schema[SchemaConstants.ENUM];
        if (enumType) {
            const selectInputProps: SelectInputProps = {
                id: props.id,
                isRequired: props.isRequired,
                setSelectValue: setEnumValue,
                types: enumType,
                value: inputValue,
            };

            return(
                <div key={props.id + "-FIELD"}>
                    <Box display="flex" alignItems="center">
                        <Box flex="0 0 150px">
                            <FieldLabel {...fieldLabelProps} />
                        </Box>
                        <Box
                            flexGrow={1}
                        >
                            <SelectInput {...selectInputProps}/>
                        </Box>
                    </Box>
                </div>
            );
        }
    } else {
        const textFieldInputProps: TextFieldInputProps = {
            id: props.id,
            isRequired: props.isRequired,
            placeholder: props.placeholder,
            setTextFieldValue: setEnumValue,
            type: "text",
            value: inputValue,
        };

        return(
            <div key={props.id + "-FIELD"}>
                 <Box display="flex" alignItems="center">
                    <Box flex="0 0 150px">
                        <FieldLabel {...fieldLabelProps} />
                    </Box>
                    <Box flexGrow={1}>
                        <TextFieldInput {...textFieldInputProps}/>
                    </Box>
                </Box>
            </div>
        );
    }
};

export default EnumType;
