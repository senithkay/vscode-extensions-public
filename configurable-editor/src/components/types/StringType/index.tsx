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

import React, { ReactElement } from "react";

import { TextFieldInput, TextFieldInputProps } from "../../elements/TextFieldInput";
import { SimpleTypeProps } from "../SimpleType";

/**
 * The leaf level configurable type representing string values.
 */
export interface StringTypeProps extends SimpleTypeProps {
    value?: string;
    setStringType: (id: string, stringValue: string) => void;
}

const StringType = (props: StringTypeProps): ReactElement => {
    const returnElement: ReactElement[] = [];
    const { id, isRequired, value, setStringType, placeholder } = props;

    const textFieldInputProps: TextFieldInputProps = {
        id,
        isRequired: isRequired,
        value: value,
        type: "text",
        setTextFieldValue: setStringType,
        placeholder: placeholder
    };

    returnElement.push(
        (
            <div key={id + "-FIELD"}>
                <TextFieldInput {...textFieldInputProps} />
            </div>
        ),
    );

    return <>{returnElement}</>;
};

export default StringType;
