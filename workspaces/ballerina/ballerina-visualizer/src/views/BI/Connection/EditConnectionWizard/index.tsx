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
import { EVENT_TYPE, FlowNode, MACHINE_VIEW } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import ConnectionConfigView from "../ConnectionConfigView";
import { convertNodePropertiesToFormFields, getFormProperties, updateNodeProperties } from "../../../../utils/bi";
import { FormField, FormValues } from "@wso2-enterprise/ballerina-side-panel";
import { cloneDeep } from "lodash";
import { ProgressRing } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../../../resources/constants";

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
    connectionName: string;
    onClose?: () => void;
}

export function EditConnectionWizard(props: EditConnectionWizardProps) {
    const { connectionName, onClose } = props;
    const { rpcClient } = useRpcContext();

    const [fields, setFields] = useState<FormField[]>([]);
    const [connection, setConnection] = useState<FlowNode>();

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

    return (
        <Container>
            {!connection && (
                <SpinnerContainer>
                    <ProgressRing color={Colors.PRIMARY} />
                </SpinnerContainer>
            )}
            {connection && (
                <ConnectionConfigView name={connection.codedata.module} fields={fields} onSubmit={handleOnFormSubmit} />
            )}
        </Container>
    );
}

export default EditConnectionWizard;
