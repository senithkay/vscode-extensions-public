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
import {
    AvailableNode,
    EVENT_TYPE,
    FlowNode,
    LinePosition,
    MACHINE_VIEW,
    SubPanel,
    SubPanelView,
} from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import ConnectorView from "../ConnectorView";
import ConnectionConfigView from "../ConnectionConfigView";
import { convertNodePropertiesToFormFields, getFormProperties, updateNodeProperties } from "../../../../utils/bi";
import { ExpressionFormField, FormField, FormValues, PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";
import { Overlay, ThemeColors, Typography } from "@wso2-enterprise/ui-toolkit";
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
    fileName: string; // file path of `connection.bal`
    target?: LinePosition;
    onClose?: () => void;
}

export function AddConnectionWizard(props: AddConnectionWizardProps) {
    const { fileName, target, onClose } = props;
    const { rpcClient } = useRpcContext();

    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.CONNECTOR_LIST);
    const [isPullingConnector, setIsPullingConnector] = useState<boolean>(false);
    const selectedConnectorRef = useRef<AvailableNode>();
    const selectedNodeRef = useRef<FlowNode>();
    const [subPanel, setSubPanel] = useState<SubPanel>({ view: SubPanelView.UNDEFINED });
    const [showSubPanel, setShowSubPanel] = useState(false);
    const [updatedExpressionField, setUpdatedExpressionField] = useState<ExpressionFormField>(undefined);
    const [fetchingInfo, setFetchingInfo] = useState<boolean>(false);

    const handleOnSelectConnector = async (connector: AvailableNode) => {
        if (!connector.codedata) {
            console.error(">>> Error selecting connector. No codedata found");
            return;
        }
        selectedConnectorRef.current = connector;
        setFetchingInfo(true);

        rpcClient
            .getBIDiagramRpcClient()
            .getNodeTemplate({
                position: target || null,
                filePath: fileName,
                id: connector.codedata,
            })
            .then((response) => {
                console.log(">>> FlowNode template", response);
                selectedNodeRef.current = response.flowNode;
                const formProperties = getFormProperties(response.flowNode);
                console.log(">>> Form properties", formProperties);
                if (Object.keys(formProperties).length === 0) {
                    // add node to source code
                    handleOnFormSubmit(response.flowNode);
                    return;
                }
                // get node properties
                setCurrentStep(WizardStep.CONNECTION_CONFIG);
            })
            .finally(() => {
                setFetchingInfo(false);
            });
    };

    const handleOnFormSubmit = async (node: FlowNode) => {
        console.log(">>> on form submit", node);
        if (selectedNodeRef.current) {
            setIsPullingConnector(true);            

            // get connections.bal file path
            const visualizerLocation = await rpcClient.getVisualizerLocation();
            let connectionsFilePath = "";
            if (visualizerLocation.projectUri) {
                connectionsFilePath = visualizerLocation.projectUri + "/connections.bal";
            }
            if (connectionsFilePath === "") {
                console.error(">>> Error updating source code. No connections.bal file found");
                setIsPullingConnector(false);
                return;
            }

            // node property scope is local. then use local file path and line position
            if ((node.properties?.scope?.value as string)?.toLowerCase() === "local") {
                connectionsFilePath = visualizerLocation.documentUri;
                node.codedata.lineRange = {
                    fileName: visualizerLocation.documentUri,
                    startLine: target,
                    endLine: target,
                };
            }

            rpcClient
                .getBIDiagramRpcClient()
                .getSourceCode({
                    filePath: connectionsFilePath,
                    flowNode: node,
                    isConnector: true,
                })
                .then((response) => {
                    console.log(">>> Updated source code", response);
                    if (response.textEdits) {
                        // clear memory
                        selectedNodeRef.current = undefined;
                        onClose ? onClose() : gotoHome();
                    } else {
                        console.error(">>> Error updating source code", response);
                        // handle error
                    }
                })
                .finally(() => {
                    setIsPullingConnector(false);
                });
        }
    };

    const handleOnBack = () => {
        setCurrentStep(WizardStep.CONNECTOR_LIST);
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
                        onClosePanel={handleSubPanel}
                        updateFormField={updateExpressionField}
                        {...subPanel.props?.inlineDataMapper}
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
                        configurePanelData={subPanel.props.sidePanelData?.configurePanelData}
                    />
                );
            default:
                return null;
        }
    };

    const handleResetUpdatedExpressionField = () => {
        setUpdatedExpressionField(undefined);
    };

    const gotoHome = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.Overview,
            },
        });
    };

    return (
        <Container>
            {isPullingConnector && (
                <LoadingContainer>
                    <PullingModuleLoader />
                    <Typography variant="h3" sx={{ marginTop: "16px" }}>
                        Pulling packages
                    </Typography>
                    <Typography variant="h4" sx={{ marginTop: "8px" }}>
                        This might take some time
                    </Typography>
                </LoadingContainer>
            )}
            {!isPullingConnector && (
                <>
                    <ConnectorView
                        onSelectConnector={handleOnSelectConnector}
                        fetchingInfo={fetchingInfo}
                        onClose={onClose}
                    />
                    {currentStep === WizardStep.CONNECTION_CONFIG && (
                        <Overlay sx={{ background: `${ThemeColors.SURFACE_CONTAINER}`, opacity: `0.3`, zIndex: 2000 }} />
                    )}
                </>
            )}
            {!isPullingConnector && !fetchingInfo && currentStep === WizardStep.CONNECTION_CONFIG && (
                <PanelContainer
                    show={true}
                    title={`Configure the ${selectedConnectorRef.current?.metadata.label || ""} Connector`}
                    onClose={onClose ? onClose : handleOnBack}
                    width={400}
                    subPanelWidth={subPanel?.view === SubPanelView.INLINE_DATA_MAPPER ? 800 : 400}
                    subPanel={findSubPanelComponent(subPanel)}
                    onBack={handleOnBack}
                >
                    <>
                        <BodyText style={{ padding: "20px 20px 0 20px" }}>
                            Provide the necessary configuration details for the selected connector to complete the
                            setup.
                        </BodyText>
                        <ConnectionConfigView
                            fileName={fileName}
                            selectedNode={selectedNodeRef.current}
                            onSubmit={handleOnFormSubmit}
                            updatedExpressionField={updatedExpressionField}
                            resetUpdatedExpressionField={handleResetUpdatedExpressionField}
                            openSubPanel={handleSubPanel}
                        />
                    </>
                </PanelContainer>
            )}
        </Container>
    );
}

export default AddConnectionWizard;
