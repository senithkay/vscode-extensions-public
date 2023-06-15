/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
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
    isInsideArray?: boolean;
}

const SimpleType = (props: SimpleTypeProps): ReactElement => {
    const returnElement: ReactElement[] = [];
    const type = props.type === ConfigType.NUMBER ? ConfigType.FLOAT : props.type;

    const element: ConfigElementProps = {
        connectionConfig: props.connectionConfig,
        description: props.description,
        id: props.id,
        isFeaturePreview: props.isFeaturePreview,
        isLowCode: props.isLowCode,
        isRequired: props.isRequired,
        name: props.name,
        type: props.type,
        value: props.value,
    };

    useEffect(() => {
        props.setSimpleConfig(props.id, element);
    }, []);

    const setSimpleElememt = (id: string, value: any, valueRef: any) => {
        element.value = value;
        element.valueRef = valueRef;
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
