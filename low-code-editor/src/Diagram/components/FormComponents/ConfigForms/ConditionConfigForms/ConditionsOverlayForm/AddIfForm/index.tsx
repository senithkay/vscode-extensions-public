/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { ConditionConfig, DiagramDiagnostic, ElseIfConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { BlockStatement, IfElseStatement, NodePosition } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import {
    createElseIfStatement,
    createElseIfStatementWithBlock,
    createElseStatement,
    createElseStatementWithBlock,
    createIfStatement,
    createIfStatementWithBlock,
    getInitialSource
} from "../../../../../../utils/modification-util";

interface IfProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

interface ExpressionsArray {
    id: number;
    expression: string;
    position: NodePosition;
    diagnostics?: DiagramDiagnostic[];
    isValid?: boolean;
}

export function AddIfForm(props: IfProps) {
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
        },
    } = useContext(Context);
    const { condition, formArgs, onCancel, onWizardClose } = props;
    const intl = useIntl();

    let statementConditions: ExpressionsArray[];
    statementConditions = (condition.conditionExpression as ElseIfConfig)?.values
        ? (condition.conditionExpression as ElseIfConfig).values
        : [{ id: 0, expression: "", position: {}, isValid: false }];
    const compList = statementConditions.map((item) => ({
            ...item,
            isValid: item.diagnostics?.length === 0,
        }));

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.if.title",
        defaultMessage: "If"
    });

    const getCompleteSource = () => {
        let source = "";
        if (formArgs.model){
            let currentModel = formArgs.model as IfElseStatement;
            source = source + getInitialSource(createIfStatementWithBlock(
                compList[0].expression ? compList[0].expression : 'EXPRESSION',
                currentModel.ifBody.statements.map(statement => {
                    return statement.source
                })
            ));
            if (compList.length > 1) {
                compList.map((element, index) => {
                    if (index !== 0){
                        currentModel = currentModel.elseBody.elseBody as IfElseStatement
                        source = source + getInitialSource(createElseIfStatementWithBlock(
                            element.expression ? element.expression : 'EXPRESSION',
                            currentModel.ifBody.statements.map(statement => {
                                return statement.source
                            })
                        ));
                    }
                })
            }
            if (currentModel.elseBody) {
                source = source + getInitialSource(createElseStatementWithBlock(
                    (currentModel.elseBody.elseBody as BlockStatement).statements.map(statement => {
                        return statement.source
                    })
                ));
            } else {
                source = source + "}";
            }

        }
        else {
            source = getInitialSource(createIfStatement(
                compList[0].expression ? compList[0].expression : 'EXPRESSION'
            ));
            if (compList.length > 1) {
                compList.map((element, index) => {
                    if (index !== 0){
                        source = source + getInitialSource(createElseIfStatement(element.expression ? element.expression : 'EXPRESSION'))
                    }
                })
            }
            source = source + getInitialSource(createElseStatement());
        }
        return source;
    }

    const initialSource = getCompleteSource();

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
