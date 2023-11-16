/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { MIWebViewAPI } from '../../utils/WebViewRpc';
import { GetConnectorsResponse } from '@wso2-enterprise/mi-core';
import AddConnector from './Pages/AddConnector';
import { Range } from '@wso2-enterprise/mi-core/src/types';

const ButtonContainer = styled.div`
    text-align: center;
    padding: 5px;
`;

export interface SidePanelListProps {
    nodePosition: Range;
    documentUri: string;
}

const SidePanelList = (props: SidePanelListProps) => {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [connectorList, setConnectorList] = useState<GetConnectorsResponse[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [form, setForm] = useState<any>();

    useEffect(() => {
        setLoading(true);

        (async () => {
            const connectors = await MIWebViewAPI.getInstance().getConnectors();
            setConnectorList(connectors);
            setLoading(false);
        })();
    }, []);

    const showConnectorActions = async (connectorPath: string) => {
        const actions = await MIWebViewAPI.getInstance().getConnector(connectorPath);
        setActions(actions.map((action: any) => JSON.parse(action)));
    };

    const showConnectorForm = async (connectorSchema: any) => {
        setForm(connectorSchema);
    };

    const ConnectorList = () => {
        return connectorList.length === 0 ? <h3 style={{ textAlign: "center" }}>No connectors found</h3> :
            <>
                {connectorList.map((connector) => (
                    <ButtonContainer key={connector.name} >
                        <Button key={connector.name} appearance='secondary' sx={{ width: "100%" }} onClick={() => showConnectorActions(connector.path)}>
                            {connector.name.charAt(0).toUpperCase() + connector.name.slice(1)}
                            <br />
                            {connector.description}
                        </Button>
                    </ButtonContainer>
                ))}
            </>
    }

    const ActionList = () => {
        return actions.length === 0 ? <h3 style={{ textAlign: "center" }}>No actions found</h3> :
            <>
                {actions.map((action) => (
                    <ButtonContainer key={action.title}>
                        <Button key={action.operationName} appearance='secondary' sx={{ width: "100%" }} onClick={() => showConnectorForm(action)}>
                            {action.title.charAt(0).toUpperCase() + action.title.slice(1)}
                        </Button>
                    </ButtonContainer>
                ))}
            </>
    }

    return (
        isLoading ? <h1>Loading...</h1> :
            <div>
                {connectorList && actions.length == 0 && <ConnectorList />}
                {actions.length > 0 && !form && <ActionList />}
                {form && <AddConnector formData={form} nodePosition={props.nodePosition} documentUri={props.documentUri} />}
            </div>
    );
};

export default SidePanelList;
