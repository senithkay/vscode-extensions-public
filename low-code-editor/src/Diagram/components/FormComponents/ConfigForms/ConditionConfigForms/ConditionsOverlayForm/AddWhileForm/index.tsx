/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { useIntl } from "react-intl";

import { ConditionConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { WhileStatement } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { createWhileStatement, createWhileStatementWithBlock, getInitialSource } from "../../../../../../utils/modification-util";

export interface WhileProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddWhileForm(props: WhileProps) {
    const {
        props: {
            currentFile,
            syntaxTree,
            stSymbolInfo,
            importStatements,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: {
                modifyDiagram
            },
            library
        }
    } = useContext(Context);

    const { condition, formArgs, onCancel, onWizardClose } = props;
    const intl = useIntl();

    const conditionExpression = condition?.conditionExpression ? condition.conditionExpression as string : 'EXPRESSION';

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.while.title",
        defaultMessage: "If"
    });

    const initialSource = formArgs.model ? getInitialSource(createWhileStatementWithBlock(conditionExpression,
                                (formArgs.model as WhileStatement).whileBody.statements.map(statement => {
                                    return statement.source
                                })
                            )) : getInitialSource(createWhileStatement(conditionExpression));

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config: condition,
            onWizardClose,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            library,
            syntaxTree,
            stSymbolInfo,
            importStatements,
            experimentalEnabled
        }
    );

    return stmtEditorComponent;
}
