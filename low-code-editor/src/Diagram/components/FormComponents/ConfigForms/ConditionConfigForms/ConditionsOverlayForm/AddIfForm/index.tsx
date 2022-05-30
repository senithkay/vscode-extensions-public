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
// tslint:disable: jsx-no-multiline-js ordered-imports
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { BlockStatement, ElseBlock, IfElseStatement, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import classnames from "classnames";
import { Box, FormControl, IconButton, Typography } from "@material-ui/core";
import { ControlPoint, RemoveCircleOutlineRounded } from "@material-ui/icons";

import { FormField, DiagramDiagnostic, ConditionConfig, ElseIfConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
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
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { FormElementProps } from "../../../../Types";
import Tooltip from '../../../../../../../components/TooltipV2'
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

interface IfProps {
    condition: ConditionConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export const DEFINE_CONDITION: string = "Define Condition Expression";
export const EXISTING_PROPERTY: string = "Select Boolean Property";

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
            isMutationProgress: isMutationInProgress,
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
    const [compList, setCompList] = useState(
        statementConditions.map((item) => ({
            ...item,
            isValid: item.diagnostics?.length === 0,
        }))
    );

    const updateElseIfExpressions = (obj: ElseBlock, element: ExpressionsArray): ElseBlock => {
        if (STKindChecker.isIfElseStatement(obj.elseBody)) {
            element.expression = obj.elseBody.condition.source.trim();
            return obj.elseBody.elseBody;
        }
        return null;
    }

    const handleStatementEditorChange = (partialModel: IfElseStatement) => {
        compList[0].expression = partialModel.condition.source.trim();
        let elseIfModel = partialModel.elseBody ? partialModel.elseBody : null;
        compList.map((element, index) => {
            if (index !== 0 && elseIfModel) {
                elseIfModel = updateElseIfExpressions(elseIfModel, element)
            }
        })
    }

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
            onStmtEditorModelChange: handleStatementEditorChange,
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
