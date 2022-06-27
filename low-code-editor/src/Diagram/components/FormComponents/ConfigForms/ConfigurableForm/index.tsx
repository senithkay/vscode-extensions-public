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
import React, { useContext } from 'react';

import {
    ConfigOverlayFormStatus,
    genVariableName,
    getAllVariables
} from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { CaptureBindingPattern, ModuleVarDecl, NodePosition } from '@wso2-enterprise/syntax-tree';

import { Context, useDiagramContext } from '../../../../../Contexts/Diagram';

import { getFormConfigFromModel } from './util';

interface ConfigurableFormProps {
    model?: ModuleVarDecl;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    configOverlayFormStatus?: ConfigOverlayFormStatus;
    formType: string;
    isLastMember?: boolean;
}

export function ConfigurableForm(props: ConfigurableFormProps) {
    const { api: { code: { modifyDiagram }, insights: { onEvent } }, props: { stSymbolInfo } } = useDiagramContext();
    const { onCancel, targetPosition, model, configOverlayFormStatus, formType } = props;
    const formConfig = getFormConfigFromModel(model, stSymbolInfo);

    const {
        props: {
            currentFile,
            syntaxTree,
            importStatements,
            experimentalEnabled
        },
        api: {
            ls: { getExpressionEditorLangClient },
            library
        },
    } = useContext(Context);

    const { updateInjectables } = configOverlayFormStatus?.formArgs || {};
    const isFromExpressionEditor = !!updateInjectables;

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model && (model?.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName?.position) {
        namePosition = (model.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

    const visibilityQualifier = formConfig.isPublic ? 'public' : '';
    const varType = formConfig.varType ? formConfig.varType : 'boolean';
    const varName = formConfig.varName ? formConfig.varName : genVariableName('conf', getAllVariables(stSymbolInfo));
    const varValue = formConfig.hasDefaultValue && formConfig.varValue ? formConfig.varValue : '?';

    const initialSource = `${visibilityQualifier} configurable ${varType} ${varName} = ${varValue};`

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: isFromExpressionEditor ? 'Add Configurable' : 'Configurable',
            initialSource,
            formArgs: {formArgs: {
                targetPosition: model ? targetPosition : { startLine: targetPosition.startLine, startColumn: targetPosition.startColumn }
            }},
            config: { type: formType, model},
            onWizardClose: onCancel,
            onCancel,
            currentFile,
            getLangClient: getExpressionEditorLangClient,
            applyModifications: modifyDiagram,
            library,
            syntaxTree,
            stSymbolInfo,
            importStatements,
            experimentalEnabled,
            isConfigurableStmt: true
        }
    );

    return stmtEditorComponent;
}
