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

import { ProcessConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { CallStatement, FunctionCall, QualifiedNameReference } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../../Contexts/Diagram";
import { createLogStatement, getInitialSource } from "../../../../../../utils/modification-util";

interface LogConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddLogConfig(props: LogConfigProps) {
    const intl = useIntl();

    const {
        props: {
            ballerinaVersion,
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

    const { config, formArgs, onCancel, onWizardClose } = props;
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

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.log.title",
        defaultMessage: "Log"
    });

    const initialSource = getInitialSource(createLogStatement(
        defaultType,
        defaultExpression ? defaultExpression : 'EXPRESSION'
    ));

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config,
            onWizardClose,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            library,
            syntaxTree,
            stSymbolInfo,
            importStatements,
            experimentalEnabled,
            ballerinaVersion
        }
    );

    return stmtEditorComponent;
}
