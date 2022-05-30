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
// tslint:disable: ordered-imports
import React, { useContext, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { CallStatement, FunctionCall, QualifiedNameReference } from "@wso2-enterprise/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { Context } from "../../../../../../../Contexts/Diagram";
import { useStyles as useFormStyles } from "../../../../DynamicConnectorForm/style";
import { SelectDropdownWithButton } from "../../../../FormFieldComponents/DropDown/SelectDropdownWithButton";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { createLogStatement, getInitialSource } from "../../../../../../utils/modification-util";
import { LowCodeExpressionEditor } from "../../../../FormFieldComponents/LowCodeExpressionEditor";
import { LogConfig, ProcessConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormActionButtons, FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

interface LogConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export const DEFINE_LOG_EXR: string = "Define Log Expression";
export const SELECT_PROPERTY: string = "Select Existing Property";

export function AddLogConfig(props: LogConfigProps) {
    const intl = useIntl();

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

    const { config, formArgs, onCancel, onSave, onWizardClose } = props;
    const logTypeFunctionNameMap: Map<string, string> = new Map([
        ['printInfo', 'Info'],
        ['printDebug', 'Debug'],
        ['printWarn', 'Warn'],
        ['printError', 'Error']
    ])

    const logModel: CallStatement = config.model as CallStatement;

    let defaultType = "Info";
    let defaultExpression = "";
    if (logModel) {
        const functionCallModel: FunctionCall = logModel.expression as FunctionCall;
        defaultType = logTypeFunctionNameMap.get((functionCallModel.functionName as QualifiedNameReference).identifier.value);
        defaultExpression = functionCallModel.arguments.length > 0 && functionCallModel.arguments[0].source;
    }
    const [logType, setLogType] = useState(defaultType);
    const [expression, setExpression] = useState(defaultExpression);

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.log.title",
        defaultMessage: "Log"
    });

    const initialSource = getInitialSource(createLogStatement(
        logType,
        expression ? expression : 'EXPRESSION'
    ));

    const handleStatementEditorChange = (partialModel: CallStatement) => {
        const functionCallModel: FunctionCall = partialModel.expression as FunctionCall;
        setLogType(logTypeFunctionNameMap.get((functionCallModel.functionName as QualifiedNameReference).identifier.value));
        setExpression(functionCallModel.arguments[0].source);
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
