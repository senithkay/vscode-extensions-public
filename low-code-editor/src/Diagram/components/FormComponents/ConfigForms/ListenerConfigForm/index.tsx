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
import React  from "react";

import { FormEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { ListenerDeclaration, NodePosition } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../Contexts/Diagram";

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
