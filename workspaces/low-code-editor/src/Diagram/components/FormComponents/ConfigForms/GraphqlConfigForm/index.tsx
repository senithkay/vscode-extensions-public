// tslint:disable: jsx-no-multiline-js
import React, { useContext } from "react";

import { ConfigOverlayFormStatus } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormEditor } from "@wso2-enterprise/ballerina-statement-editor";
import {
    NodePosition, ServiceDeclaration
} from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { DiagramOverlayPosition } from "../../../Portals/Overlay";

interface GraphqlConfigFormProps {
    position: DiagramOverlayPosition;
    model?: ServiceDeclaration,
    targetPosition?: NodePosition,
    configOverlayFormStatus?: ConfigOverlayFormStatus;
    onCancel: () => void;
    onSave: () => void;
}

export function GraphqlConfigForm(props: GraphqlConfigFormProps) {
    const { position, targetPosition, model, configOverlayFormStatus, onSave, onCancel } = props;

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

    return (
        <>
            <FormEditor
                initialSource={model ? model.source : undefined}
                initialModel={model}
                isLastMember={false}
                targetPosition={targetPosition}
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
