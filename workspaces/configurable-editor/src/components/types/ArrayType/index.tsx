/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { ReactElement } from "react";

import { ConfigElementProps } from "../../ConfigElement";
import { ConfigType, SchemaConstants } from "../../model";
import { getType } from "../../utils";

import NestedArray, { NestedArrayProps }  from "./NestedArray";
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

    const arrayTypeProps: NestedArrayProps | ObjectArrayProps | SimpleArrayProps = {
        ...props,
        arrayType,
        setArrayElement: props.setConfigElement,
    };
    switch (arrayType) {
        case ConfigType.OBJECT:
            return(
                <ObjectArray {...arrayTypeProps} />
            );
        case ConfigType.NESTEDARRAY:
            return(
                <NestedArray {...arrayTypeProps} />
            );
        default:
            return(
                <SimpleArray {...arrayTypeProps} />
            );
    }
};

export default ArrayType;
