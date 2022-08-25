/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode } from "react";

import {
    TypeDefinition
} from "@wso2-enterprise/syntax-tree";

import { ExpressionComponent } from "../../Expression";

interface TypeDefProps {
    model: TypeDefinition;
}

export function TypeDefinitionC(props: TypeDefProps) {
    const { model } = props;

    let typeDescriptor: ReactNode;
    if (model?.typeDescriptor) {
        typeDescriptor = (
            <ExpressionComponent
                model={model.typeDescriptor}
            />
        )
    }
    let typeName: ReactNode;
    if (model?.typeName) {
        typeName = (
            <ExpressionComponent
                model={model?.typeName}
            />
        )
    }

    return (
        <>
            <span style={{color: "blue", marginRight: 5}}>
                {model?.visibilityQualifier}
            </span>
            <span style={{color: "blue", marginRight: 5}}>
                {model?.typeKeyword?.value}
            </span>
            <span style={{color: "green", marginRight: 5}}>
                {typeName}
            </span>
            <span>
                {typeDescriptor}
            </span>
            <span>
                {model?.semicolonToken?.value}
            </span>
        </>
    );
}
