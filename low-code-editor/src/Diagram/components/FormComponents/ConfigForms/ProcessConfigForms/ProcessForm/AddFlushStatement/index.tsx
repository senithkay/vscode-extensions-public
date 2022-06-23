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

import { FlushStatementConfig, ProcessConfig } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";

import { Context } from '../../../../../../../Contexts/Diagram';
import { createFlushStatement, getInitialSource } from '../../../../../../utils';

interface AddFlushStatementProps {
    config: ProcessConfig;
    formArgs: any;
    onCancel: () => void;
    onSave: () => void;
    onWizardClose: () => void;
}


export function AddFlushStatement(props: AddFlushStatementProps) {
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

    const formTitle = intl.formatMessage({
        id: "lowcode.develop.configForms.variable.title",
        defaultMessage: "Flush Statement"
    });

    const flushStatementConfig: FlushStatementConfig = config.config as FlushStatementConfig;
    flushStatementConfig.expression = flushStatementConfig.expression === '' ?
        'EXPRESSION' : flushStatementConfig.expression;
    flushStatementConfig.varName = flushStatementConfig.varName === '' ?
        'EXPRESSION' : flushStatementConfig.varName;

    const initialSource = getInitialSource(createFlushStatement(flushStatementConfig));
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
            experimentalEnabled
        }
    );

    return (
        stmtEditorComponent
    );
}
