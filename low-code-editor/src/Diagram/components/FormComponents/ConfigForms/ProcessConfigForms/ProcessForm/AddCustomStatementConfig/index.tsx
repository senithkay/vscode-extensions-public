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
import React, { useContext, useEffect } from "react";
import { useIntl } from "react-intl";

import { ProcessConfig } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";

import { Context } from "../../../../../../../Contexts/Diagram";

interface LogConfigProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddCustomStatementConfig(props: LogConfigProps) {
    const intl = useIntl();

    const {
        props: {
            currentFile,
            stSymbolInfo,
            syntaxTree,
            importStatements,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            code: {
                modifyDiagram
            },
            insights: { onEvent },
            library
        }
    } = useContext(Context);

    const { config, formArgs, onCancel, onWizardClose } = props;

    // Insight event to send when loading the component
    useEffect(() => {
        // const event: LowcodeEvent = {
        //     type: ADD_OTHER_STATEMENT,
        //     name: expression,
        // };
        // onEvent(event);
    }, []);

    let defaultExpression = "";
    if (config?.model) {
        defaultExpression = config?.model?.source.trim();
    }

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.customStatement.title",
        defaultMessage: "Other"
    });

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: formTitle,
            initialSource: defaultExpression ? defaultExpression : "STATEMENT",
            formArgs: {
                formArgs: {
                    targetPosition: {
                        startLine: config.targetPosition.startLine,
                        startColumn: config.targetPosition.startColumn
                    }
                }
            },
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
            experimentalEnabled
        }
    );

    return stmtEditorComponent;
}
