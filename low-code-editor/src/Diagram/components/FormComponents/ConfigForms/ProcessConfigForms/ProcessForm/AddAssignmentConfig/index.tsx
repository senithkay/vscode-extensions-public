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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useState } from "react";
import { useIntl } from "react-intl";

import { FormControl, Typography } from "@material-ui/core";
import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import { FormElementProps, ProcessConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { AssignmentStatement, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { createPropertyStatement, getInitialSource } from "../../../../../../utils/modification-util";
import { useStyles } from "../../../../DynamicConnectorForm/style";
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";

interface AddAssignmentConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddAssignmentConfig(props: AddAssignmentConfigProps) {
    const intl = useIntl();
    const { config, formArgs, onCancel, onSave, onWizardClose } = props;

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

    let variableName: string = '';
    let varExpression: string = '';

    const existingProperty = config && config.model;
    if (existingProperty && STKindChecker.isAssignmentStatement(config.model)) {
        varExpression = config.model.expression?.source;
        variableName = config.model?.varRef?.source?.trim();
    }

    const [varName, setVarName] = useState(variableName);
    const [variableExpression, setVariableExpression] = useState<string>(varExpression);

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.assignment.title",
        defaultMessage: "Assignment"
    });

    const initialSource = getInitialSource(createPropertyStatement(
        `${varName ? varName : "default"} = ${variableExpression ? variableExpression : "EXPRESSION"} ;`
    ));

    const handleStatementEditorChange = (partialModel: AssignmentStatement) => {
        setVarName(partialModel.varRef.source.trim());
        setVariableExpression(partialModel.expression.source.trim());
    }

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config,
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
