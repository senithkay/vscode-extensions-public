/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useRef, useState } from "react";
import styled from "@emotion/styled";
import { AvailableNode, FlowNode, SubPanel, SubPanelView } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import ConnectorView from "../ConnectorView";
import ConnectionConfigView from "../ConnectionConfigView";
import { convertNodePropertiesToFormFields, getFormProperties, updateNodeProperties } from "../../../../utils/bi";
import { ExpressionFormField, FormField, FormValues, PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import PullingModuleLoader from "../../../Connectors/PackageLoader/Loader";
import { InlineDataMapper } from "../../../InlineDataMapper";
import { HelperView } from "../../HelperView";
import { BodyText } from "../../../styles";

const Container = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80vh;
    flex-direction: column;
`;

enum WizardStep {
    CONNECTOR_LIST = "connector-list",
    CONNECTION_CONFIG = "connection-config",
}

interface AddConnectionWizardProps {
    onClose?: () => void;
}

export function AddConnectionWizard(props: AddConnectionWizardProps) {
    const { onClose } = props;
    const { rpcClient } = useRpcContext();

    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.CONNECTOR_LIST);
    const [fields, setFields] = useState<FormField[]>([]);
    const [isPullingConnector, setIsPullingConnector] = useState<boolean>(false);
    const selectedConnectorRef = useRef<AvailableNode>();
    const selectedNodeRef = useRef<FlowNode>();
    const [subPanel, setSubPanel] = useState<SubPanel>({ view: SubPanelView.UNDEFINED });
    const [showSubPanel, setShowSubPanel] = useState(false);
    const [updatedExpressionField, setUpdatedExpressionField] = useState<ExpressionFormField>(undefined);


    const handleOnSelectConnector = async (connector: AvailableNode) => {
        if (!connector.codedata) {
            console.error(">>> Error selecting connector. No codedata found");
            return;
        }
        selectedConnectorRef.current = connector;

        rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: null,
                filePath: "",
                id: connector.codedata,
            })
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

    const handleOnFormSubmit = async (data: FormValues) => {
        setIsPullingConnector(true);
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

            // get connections.bal file path
            const visualizerLocation = await rpcClient.getVisualizerLocation();
            let connectionsFilePath = "";
            if (visualizerLocation.projectUri) {
                connectionsFilePath = visualizerLocation.projectUri + "/connections.bal";
            }
            if (connectionsFilePath === "") {
                console.error(">>> Error updating source code. No connections.bal file found");
                return;
            }

            rpcClient
                .getBIDiagramRpcClient()
                .getSourceCode({
                    filePath: connectionsFilePath,
                    flowNode: updatedNode,
                    isConnector: true,
                })
                .then((response) => {
                    console.log(">>> Updated source code", response);
                    if (response.textEdits) {
                        // clear memory
                        setFields([]);
                        selectedNodeRef.current = undefined;
                        setIsPullingConnector(false);
                        onClose?.();
                    } else {
                        console.error(">>> Error updating source code", response);
                        // handle error
                    }
                });
        }
    };

    const handleOnBack = () => {
        setCurrentStep(WizardStep.CONNECTOR_LIST);
        setFields([]);
    };

    const handleSubPanel = (subPanel: SubPanel) => {
        setShowSubPanel(subPanel.view !== SubPanelView.UNDEFINED);
        setSubPanel(subPanel);
    };

    const updateExpressionField = (data: ExpressionFormField) => {
        setUpdatedExpressionField(data);
    };

    const findSubPanelComponent = (subPanel: SubPanel) => {
        switch (subPanel.view) {
            case SubPanelView.INLINE_DATA_MAPPER:
                return (
                    <InlineDataMapper
                        filePath={subPanel.props?.inlineDataMapper?.filePath}
                        range={subPanel.props?.inlineDataMapper?.range}
                    />
                );
            case SubPanelView.HELPER_PANEL:
                return (
                    <HelperView
                        filePath={subPanel.props.sidePanelData.filePath}
                        position={subPanel.props.sidePanelData.range}
                        updateFormField={updateExpressionField}
                        editorKey={subPanel.props.sidePanelData.editorKey}
                        onClosePanel={handleSubPanel}
                    />
                );
            default:
                return null;
        }
    };

    const handleResetUpdatedExpressionField = () => {
        setUpdatedExpressionField(undefined);
    };

    return (
        <Container>
            {isPullingConnector && (
                <LoadingContainer>
                    <PullingModuleLoader />
                    <Typography variant="h3" sx={{ marginTop: '16px' }}>Pulling packages</Typography>
                    <Typography variant="h4" sx={{ marginTop: '8px' }}>This might take some time</Typography>
                </LoadingContainer>
            )}
            {!isPullingConnector && currentStep === WizardStep.CONNECTOR_LIST && <ConnectorView onSelectConnector={handleOnSelectConnector} />}
            {!isPullingConnector && currentStep === WizardStep.CONNECTION_CONFIG && (
                <PanelContainer
                    show={true}
                    title={`Configure ${selectedConnectorRef.current?.metadata.label} Connector`}
                    onClose={onClose} width={600}
                    subPanelWidth={subPanel?.view === SubPanelView.INLINE_DATA_MAPPER ? 800 : 400}
                    subPanel={findSubPanelComponent(subPanel)}
                    onBack={handleOnBack}
                >
                    <BodyText style={{ padding: '20px 20px 0 20px' }}>
                            Provide the necessary configuration details for the selected connector to complete the setup.
                    </BodyText>
                    <ConnectionConfigView
                        name={selectedConnectorRef.current?.metadata.label}
                        fields={fields}
                        onSubmit={handleOnFormSubmit}
                        onBack={handleOnBack}
                        updatedExpressionField={updatedExpressionField}
                        resetUpdatedExpressionField={handleResetUpdatedExpressionField}
                        openSubPanel={handleSubPanel}
                        isActiveSubPanel={showSubPanel}

                    />
                </PanelContainer>
            )}
        </Container>
    );
}

export default AddConnectionWizard;
