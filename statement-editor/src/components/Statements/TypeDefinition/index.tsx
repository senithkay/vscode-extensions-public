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
import { IdentifierToken } from "../../ExpressionTypes";
import { TokenComponent } from "../../Token";

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

    return (
        <>
            {model?.visibilityQualifier && (
                <TokenComponent model={model?.visibilityQualifier} className={"keyword"}/>
            )}
            <TokenComponent model={model?.typeKeyword} className={"keyword"}/>
            {model?.typeName && (
                <IdentifierToken model={model?.typeName}/>
            )}
            <span>
                {typeDescriptor}
            </span>
        </>
    );
}
