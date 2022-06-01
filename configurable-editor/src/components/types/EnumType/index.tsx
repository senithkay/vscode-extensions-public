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
import React, { ReactElement, useEffect } from "react";

import { ConfigElementProps } from "../../ConfigElement";
import { FieldLabel, FieldLabelProps } from "../../elements/FieldLabel";
import { SelectInput, SelectInputProps } from "../../elements/SelectInput";
import { SchemaConstants } from "../../model";
import { SimpleTypeProps } from "../SimpleType";

/**
 * A high level config property which can contain configurable maps.
 */
export interface EnumTypeProps extends SimpleTypeProps {
    setEnumType?: (id: string, value: ConfigElementProps) => void;
}

export const EnumType = (props: EnumTypeProps): ReactElement => {
    const element: ConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
        value: props.value,
    };

    useEffect(() => {
        props.setEnumType(props.id, element);
    }, []);

    const setEnumValue = (id: string, value: any) => {
        element.value = value;
        props.setEnumType(id, element);
    };

    const fieldLabelProps: FieldLabelProps = {
        description: props.description,
        label: props.label,
        name: props.name,
        required: props.isRequired,
        type: props.type,
    };

    const selectInputProps: SelectInputProps = {
        id: props.id,
        isRequired: props.isRequired,
        setSelectValue: setEnumValue,
        types: props.schema[SchemaConstants.ENUM],
        value: props.value,
    };

    return(
        <div key={props.id + "-FIELD"}>
            <FieldLabel {...fieldLabelProps} />
            <SelectInput {...selectInputProps}/>
        </div>
    );
};

export default EnumType;
