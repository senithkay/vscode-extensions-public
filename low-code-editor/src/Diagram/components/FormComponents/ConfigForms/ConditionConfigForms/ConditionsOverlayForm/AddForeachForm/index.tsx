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
import React, { useContext, useState } from "react";
import { useIntl } from "react-intl";

import { ConditionConfig, ForeachConfig, genVariableName, getAllVariables } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { BinaryExpression, ForeachStatement } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { createForeachStatement, createForeachStatementWithBlock, getInitialSource } from "../../../../../../utils/modification-util";

interface Iterations {
    start?: string;
    end?: string;
}

interface ForeachProps {
    condition: ConditionConfig | any;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddForeachForm(props: ForeachProps) {
    const {
        props: {
            stSymbolInfo,
            currentFile,
            syntaxTree,
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

    const [conditionExpression] = useState(condition.conditionExpression);
    let initCollectionDefined: boolean = (condition.scopeSymbols.length > 0);
    const initIterations: Iterations = {
        start: undefined,
        end: undefined
    };

    if (conditionExpression.model) {
        const forEachModel: ForeachStatement = (conditionExpression as ForeachConfig).model as ForeachStatement;
        switch (forEachModel.actionOrExpressionNode.kind) {
            case 'BinaryExpression':
                const expression = forEachModel.actionOrExpressionNode as BinaryExpression;
                if (expression.operator.kind === 'EllipsisToken') {
                    initCollectionDefined = false;
                    initIterations.start = expression.lhsExpr.source.trim();
                    initIterations.end = expression.rhsExpr.source.trim();
                }

                break;
            case 'SimpleNameReference':
                initCollectionDefined = true;
                break;
        }

    }
    const intl = useIntl();

    if (!conditionExpression.variable || (conditionExpression.variable === '')) {
        conditionExpression.variable = genVariableName("item", getAllVariables(stSymbolInfo));
    }

    const selectedType = conditionExpression.type ? conditionExpression.type : "var";

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.foreach.title",
        defaultMessage: "Foreach"
    });

    const initialSource = formArgs.model ? getInitialSource(createForeachStatementWithBlock(
                                conditionExpression.collection ? conditionExpression.collection : 'EXPRESSION',
                                conditionExpression.variable,
                                selectedType,
                                (formArgs.model as ForeachStatement).blockStatement.statements.map(statement => {
                                    return statement.source
                                })
                            )) : getInitialSource(createForeachStatement(
                                conditionExpression.collection ? conditionExpression.collection : 'EXPRESSION',
                                conditionExpression.variable,
                                selectedType
                            ));

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
