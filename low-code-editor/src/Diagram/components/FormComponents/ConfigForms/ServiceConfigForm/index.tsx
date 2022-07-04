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
import React, { useState } from "react";

import { Box, FormControl, Typography } from "@material-ui/core";
import { FormHeaderSection } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { FormEditor } from "@wso2-enterprise/ballerina-statement-editor";
import { NodePosition, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";

import { ServiceIcon } from "../../../../../assets/icons";
import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";

import { HttpServiceForm } from "./forms/HttpService";
import { TriggerServiceForm } from "./forms/TriggerService";
import { ServiceTypeSelector } from "./ServiceTypeSelector";
import { getServiceTypeFromModel } from "./util";

interface ServiceConfigFormProps {
    model?: ServiceDeclaration;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType: string;
    isLastMember?: boolean;
}

export enum ServiceTypes {
    HTTP = 'http'
}

export function ServiceConfigForm(props: ServiceConfigFormProps) {
    const formClasses = useFormStyles();
    const { model, targetPosition, onSave, onCancel, formType, isLastMember } = props;

    const {
        props: { syntaxTree, currentFile, experimentalEnabled, importStatements, stSymbolInfo },
        api: {
            ls: { getExpressionEditorLangClient },
            code: { modifyDiagram },
            library
        },
    } = useDiagramContext();
    const [serviceType, setServiceType] = useState<string>(getServiceTypeFromModel(model, stSymbolInfo));

    let configForm = <div />;

    switch (serviceType) {
        case ServiceTypes.HTTP:
            configForm = <HttpServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} isLastMember={isLastMember} />
            break;
        default:
            configForm = <TriggerServiceForm onSave={onSave} onCancel={onCancel} model={model} targetPosition={targetPosition} />
    }

    let position: NodePosition;
    if (model) {
        const modelPosition = model.position as NodePosition;
        const openBracePosition = model.openBraceToken.position as NodePosition;
        position = {
            startLine: modelPosition.startLine,
            startColumn: 0,
            endLine: openBracePosition.startLine,
            endColumn: openBracePosition.startColumn - 1
        };
    } else {
        position = targetPosition;
    }

    return (
        <>
            <FormEditor
                initialSource={model ? model.source : undefined}
                initialModel={model}
                targetPosition={position}
                stSymbolInfo={stSymbolInfo}
                syntaxTree={syntaxTree}
                isLastMember={isLastMember}
                onCancel={onCancel}
                type={"Service"}
                currentFile={currentFile}
                getLangClient={getExpressionEditorLangClient}
                applyModifications={modifyDiagram}
                topLevelComponent={true}// todo: Remove this
            />
        </>
    )
}
