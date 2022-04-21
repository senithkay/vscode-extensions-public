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
import { ToggleButtonInput, ToggleButtonInputProps } from "../../elements/ToggleButtonInput";

import { SimpleTypeProps } from "../SimpleType";

/**
 * The leaf level configurable type representing boolean values.
 */
export interface BooleanTypeProps extends SimpleTypeProps {
    value?: boolean;
    setBooleanConfig: (id: string, booleanValue: boolean) => void;
}

const BooleanType = (props: BooleanTypeProps): ReactElement => {
    const returnElement: ReactElement[] = [];
    const { id, isRequired, value, setBooleanConfig } = props;

    const setBooleanValue = (id: string, value: boolean) => {
        setBooleanConfig(id, Boolean(value))
    };

    const toggleButtonInputProps: ToggleButtonInputProps = {
        id,
        existingValue: value,
        isRequired: isRequired,
        setToggleButtonValue: setBooleanValue,
    };

    returnElement.push(
        (
            <div key={id + "-FIELD"}>
                <ToggleButtonInput {...toggleButtonInputProps} />
            </div>
        ),
    );

    return <>{returnElement}</>;
};

export default BooleanType;
