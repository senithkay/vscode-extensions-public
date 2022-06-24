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
import React, { useContext } from "react";

import { ConstDeclaration } from "@wso2-enterprise/syntax-tree";

import { StatementEditorContext } from "../../../store/statement-editor-context";
import { ExpressionComponent } from "../../Expression";
import { TokenComponent } from "../../Token";

interface ConstantDeclProps {
    model: ConstDeclaration;
}

export function ConstantDeclC(props: ConstantDeclProps) {
    const { model } = props;

    return (
        <>
            <TokenComponent model={model.constKeyword} className={"keyword"} />
            {model.typeDescriptor && <ExpressionComponent model={model.typeDescriptor}/>}
            <ExpressionComponent model={model.variableName}/>
            <TokenComponent model={model.equalsToken} className={"operator"} />
            <ExpressionComponent model={model.initializer}/>
            {!model.semicolonToken.isMissing &&
                <TokenComponent model={model.semicolonToken} />}
        </>
    );
}
