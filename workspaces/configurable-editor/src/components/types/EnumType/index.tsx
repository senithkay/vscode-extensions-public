/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
                    <Box display="flex" flexDirection="column">
                        <Box mb={0.5}>
                            <FieldLabel {...fieldLabelProps} />
                        </Box>
                        <Box>
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
                 <Box display="flex" flexDirection="column">
                    <Box mb={0.5}>
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
