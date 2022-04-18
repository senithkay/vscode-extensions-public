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
// tslint:disable: jsx-no-multiline-js
import React from "react";
import { useIntl } from "react-intl";

import { ConfigOverlayFormStatus } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FormEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { FunctionDefinition, LocalVarDecl, NodePosition } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";

interface FunctionConfigFormProps {
    model?: FunctionDefinition;
    configOverlayFormStatus?: ConfigOverlayFormStatus;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    isLastMember?: boolean;
}

export function FunctionConfigForm(props: FunctionConfigFormProps) {
    const MAIN_TEXT: string = "Main";
    const formClasses = useFormStyles();
    const { targetPosition, model, onSave, onCancel, configOverlayFormStatus, isLastMember } = props;

    const intl = useIntl();

    const isMainFunction: boolean = (configOverlayFormStatus.formName && configOverlayFormStatus.formName === MAIN_TEXT) || (model && model.functionName.value === MAIN_TEXT.toLowerCase());
    const functionName = isMainFunction ? MAIN_TEXT.toLowerCase() : (model ? model.functionName.value : "name");
    const parameters = "";
    const returnType = model ? (model?.functionSignature?.returnTypeDesc?.type?.source || "") : "error?";

    const position = model ? {
        ...model?.functionSignature?.position,
        startColumn: model?.functionName?.position?.startColumn,
    } : targetPosition;

    const {
        props: { syntaxTree, currentFile, experimentalEnabled, importStatements },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library
        },
    } = useDiagramContext();


    const handleStatementEditorChange = (partialModel: LocalVarDecl) => {
        onCancel();
    }

    return (
        <>
            <FormEditor
                initialSource={model ? model.source : undefined}
                targetPosition={model ? model.position : targetPosition}
                onCancel={onCancel}
                type={"Function"}
                currentFile={currentFile}
                getLangClient={getExpressionEditorLangClient}
                applyModifications={modifyDiagram}
                library={library}
                importStatements={importStatements}
                experimentalEnabled={experimentalEnabled}
            />
        </>
    )
}
