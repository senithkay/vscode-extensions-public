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
import React, { useState } from "react";

import { ExpressionEditorProps } from "@wso2-enterprise/ballerina-expression-editor";
import {
    FormElementProps
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {FormEditor} from "@wso2-enterprise/ballerina-statement-editor";
import { ListenerDeclaration, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { createImportStatement, createListenerDeclartion } from "../../../../utils/modification-util";
import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";
import { LowCodeExpressionEditor } from "../../FormFieldComponents/LowCodeExpressionEditor";

import { isListenerConfigValid } from "./util";
import { ListenerConfig } from "./util/types";

interface ListenerConfigFormProps {
    model?: ListenerDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType?: string;
    isLastMember?: boolean
}

// FixMe: show validation messages to listenerName and listenerPort
export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const { model, targetPosition, onCancel, onSave, formType, isLastMember } = props;
    const { api: { code: { modifyDiagram }, ls: { getExpressionEditorLangClient } }, props: { currentFile }, } = useDiagramContext();
    let defaultState: ListenerConfig;

    if (model && STKindChecker.isListenerDeclaration(model)) {
        defaultState = {
            listenerName: model.variableName.value,
            listenerPort: model.initializer.parenthesizedArgList.arguments[0].source,
            listenerType: model.typeDescriptor.modulePrefix.value.toUpperCase(),
            isExpressionValid: true
        };
    } else {
        defaultState = {
            listenerName: '',
            listenerPort: '',
            listenerType: 'HTTP',
            isExpressionValid: false
        }
    }

    // const [config, setCofig] = useState<ListenerConfig>(defaultState);
    const [listenerName, setListenerName] = useState<string>(defaultState.listenerName);
    const [listenerPort, setListenerPort] = useState<string>(defaultState.listenerPort);
    const [listenerType, setListenerType] = useState<string>(defaultState.listenerType);
    const [isExpressionValid, setExpressionValid] = useState<boolean>(defaultState.isExpressionValid);

    const saveBtnEnabled = isListenerConfigValid({ listenerName, listenerPort, listenerType, isExpressionValid });

    const onListenerNameChange = (newName: string) => {
        setListenerName(newName);
    }

    const onListenerPortChange = (newPort: string) => {
        setListenerPort(newPort);
    }

    const handleOnSave = () => {
        let isNewListener: boolean;
        if (model) {
            isNewListener = false;
            const modelPosition = model.position as NodePosition;
            const updatePosition = {
                startLine: modelPosition.startLine,
                startColumn: 0,
                endLine: modelPosition.endLine,
                endColumn: modelPosition.endColumn
            };

            modifyDiagram([
                createListenerDeclartion(
                    { listenerName, listenerPort, listenerType, isExpressionValid },
                    updatePosition,
                    isNewListener
                )
            ]);
        } else {
            isNewListener = true;
            modifyDiagram([
                createImportStatement('ballerina', 'http', { startColumn: 0, startLine: 0 }),
                createListenerDeclartion({ listenerName, listenerPort, listenerType, isExpressionValid }, targetPosition, isNewListener, isLastMember)
            ]);
        }
        onSave();
    }

    const updateExpressionValidity = (fieldName: string, isInValid: boolean) => {
       setExpressionValid(!isInValid);
    }

    const portNumberExpressionEditorProps: FormElementProps<ExpressionEditorProps>  = {
        model: {
            name: "listenerPort",
            displayName: "Listener Port",
            typeName: "int",
            value: listenerPort
        },
        customProps: {
            validate: updateExpressionValidity,
            interactive: true,
            statementType: 'int',
            editPosition: {
                startLine: model ? model.position.startLine : targetPosition.startLine,
                endLine: model ? model.position.startLine : targetPosition.startLine,
                startColumn: 0,
                endColumn: 0
            },
            initialDiagnostics: model?.initializer?.typeData?.diagnostics
        },
        onChange: onListenerPortChange,
        defaultValue: listenerPort
    };

    const listenerPortInputComponent = (
        <LowCodeExpressionEditor
            {...portNumberExpressionEditorProps}
        />
    )

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model) {
        namePosition = model.variableName.position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
    }

    return (
        <>
            <FormEditor
                initialSource={model ? model.source : undefined}
                initialModel={model}
                targetPosition={model ? model?.position : targetPosition}
                onCancel={onCancel}
                type={"Listener"}
                currentFile={currentFile}
                getLangClient={getExpressionEditorLangClient}
                applyModifications={modifyDiagram}
                topLevelComponent={true} // todo: Remove this
            />
        </>
    )
}
