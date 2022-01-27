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
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import {
    BallerinaConnectorInfo,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { ConnectorConfigWizard } from "../../ConnectorConfigWizard";
import { useStyles as useFormStyles } from "../../DynamicConnectorForm/style";
import { FormGenerator } from "../../FormGenerator";

interface ModuleConnectorFormProps {
    model?: STNode;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
    formType: string;
}

export function ModuleConnectorForm(props: ModuleConnectorFormProps) {
    const formClasses = useFormStyles();
    const {
        api: {
            code: { modifyDiagram },
        },
    } = useDiagramContext();
    const { model, targetPosition, onCancel, onSave, formType } = props;
    const [connector, setConnector] = useState<BallerinaConnectorInfo>();

    const onSelectConnector = (balConnector: BallerinaConnectorInfo) => {
        setConnector(balConnector);
    };

    const onCancelConnector = () => {
        setConnector(undefined);
    };

    return (
        <>
            {!connector && (
                <FormGenerator
                    onCancel={onCancel}
                    onSave={onSave}
                    configOverlayFormStatus={{
                        formType: "ConnectorList",
                        formArgs: {
                            onSelect: onSelectConnector,
                            onCancel,
                        },
                        isLoading: true,
                    }}
                />
            )}
            {connector && (
                <ConnectorConfigWizard
                    connectorInfo={connector}
                    position={{ x: 0, y: 0 }}
                    targetPosition={targetPosition}
                    model={model}
                    onClose={onCancelConnector}
                    onSave={onSave}
                    isModuleEndpoint={true}
                />
            )}
        </>
    );
}
