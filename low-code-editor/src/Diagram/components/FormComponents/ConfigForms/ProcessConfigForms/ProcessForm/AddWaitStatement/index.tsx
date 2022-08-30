/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { useContext } from 'react';
import { useIntl } from 'react-intl';

import { ProcessConfig, WaitStatementConfig  } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";

import { Context } from '../../../../../../../Contexts/Diagram';
import { createWaitStatement, getInitialSource } from '../../../../../../utils';

interface AddWaitStatementProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}


export function AddWaitStatement(props: AddWaitStatementProps) {
    const { config, formArgs, onCancel, onSave, onWizardClose } = props;
    const intl = useIntl();
    const {
        props: {
            currentFile,
            isMutationProgress: isMutationInProgress,
            stSymbolInfo,
            syntaxTree,
            importStatements,
            experimentalEnabled,
            isCodeServerInstance
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

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.title",
        defaultMessage: "Wait Statement"
    });

    const waitStatementConfig: WaitStatementConfig = config.config as WaitStatementConfig;
    waitStatementConfig.type = waitStatementConfig.type === '' ? 'var' : waitStatementConfig.type;
    waitStatementConfig.varName = waitStatementConfig.varName === '' ? 'EXPRESSION' : waitStatementConfig.varName;
    waitStatementConfig.expression = waitStatementConfig.expression === '' ? 'EXPRESSION' : waitStatementConfig.expression;

    const initialSource = getInitialSource(createWaitStatement(waitStatementConfig));
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
            isCodeServerInstance
        }
    );

    return (
        stmtEditorComponent
    );
}
