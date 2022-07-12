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
import React, { useContext, useEffect } from 'react';

import { genVariableName, getAllVariables } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { StatementEditorWrapper } from '@wso2-enterprise/ballerina-statement-editor';
import { ModuleVarDecl, NodePosition } from '@wso2-enterprise/syntax-tree';

import { Context, useDiagramContext } from '../../../../../Contexts/Diagram';
import { getVarNamePositionFromST } from '../../../../utils/st-util';

import { getFormConfigFromModel, VariableOptions } from './util';


interface ModuleVariableFormProps {
    model?: ModuleVarDecl;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType: string;
    isLastMember?: boolean;
}

export function ModuleVariableForm(props: ModuleVariableFormProps) {
    const { api: { code: { modifyDiagram }, insights: { onEvent } }, props: { stSymbolInfo } } = useDiagramContext();
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

    const { onCancel, targetPosition, model, formType } = props;
    const formConfig = getFormConfigFromModel(model);
    const variableTypes: string[] = ["int", "float", "boolean", "string", "json", "xml"];

    // Insight event to send when loading the component
    useEffect(() => {
        // const event: LowcodeEvent = {
        //     type: ADD_VARIABLE,
        //     name: `${state.varType} ${state.varName} = ${state.varValue};`
        // };
        // onEvent(event);
    }, []);

    if (formConfig.varOptions.indexOf(VariableOptions.PUBLIC) === -1) {
        variableTypes.unshift('var');
    }

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model) {
        namePosition = getVarNamePositionFromST(model);
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

    const visibilityQualifier = formConfig.varOptions.includes(VariableOptions.PUBLIC) ? 'public' : '';
    const finalKeyword = formConfig.varOptions.includes(VariableOptions.FINAL) ? 'final' : '';
    const varType = formConfig.varType ? formConfig.varType : 'var';
    const varName = formConfig.varName ? formConfig.varName : genVariableName("variable", getAllVariables(stSymbolInfo));
    const varValue = formConfig.varValue ? formConfig.varValue : 'EXPRESSION';

    const initialSource = `${visibilityQualifier} ${finalKeyword} ${varType} ${varName} = ${varValue};`

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: 'Variable',
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
            isModuleVar: true
        }
    );


    return stmtEditorComponent;
}
