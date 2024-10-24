/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { EVENT_TYPE, FlowNode, LinePosition, MACHINE_VIEW, SubPanel, SubPanelView } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import ConnectionConfigView from "../ConnectionConfigView";
import { convertNodePropertiesToFormFields, getFormProperties, updateNodeProperties } from "../../../../utils/bi";
import { ExpressionFormField, FormField, FormValues, PanelContainer } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";
import { ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../../../resources/constants";
import { InlineDataMapper } from "../../../InlineDataMapper";
import { HelperView } from "../../HelperView";

const Container = styled.div`
    width: 100%;
    height: 100%;
`;

const SpinnerContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

interface EditConnectionWizardProps {
    fileName: string; // file path of `connection.bal`
    connectionName: string;
    onClose?: () => void;
}

export function EditConnectionWizard(props: EditConnectionWizardProps) {
    const { fileName, connectionName, onClose } = props;
    const { rpcClient } = useRpcContext();

    const [fields, setFields] = useState<FormField[]>([]);
    const [connection, setConnection] = useState<FlowNode>();
    const [subPanel, setSubPanel] = useState<SubPanel>({ view: SubPanelView.UNDEFINED });
    const [showSubPanel, setShowSubPanel] = useState(false);
    const [updatedExpressionField, setUpdatedExpressionField] = useState<ExpressionFormField>(undefined);

    useEffect(() => {
        rpcClient
            .getBIDiagramRpcClient()
            .getModuleNodes()
            .then((res) => {
                console.log(">>> moduleNodes", { moduleNodes: res });
                if (!res.flowModel.connections || res.flowModel.connections.length === 0) {
                    return;
                }
                const connector = res.flowModel.connections.find(
                    (node) => node.properties.variable.value === connectionName
                );
                if (!connector) {
                    console.error(">>> Error finding connector", { connectionName });
                    return;
                }
                setConnection(connector);
                const formProperties = getFormProperties(connector);
                console.log(">>> Connector form properties", formProperties);
                setFields(convertNodePropertiesToFormFields(formProperties));
            });
    }, [connectionName]);

    const handleOnFormSubmit = async (data: FormValues) => {
        console.log(">>> on form submit", data);
        if (connection) {
            let updatedNode: FlowNode = cloneDeep(connection);

            if (connection.properties) {
                // node properties
                const updatedNodeProperties = updateNodeProperties(data, connection.properties);
                updatedNode.properties = updatedNodeProperties;
            } else {
                console.error(">>> Error updating source code. No properties found");
            }
            console.log(">>> Updated node", updatedNode);

            if (fileName === "") {
                console.error(">>> Error updating source code. No connections.bal file found");
                return;
            }

            rpcClient
                .getBIDiagramRpcClient()
                .getSourceCode({
                    filePath: fileName,
                    flowNode: updatedNode,
                    isConnector: true,
                })
                .then((response) => {
                    console.log(">>> Updated source code", response);
                    if (response.textEdits) {
                        // clear memory
                        setFields([]);
                        if (onClose) {
                            onClose();
                        } else {
                            gotoHome();
                        }
                    } else {
                        console.error(">>> Error updating source code", response);
                        // handle error
                    }
                });
        }
    };

    const gotoHome = () => {
        rpcClient.getVisualizerRpcClient().openView({
            type: EVENT_TYPE.OPEN_VIEW,
            location: {
                view: MACHINE_VIEW.Overview,
            },
        });
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
            {!connection && (
                <SpinnerContainer>
                    <ProgressRing color={Colors.PRIMARY} />
                </SpinnerContainer>
            )}
            {connection && (
                <PanelContainer
                    show={true}
                    title={`Configure ${connection.codedata.module} Connector`}
                    onClose={onClose}
                    width={600}
                    onBack={onClose}
                    subPanelWidth={subPanel?.view === SubPanelView.INLINE_DATA_MAPPER ? 800 : 400}
                    subPanel={findSubPanelComponent(subPanel)}
                >
                    <ConnectionConfigView
                        fileName={fileName}
                        fields={fields}
                        onSubmit={handleOnFormSubmit}
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

export default EditConnectionWizard;
