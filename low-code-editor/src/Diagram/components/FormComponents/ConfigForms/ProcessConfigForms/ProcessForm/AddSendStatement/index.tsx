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
import { useContext, useEffect } from 'react';
import { useIntl } from 'react-intl';

import { ProcessConfig, SendStatementConfig } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { useStatementEditor } from "@wso2-enterprise/ballerina-statement-editor";

import { Context } from '../../../../../../../Contexts/Diagram';
import { createSendStatement, getInitialSource } from '../../../../../../utils';

interface AddSendStatementProps {
    // test
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}

export function AddSendStatement(props: AddSendStatementProps) {
    const { config, formArgs, onCancel, onSave, onWizardClose } = props;
    const intl = useIntl();
    const {
        props: {
            currentFile,
            isMutationProgress: isMutationInProgress,
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
    const saveVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.saveButton.text",
        defaultMessage: "Save"
    });

    const cancelVariableButtonText = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.cancelButton.text",
        defaultMessage: "Cancel"
    });

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.title",
        defaultMessage: "Async Send Statement"
    });

    const sendStatementConfig: SendStatementConfig = config.config as SendStatementConfig;
    sendStatementConfig.expression = sendStatementConfig.expression === '' ? 'EXPRESSION' : sendStatementConfig.expression;
    sendStatementConfig.targetWorker = sendStatementConfig.targetWorker === '' ? 'EXPRESSION' : sendStatementConfig.targetWorker;

    const initialSource = getInitialSource(createSendStatement(sendStatementConfig));

    const { handleStmtEditorToggle, stmtEditorComponent } = useStatementEditor(
        {
            label: formTitle,
            initialSource,
            formArgs: { formArgs },
            config,
            onWizardClose,
            handleStatementEditorChange: undefined,
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

    useEffect(() => {
        handleStmtEditorToggle();
    }, []);

    return (
        stmtEditorComponent
    )
}
