/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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

import { ConfigOverlayFormStatus } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormEditor } from "@wso2-enterprise/ballerina-statement-editor";
import {
    FunctionDefinition,
    NodePosition, ObjectMethodDefinition, ResourceAccessorDefinition, STNode
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { DiagramOverlayPosition } from "../../../Portals/Overlay";

interface GraphqlConfigFormProps {
    position: DiagramOverlayPosition;
    model?: ResourceAccessorDefinition | ObjectMethodDefinition,
    targetPosition?: NodePosition,
    configOverlayFormStatus?: ConfigOverlayFormStatus;
    onCancel: () => void;
    onSave: () => void;
}

export function GraphqlConfigForm(props: GraphqlConfigFormProps) {
    const { targetPosition, model, configOverlayFormStatus, onSave, onCancel } = props;

    const {
        api: {
            code: {
                modifyDiagram
            },
            ls: { getExpressionEditorLangClient }
        },
        props: {
            currentFile
        }
    } = useContext(Context);

    const position = model ? ({
        startLine: model.functionName.position.startLine,
        startColumn: model.functionName.position.startColumn,
        endLine: model.functionSignature.position.endLine,
        endColumn: model.functionSignature.position.endColumn
    }) : targetPosition;

    return (
        <>
            <FormEditor
                initialSource={model ? model.source : undefined}
                initialModel={model}
                isLastMember={false}
                targetPosition={position}
                onCancel={onCancel}
                type={"GraphqlResource"}
                currentFile={currentFile}
                getLangClient={getExpressionEditorLangClient}
                applyModifications={modifyDiagram}
                topLevelComponent={true} // todo: Remove this
            />
        </>
    );
}
