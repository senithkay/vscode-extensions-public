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

import { ConfigurableKeyword, FinalKeyword, ModuleVarDecl } from "@wso2-enterprise/syntax-tree";

import { CUSTOM_CONFIG_TYPE } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { StatementEditorWrapperContext } from "../../../store/statement-editor-wrapper-context";
import { ExpressionComponent } from "../../Expression";
import { TokenComponent } from "../../Token";

interface ModuleVarDeclProps {
    model: ModuleVarDecl;
}

export function ModuleVarDeclC(props: ModuleVarDeclProps) {
    const { model } = props;
    const { config } = useContext(StatementEditorWrapperContext);
    const {
        modelCtx: {
            currentModel,
            changeCurrentModel
        }
    } = useContext(StatementEditorContext);

    if (!currentModel.model) {
        if (model.initializer) {
            changeCurrentModel(model.initializer);
        } else if (config.type === CUSTOM_CONFIG_TYPE) {
            changeCurrentModel(model);
        }
    }

    const qualifiers = model.qualifiers.map((qualifier: ConfigurableKeyword | FinalKeyword) => {
        return (
            <>
                <TokenComponent model={qualifier} />
            </>
        )
    });

    return (
        <>
            {model?.metadata && <TokenComponent model={model.metadata} />}
            {qualifiers}
            <ExpressionComponent model={model.typedBindingPattern} />
            <TokenComponent model={model.equalsToken} className={"operator"} />
            <ExpressionComponent model={model.initializer}/>
            {/* TODO: use model.semicolonToken.isMissing when the ST interface is supporting */}
            {model.semicolonToken.position.startColumn !== model.semicolonToken.position.endColumn &&
                <TokenComponent model={model.semicolonToken} />}
        </>
    );
}
