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

import { ConfigType, SchemaConstants } from "../../model";
import { ConfigElementProps } from "../../ConfigElement";
import { getType } from "../../utils";
import ObjectArray, { ObjectArrayProps } from "./ObjectArray";
import SimpleArray, { SimpleArrayProps } from "./SimpleArray";

/**
 * A high level config property which can contain nested objects.
 */
export interface ArrayTypeProps extends ConfigElementProps {
    arrayType?: ConfigType;
    setArrayType?: (id: string, objectValue: any) => void; 
}

export const ArrayType = (props: ArrayTypeProps): ReactElement => {
    const arrayType = getType(props.schema[SchemaConstants.ITEMS][SchemaConstants.TYPE]);

    const arrayTypeProps: ObjectArrayProps | SimpleArrayProps = {
        ...props,
        arrayType: arrayType,
        setArrayElement: props.setConfigElement,
    };

    switch (arrayType) {
        case ConfigType.OBJECT:
            return(
                <ObjectArray {...arrayTypeProps} />
            );
        default:
            return(
                <SimpleArray {...arrayTypeProps} />
            );
    }
};

export default ArrayType;
