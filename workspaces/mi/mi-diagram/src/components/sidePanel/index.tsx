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
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import LogForm from './Pages/mediators/core/log';
import SendForm from './Pages/mediators/core/send';
import CallTemplateForm from './Pages/mediators/core/call-template';
import CallForm from './Pages/mediators/core/call';
import CalloutForm from './Pages/mediators/core/callout';
import DropForm from './Pages/mediators/core/drop';
import HeaderForm from './Pages/mediators/core/header';
import LoopbackForm from './Pages/mediators/core/loopback';
import PropertyForm from './Pages/mediators/core/property';
import PropertyGroupForm from './Pages/mediators/core/propertyGroup';
import RespondForm from './Pages/mediators/core/respond';
import SequenceForm from './Pages/mediators/core/sequence';
import StoreForm from './Pages/mediators/core/store';
import ValidateForm from './Pages/mediators/core/validate';

const ButtonContainer = styled.div`
    text-align: center;
    padding: 5px;
`;

export interface SidePanelListProps {
    nodePosition: Range;
    documentUri: string;
}

const SidePanelList = (props: SidePanelListProps) => {
    console.log(props.nodePosition);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [connectorList, setConnectorList] = useState<GetConnectorsResponse[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [connectorForm, setForm] = useState<any>();
    const [mediatorForm, setMediatorForm] = useState<any>();
    const mediators = [
        {
            title: "Call Mediator",
            operationName: "call",
            form: <CallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallForm>,
        },
        {
            title: "Call Template Mediator",
            operationName: "call-template",
            form: <CallTemplateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallTemplateForm>,
        },
        {
            title: "Callout Mediator",
            operationName: "callout",
            form: <CalloutForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CalloutForm>,
        },
        {
            title: "Drop Mediator",
            operationName: "drop",
            form: <DropForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DropForm>,
        },
        {
            title: "Header Mediator",
            operationName: "header",
            form: <HeaderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HeaderForm>,
        },
        {
            title: "Log Mediator",
            operationName: "log",
            form: <LogForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LogForm>,
        },
        {
            title: "Loopback Mediator",
            operationName: "loopback",
            form: <LoopbackForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoopbackForm>,
        },
        {
            title: "Property Mediator",
            operationName: "property",
            form: <PropertyForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyForm>,
        },
        {
            title: "Property Group Mediator",
            operationName: "propertygroup",
            form: <PropertyGroupForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyGroupForm>,
        },
        {
            title: "Respond Mediator",
            operationName: "respond",
            form: <RespondForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RespondForm>,
        },
        {
            title: "Send Mediator",
            operationName: "send",
            form: <SendForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SendForm>,
        },
        {
            title: "Sequence Mediator",
            operationName: "sequence",
            form: <SequenceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SequenceForm>,
        },
        {
            title: "Store Mediator",
            operationName: "store",
            form: <StoreForm nodePosition={props.nodePosition} documentUri={props.documentUri}></StoreForm>,
        },
        {
            title: "Validate Mediator",
            operationName: "validate",
            form: <ValidateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ValidateForm>,
        }
    ];

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

    const showMediatorForm = async (mediator: any) => {
        setMediatorForm(mediator.form);
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

    const MediatorList = () => {
        return mediators.length === 0 ? <h3 style={{ textAlign: "center" }}>No mediators found</h3> :
            <>
                {mediators.map((action) => (
                    <ButtonContainer key={action.title}>
                        <Button key={action.operationName} appearance='secondary' sx={{ width: "100%" }} onClick={() => showMediatorForm(action)}>
                            {action.title.charAt(0).toUpperCase() + action.title.slice(1)}
                        </Button>
                    </ButtonContainer>
                ))}
            </>
    }

    return (
        isLoading ? <h1>Loading...</h1> :
            <div>
                {mediators.length > 0 && !mediatorForm && !connectorForm  && actions.length == 0 && <MediatorList />}
                {connectorList && !mediatorForm && actions.length == 0 && <ConnectorList />}

                {mediatorForm && <>{mediatorForm}</>}
                {actions.length > 0 && !connectorForm && <ActionList />}
                {connectorForm && <AddConnector formData={connectorForm} nodePosition={props.nodePosition} documentUri={props.documentUri} />}
            </div>
    );
};

export default SidePanelList;
