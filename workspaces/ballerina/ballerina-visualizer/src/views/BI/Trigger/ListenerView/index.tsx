/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import { AvailableNode, BallerinaTrigger, Item, Triggers, ServicesByListenerResponse, NodePosition, EVENT_TYPE, MachineStateValue } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import { Accordion, Codicon, ComponentCard, ProgressRing, SearchBox, Typography } from "@wso2-enterprise/ui-toolkit";
import { cloneDeep, debounce } from "lodash";
import ButtonCard from "../../../../components/ButtonCard";
import { BodyText } from "../../../styles";
import { useVisualizerContext } from "../../../../Context";
import { BIHeader } from "../../BIHeader";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";

const Container = styled.div`
    padding: 0 20px;
    width: 100%;
`;

const ListContainer = styled.div`
    display: block;
    margin-top: 30px;
    width: 100%;
`;


const ListItem = styled.div`
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
        cursor: pointer;
    }
    width: 100%;
    padding: 0px 20px 0px 20px;
    display: flex;
    flex-direction: row;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
`;


interface ListenerViewProps {
    position: NodePosition;
}

export function ListenerView(props: ListenerViewProps) {
    const { position } = props;
    const { rpcClient } = useRpcContext();
    const [listener, setListener] = useState<ServicesByListenerResponse>(undefined);
    const [loading, setLoading] = useState<boolean>(true);


    useEffect(() => {
        getListenerDetails();
    }, [position]);

    const getListenerDetails = async () => {
        setLoading(true);
        const response = await rpcClient.getTriggerWizardRpcClient().getServicesByListener({});
        setListener(response);
        setLoading(false);
    };

    const goToService = (filePath: string, position: NodePosition) => {
        rpcClient
            .getVisualizerRpcClient()
            .openView({ type: EVENT_TYPE.OPEN_VIEW, location: { documentUri: filePath, position: position } });
    }


    return (
        <Container>
            <BIHeader />
            <Header>
                <Typography variant="h2">{listener?.trigger?.displayName} Listener Config</Typography>
                <VSCodeButton appearance="primary" onClick={() => { }}>
                    <Codicon name="add" sx={{ marginRight: 5 }} /> Add Service
                </VSCodeButton>
            </Header>
            <BodyText>
                Available Services
                <ListContainer>
                    {loading &&
                        <div>
                            <ProgressRing sx={{ height: "16px", width: "16px" }} />
                            Loading...
                        </div>
                    }
                    {listener?.services.map((service, index) => (
                        <ListItem key={index} onClick={() => goToService(service.filePath, service.service.position)}>
                            <Typography variant="h3">{service.name}</Typography>
                        </ListItem>
                    ))}
                </ListContainer>
            </BodyText>
        </Container>
    );
}

export default ListenerView;
