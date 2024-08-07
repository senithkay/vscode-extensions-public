/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useRef, useState } from "react";
import styled from "@emotion/styled";
import { AvailableNode, FlowNode, LineRange } from "@wso2-enterprise/ballerina-core";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import ConnectorView from "../ConnectorView";
import ConnectionConfigView from "../ConnectionConfigView";
import { convertNodePropertiesToFormFields, getFormProperties, updateNodeProperties } from "../../../../utils/eggplant";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";

const Container = styled.div`
    width: 100%;
`;

enum WizardStep {
    CONNECTOR_LIST = "connector-list",
    CONNECTION_CONFIG = "connection-config",
}

interface AddConnectionWizardProps {
    target: LineRange;
    onClose: () => void;
}

export function AddConnectionWizard(props: AddConnectionWizardProps) {
    const { target, onClose } = props;
    const { rpcClient } = useVisualizerContext();

    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.CONNECTOR_LIST);
    const [fields, setFields] = useState<FormField[]>([]);
    const selectedNodeRef = useRef<FlowNode>();

    const handleOnSelectConnector = (connector: AvailableNode) => {
        if (!connector.codedata) {
            console.error(">>> Error selecting connector. No codedata found");
            return;
        }
        rpcClient
            .getEggplantDiagramRpcClient()
            .getNodeTemplate({ id: connector.codedata })
            .then((response) => {
                console.log(">>> FlowNode template", response);
                selectedNodeRef.current = response.flowNode;
                const formProperties = getFormProperties(response.flowNode);
                console.log(">>> Form properties", formProperties);
                if (Object.keys(formProperties).length === 0) {
                    // add node to source code
                    handleOnFormSubmit({});
                    return;
                }
                // get node properties
                setCurrentStep(WizardStep.CONNECTION_CONFIG);
                setFields(convertNodePropertiesToFormFields(formProperties));
            });
    };

    const handleOnFormSubmit = (data: FormValues) => {
        console.log(">>> on form submit", data);
        if (selectedNodeRef.current) {
            let updatedNode: FlowNode = cloneDeep(selectedNodeRef.current);

            if (selectedNodeRef.current.branches?.at(0)?.properties) {
                // branch properties
                // TODO: Handle multiple branches
                const updatedNodeProperties = updateNodeProperties(
                    data,
                    selectedNodeRef.current.branches.at(0).properties
                );
                updatedNode.branches.at(0).properties = updatedNodeProperties;
            } else if (selectedNodeRef.current.properties) {
                // node properties
                const updatedNodeProperties = updateNodeProperties(data, selectedNodeRef.current.properties);
                updatedNode.properties = updatedNodeProperties;
            } else {
                console.error(">>> Error updating source code. No properties found");
            }
            console.log(">>> Updated node", updatedNode);

            rpcClient
                .getEggplantDiagramRpcClient()
                .getSourceCode({ flowNode: updatedNode })
                .then((response) => {
                    console.log(">>> Updated source code", response);
                    if (response.textEdits) {
                        // clear memory
                        setFields([]);
                        selectedNodeRef.current = undefined;
                        onClose();
                    } else {
                        console.error(">>> Error updating source code", response);
                        // handle error
                    }
                });
        }
    };

    return (
        <Container>
            {currentStep === WizardStep.CONNECTOR_LIST && <ConnectorView onSelectConnector={handleOnSelectConnector} />}
            {currentStep === WizardStep.CONNECTION_CONFIG && (
                <ConnectionConfigView fields={fields} onSubmit={handleOnFormSubmit} />
            )}
        </Container>
    );
}

export default AddConnectionWizard;
