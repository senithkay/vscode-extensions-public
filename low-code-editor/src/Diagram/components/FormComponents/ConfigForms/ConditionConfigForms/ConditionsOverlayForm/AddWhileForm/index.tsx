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
// tslint:disable: jsx-no-multiline-js ordered-imports
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { WhileStatement } from "@wso2-enterprise/syntax-tree";
import { FormControl, Typography } from "@material-ui/core";

import { FormField, ConditionConfig, } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { BALLERINA_EXPRESSION_SYNTAX_PATH } from "../../../../../../../utils/constants";
import { Context } from "../../../../../../../Contexts/Diagram";
import { createWhileStatement, createWhileStatementWithBlock, getInitialSource } from "../../../../../../utils/modification-util";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { FormElementProps } from "../../../../Types";
import Tooltip from '../../../../../../../components/TooltipV2';
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

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
        }
    } = useContext(Context);

    const { condition, formArgs, onCancel, onWizardClose } = props;
    const intl = useIntl();

    const [conditionExpression, setConditionExpression] = useState(condition.conditionExpression);

    const handleStatementEditorChange = (partialModel: WhileStatement) => {
        setConditionExpression(partialModel.condition?.expression?.source.trim());
    }

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.while.title",
        defaultMessage: "If"
    });

    const initialSource = formArgs.model ? getInitialSource(createWhileStatementWithBlock(
                                conditionExpression ? conditionExpression as string : 'EXPRESSION',
                                (formArgs.model as WhileStatement).whileBody.statements.map(statement => {
                                    return statement.source
                                })
                            )) : getInitialSource(createWhileStatement(
                                conditionExpression ? conditionExpression as string : 'EXPRESSION'
                            ));

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
