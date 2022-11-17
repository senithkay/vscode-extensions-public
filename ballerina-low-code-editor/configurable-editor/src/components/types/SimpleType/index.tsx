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
import { ConfigType } from "../../model";
import BooleanType, { BooleanTypeProps } from "../BooleanType";
import FloatType, { FloatTypeProps } from "../FloatType";
import IntegerType, { IntegerTypeProps } from "../IntegerType";
import StringType, { StringTypeProps } from "../StringType";

/**
 * A leaf level configurable type representing boolean, integer, float, and string values.
 */
export interface SimpleTypeProps extends ConfigElementProps {
    setSimpleConfig?: (id: string, simpleValue: ConfigElementProps) => void;
}

const SimpleType = (props: SimpleTypeProps): ReactElement => {
    const returnElement: ReactElement[] = [];
    const type = props.type === ConfigType.NUMBER ? ConfigType.FLOAT : props.type;

    const element: ConfigElementProps = {
        description: props.description,
        id: props.id,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
        value: props.value,
    };

    useEffect(() => {
        props.setSimpleConfig(props.id, element);
    }, []);

    const setSimpleElememt = (id: string, value: any) => {
        element.value = value;
        props.setSimpleConfig(id, element);
    };

    switch (type) {
        case ConfigType.BOOLEAN:
            const booleanTypeProp: BooleanTypeProps = {
                ...props,
                setBooleanConfig: setSimpleElememt,
            };

            returnElement.push (
                (
                    <div key={props.id + "-FIELD"}>
                        <BooleanType {...booleanTypeProp} />
                    </div>
                ),
            );
            break;
        case ConfigType.INTEGER:
            const integerTypeProp: IntegerTypeProps = {
                ...props,
                setIntegerConfig: setSimpleElememt,
            };

            returnElement.push (
                (
                    <div key={props.id + "-FIELD"}>
                        <IntegerType {...integerTypeProp} />
                    </div>
                ),
            );
            break;
        case ConfigType.FLOAT:
            const floatTypeProp: FloatTypeProps = {
                ...props,
                setFloatConfig: setSimpleElememt,
            };

            returnElement.push (
                (
                    <div key={props.id + "-FIELD"}>
                        <FloatType {...floatTypeProp} />
                    </div>
                ),
            );
            break;
        case ConfigType.STRING:
            const stringTypeProp: StringTypeProps = {
                ...props,
                setStringType: setSimpleElememt,
            };

            returnElement.push (
                (
                    <div key={props.id + "-FIELD"}>
                        <StringType {...stringTypeProp} />
                    </div>
                ),
            );
            break;
    }

    return <>{returnElement}</>;
};

export default SimpleType;
