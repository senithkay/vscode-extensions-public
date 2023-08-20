/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactElement } from "react";

import { ConfigElementProps } from "../../ConfigElement";
import { ConfigType, SchemaConstants } from "../../model";
import { getType } from "../../utils";

import NestedArray  from "./NestedArray";
import ObjectArray, { ObjectArrayProps } from "./ObjectArray";
import SimpleArray, { SimpleArrayProps } from "./SimpleArray";

/**
 * A high level config property which can contain nested objects.
 */
export interface ArrayTypeProps extends ConfigElementProps {
    arrayType?: ConfigType;
    isNestedArray?: boolean;
    setArrayType?: (id: string, objectValue: any) => void;
    isMapType?: boolean;
}

export const ArrayType = (props: ArrayTypeProps): ReactElement => {
    let arrayType: ConfigType;
    let isNestedArray: boolean;
    if (props?.isMapType)  {
        if (props.schema?.[SchemaConstants.ADDITIONAL_PROPERTIES]?.[SchemaConstants.ITEMS]?.[SchemaConstants.TYPE] === ConfigType.ARRAY) {
            arrayType = getType(props.schema?.[SchemaConstants.ADDITIONAL_PROPERTIES]?.[SchemaConstants.ITEMS]?.[SchemaConstants.ITEMS]?.[SchemaConstants.TYPE]);
            isNestedArray = true;
        } else {
            arrayType = getType(props.schema?.[SchemaConstants.ADDITIONAL_PROPERTIES]?.[SchemaConstants.ITEMS]?.[SchemaConstants.TYPE]);
        }
    } else {
        if (props.schema?.[SchemaConstants.ITEMS]?.[SchemaConstants.TYPE] === ConfigType.ARRAY) {
            arrayType = getType(props.schema?.[SchemaConstants.ITEMS]?.[SchemaConstants.ITEMS]?.[SchemaConstants.TYPE]);
            isNestedArray = true;
        } else {
            arrayType = getType(props.schema?.[SchemaConstants.ITEMS]?.[SchemaConstants.TYPE]);
        }
    }
    const arrayTypeProps: ObjectArrayProps | SimpleArrayProps = {
        ...props,
        arrayType,
        isNestedArray,
        setArrayElement: props.setConfigElement,
    };
    switch (arrayType) {
        case ConfigType.OBJECT:
            return(
                <ObjectArray {...arrayTypeProps} />
            );
        default:
            if (isNestedArray) {
                return(
                    <NestedArray {...arrayTypeProps} />
                );
            } else {
                return(
                    <SimpleArray {...arrayTypeProps} />
                );
            }
    }
};

export default ArrayType;
