/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useRef, useState } from 'react';
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
import SidePanelContext from './SidePanelContexProvider';
import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from '@vscode/webview-ui-toolkit/react';
import PayloadForm from './Pages/mediators/transformation/payload';
import HTTPEndpointForm from './Pages/endpoint/anonymous/http';
import FilterForm from './Pages/mediators/filter/filter';

const ButtonContainer = styled.div`
    text-align: center;
    padding: 5px;
`;

export interface SidePanelListProps {
    nodePosition: Range;
    documentUri: string;
}

const stackRef: string[] = [];
const SidePanelList = (props: SidePanelListProps) => {
    const sidePanelContext = React.useContext(SidePanelContext);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [connectorList, setConnectorList] = useState<GetConnectorsResponse[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [connectorForm, setForm] = useState<any>();
    const [mediatorForm, setMediatorForm] = useState<any>();
    const [showMediators, setShowMediators] = useState<boolean>(true);
    const [showConnectors, setShowConnectors] = useState<boolean>(true);
    const [showEndpoints, setShowEndpoints] = useState<boolean>(true);
    const [showMenu, setShowMenu] = useState<boolean>(true);

    const goBackRef = useRef(0);

    let mediators = {
        "core": [
            {
                title: "Call Mediator",
                operationName: "call",
                form: <CallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallForm>,
            },
            {
                title: "Call Template Mediator",
                operationName: "calltemplate",
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
        ],
        "transformation": [
            {
                title: "Payload Mediator",
                operationName: "payload",
                form: <PayloadForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PayloadForm>,
            }
        ],
        "filter": [
            {
                title: "Filter Mediator",
                operationName: "filter",
                form: <FilterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FilterForm>,
            }
        ]
    };

    const endpoints = [
        {
            title: "HTTP Endpoint",
            operationName: "http",
            form: <HTTPEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HTTPEndpointForm>,
        },
    ];

    const mediatorRulesOnPlus = [
        {
            name: "call",
            operations: ["endpoints"]
        },
        {
            name: "send",
            operations: ["endpoints"]
        },
        {
            name: "respond",
            operations: []
        },
        {
            name: "loopback",
            operations: []
        },
        {
            name: "drop",
            operations: []
        },
        {
            name: "filter",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "Validate",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "Switch",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "cache",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "throttle",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "aggregate",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "clone",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "entitlement",
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: "iterate",
            operations: ["mediators", "sequences", "connectors"],
            exception: ["send", "respond", "loopback", "drop"]
        },
        {
            name: "forEach",
            operations: ["mediators", "sequences", "connectors"],
            exception: ["send", "respond", "loopback", "drop"]
        },
        {
            name: "rule",
            operations: []
        }
    ];

    type MediatorsType = typeof mediators;

    useEffect(() => {
        let form;
        if (sidePanelContext.isEditing) {
            for (const key in mediators) {
                form = mediators[key as keyof typeof mediators].find((mediator) => mediator.operationName === sidePanelContext.operationName);
                if (form) break;
            }
            if (!form) form = endpoints.find((mediator) => mediator.operationName === sidePanelContext.operationName);
    
            if (form) {
                setShowMenu(false);
                setMediatorForm(form.form);
                return;
            }
        } else {
            const mediator = mediatorRulesOnPlus.find(m => m.name === sidePanelContext.operationName);

            // If the mediator is found
            if (mediator) {
                if (mediator.exception){
                    const filteredMediators: MediatorsType = {
                        core: [],
                        transformation: [],
                        filter: []
                    };

                    for (const category in mediators) {
                        filteredMediators[category as keyof typeof mediators] = mediators[category as keyof typeof mediators].filter(mediatorItem => !mediator.exception.includes(mediatorItem.operationName));
                    }
                    mediators = filteredMediators;
                }

                // Set the states based on the operations array
                setShowMediators(mediator.operations.includes("mediators"));
                setShowConnectors(mediator.operations.includes("connectors"));
                setShowEndpoints(mediator.operations.includes("endpoints"));                
            }
        }

        if (sidePanelContext.backBtn > goBackRef.current) {
            if (connectorForm) {
                sidePanelContext.setShowBackBtn(false);
                setForm(undefined);
            } else if (mediatorForm) {
                sidePanelContext.setShowBackBtn(false);
                setMediatorForm(undefined);
            } else if (actions.length > 0) {
                setActions([]);
            }
        }
        
        switch (stackRef.pop()) {
            case "mediators":
                setShowMediators(true);
                setShowMenu(true);
                break;
            case "connectors":
                setShowConnectors(true);
                setShowMenu(true);
                break;
            case "endpoints":
                setShowEndpoints(true);
                setShowMenu(true);
                break;
        }

        goBackRef.current = sidePanelContext.backBtn;
    }, [sidePanelContext.backBtn]);

    useEffect(() => {
        setLoading(true);

        (async () => {
            const connectors = await MIWebViewAPI.getInstance().getConnectors();
            setConnectorList(connectors);
            setLoading(false);
        })();
    }, []);

    const showConnectorForm = async (connectorSchema: any) => {
        sidePanelContext.setShowBackBtn(true);
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

    const showConnectorActions = async (connectorPath: string) => {
        sidePanelContext.setShowBackBtn(true);
        const actions = await MIWebViewAPI.getInstance().getConnector(connectorPath);
        setActions(actions.map((action: any) => JSON.parse(action)));
        stackRef.push("connectors");
        setShowConnectors(false);
        setShowMenu(false);
    };

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
        sidePanelContext.setShowBackBtn(false);
        setShowMediators(true);
        return Object.keys(mediators).length === 0 ? <h3 style={{ textAlign: "center" }}>No mediators found</h3> :
            <>
                {Object.entries(mediators).map(([key, values]) => (
                    <div key={key}>
                        <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                        {values.map((action) => (
                            <ButtonContainer key={action.title}>
                                <Button key={action.operationName} appearance='secondary' sx={{ width: "100%" }} onClick={() => showMediatorForm(action)}>
                                    {action.title.charAt(0).toUpperCase() + action.title.slice(1)}
                                </Button>
                            </ButtonContainer>
                        ))}
                        <hr style={{
                            borderColor: "var(--vscode-panel-border)",
                        }} />
                    </div>
                ))}
            </>
    }

    const showMediatorForm = async (mediator: any) => {
        sidePanelContext.setShowBackBtn(true);
        stackRef.push("mediators");
        setShowMediators(false);
        setShowMenu(false);
        setMediatorForm(mediator.form);
    };

    const EndpointList = () => {
        sidePanelContext.setShowBackBtn(false);
        setShowEndpoints(true);
        return endpoints.length === 0 ? <h3 style={{ textAlign: "center" }}>No endpoints found</h3> :
            <>
                {endpoints.map((endpoint) => (
                    <ButtonContainer key={endpoint.title}>
                        <Button key={endpoint.operationName} appearance='secondary' sx={{ width: "100%" }} onClick={() => showEndpointForm(endpoint)}>
                            {endpoint.title.charAt(0).toUpperCase() + endpoint.title.slice(1)}
                        </Button>
                    </ButtonContainer>
                ))}
            </>
    }

    const showEndpointForm = async (endpoint: any) => {
        sidePanelContext.setShowBackBtn(true);
        stackRef.push("endpoints");
        setShowEndpoints(false);
        setShowMenu(false);
        setMediatorForm(endpoint.form);
    };

    return (
        isLoading ? <h1>Loading...</h1> :
            <div style={{
                padding: "10px",
            }}>
                {showMenu && <VSCodePanels aria-label="Default">
                    {showMediators && <VSCodePanelTab id="tab-1">Mediators</VSCodePanelTab>}
                    {showConnectors && <VSCodePanelTab id="tab-2">Connectors</VSCodePanelTab>}
                    {showEndpoints && <VSCodePanelTab id="tab-3">Endpoints</VSCodePanelTab>}

                    {showConnectors && <VSCodePanelView id="view-1">
                        <div style={{ "width": "100%" }}>
                            {showMediators && <MediatorList />}
                        </div>
                    </VSCodePanelView>}

                    {showConnectors && <VSCodePanelView id="view-2">
                        <div style={{ "width": "100%" }}>
                            {showConnectors && <ConnectorList />}
                        </div>
                    </VSCodePanelView>}

                    {showEndpoints && <VSCodePanelView id="view-3">
                        <div style={{ "width": "100%" }}>
                             <EndpointList />
                        </div>
                    </VSCodePanelView>}
                </VSCodePanels>}

                {mediatorForm && <>{mediatorForm}</>}
                {actions.length > 0 && !connectorForm && <ActionList />}
                {connectorForm && <AddConnector formData={connectorForm} nodePosition={props.nodePosition} documentUri={props.documentUri} />}
            </div>
    );
};

export default SidePanelList;
