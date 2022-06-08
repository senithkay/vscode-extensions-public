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
import React, { useContext, useReducer, useState } from "react"

import { StatementEditorWrapper } from "@wso2-enterprise/ballerina-statement-editor";
import { ConstDeclaration, NodePosition } from "@wso2-enterprise/syntax-tree"

import { Context, useDiagramContext } from "../../../../../Contexts/Diagram";
import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";

import { generateConfigFromModel } from "./util";
import { ConstantConfigFormActionTypes, constantConfigFormReducer } from "./util/reducer";

interface ConstantConfigFormProps {
    model?: ConstDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType: string;
}

export function ConstantConfigForm(props: ConstantConfigFormProps) {
    const formClasses = useFormStyles();
    const { api: { code: { modifyDiagram } }, props: { stSymbolInfo } } = useDiagramContext();
    const {
        props: {
            isMutationProgress: isMutationInProgress,
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
    const { model, targetPosition, onCancel, onSave, formType } = props;
    const [config, dispatch] = useReducer(constantConfigFormReducer, generateConfigFromModel(model));

    const handleTypeChange = (type: string) => {
        dispatch({ type: ConstantConfigFormActionTypes.SET_CONSTANT_TYPE, payload: type });
    }

    const handleNameChange = (name: string) => {
        dispatch({ type: ConstantConfigFormActionTypes.SET_CONSTANT_NAME, payload: name })
    }

    const handleValueChange = (value: string) => {
        dispatch({ type: ConstantConfigFormActionTypes.SET_CONSTANT_VALUE, payload: value })
    }

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model) {
        namePosition = model.variableName.position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

    const handleStatementEditorChange = (partialModel: ConstDeclaration) => {
        handleNameChange(partialModel.variableName.value);
        handleTypeChange(partialModel.typeDescriptor.source.trim());
        handleValueChange(partialModel.initializer.source);
    }

    const visibilityQualifier = config.isPublic ? 'public' : '';
    const varType = config.constantType ? config.constantType : '';
    const varName = config.constantName ? config.constantName : 'CONST_NAME';
    const varValue = config.constantValue ? config.constantValue : '0';

    const initialSource = `${visibilityQualifier} const ${varType} ${varName} = ${varValue};`

    const stmtEditorComponent = StatementEditorWrapper(
        {
            label: 'Constant',
            initialSource,
            formArgs: {formArgs: {
                targetPosition: model ? targetPosition : { startLine: targetPosition.startLine, startColumn: targetPosition.startColumn }
            }},
            config: { type: formType, model},
            onWizardClose: onCancel,
            handleStatementEditorChange,
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
