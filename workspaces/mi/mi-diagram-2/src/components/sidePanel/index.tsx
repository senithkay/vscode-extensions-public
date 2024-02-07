/* eslint-disable @typescript-eslint/ban-types */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Button, IconLabel } from '@wso2-enterprise/ui-toolkit';
import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { Connector } from '@wso2-enterprise/mi-core';
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
import AddressEndpointForm from './Pages/endpoint/anonymous/address';
import DefaultEndpointForm from './Pages/endpoint/anonymous/default';
import FailoverEndpointForm from './Pages/endpoint/anonymous/failover';
import LoadbalanceEndpointForm from './Pages/endpoint/anonymous/loadbalance';
import NamedEndpointForm from './Pages/endpoint/anonymous/namedEndpoint';
import RecipientListEndpointForm from './Pages/endpoint/anonymous/recipientList';
import TemplateEndpointForm from './Pages/endpoint/anonymous/template';
import WSDLEndpointForm from './Pages/endpoint/anonymous/wsdl';
// import { getSVGIcon } from '../nodes/mediators/Icons';
import DataMapperForm from './Pages/mediators/transformation/datamapper';
import EnrichForm from './Pages/mediators/transformation/enrich';
import FastXSLTForm from './Pages/mediators/transformation/fastXSLT';
import FaultForm from './Pages/mediators/transformation/fault';
import JSONTransformForm from './Pages/mediators/transformation/jsonTransform';
import RewriteForm from './Pages/mediators/transformation/rewrite';
import SmooksForm from './Pages/mediators/transformation/smooks';
import XQueryForm from './Pages/mediators/transformation/xquery';
import XSLTForm from './Pages/mediators/transformation/xslt';
import { MEDIATORS, ENDPOINTS } from '../../resources/constants';
import { LogIcon } from '../../resources';

const ButtonGrid = styled.div`
    display: grid;
    grid: 130px / auto auto auto auto;
`;

const ButtonContainer = styled.div`
    text-align: center;
    padding: 5px;
    width: 90px;
`;

export interface SidePanelListProps {
    nodePosition: Range;
    documentUri: string;
}

const stackRef: string[] = [];
const SidePanelList = (props: SidePanelListProps) => {
    const { rpcClient } = useVisualizerContext();

    const sidePanelContext = React.useContext(SidePanelContext);
    const [isLoading, setLoading] = useState<boolean>(true);
    const [connectorList, setConnectorList] = useState<Connector[]>([]);
    const [actions, setActions] = useState<any[]>([]);
    const [connectorForm, setConnectorForm] = useState<any>();
    const [mediatorForm, setMediatorForm] = useState<any>();
    const [showMediators, setShowMediators] = useState<boolean>(true);
    const [showConnectors, setShowConnectors] = useState<boolean>(true);
    const [showEndpoints, setShowEndpoints] = useState<boolean>(true);
    const [showMenu, setShowMenu] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<string>("mediators");

    function isEqualOperationName(operationName: String): unknown {
        return operationName && sidePanelContext.operationName && operationName.toLowerCase() === sidePanelContext.operationName.toLowerCase();
    }

    const goBackRef = useRef(0);

    let mediators = {
        "core": [
            {
                title: "Call",
                operationName: MEDIATORS.CALL,
                form: <CallForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallForm>,
            },
            {
                title: "Call Template",
                operationName: MEDIATORS.CALLTEMPLATE,
                form: <CallTemplateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CallTemplateForm>,
            },
            {
                title: "Callout",
                operationName: MEDIATORS.CALLOUT,
                form: <CalloutForm nodePosition={props.nodePosition} documentUri={props.documentUri}></CalloutForm>,
            },
            {
                title: "Drop",
                operationName: MEDIATORS.DROP,
                form: <DropForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DropForm>,
            },
            {
                title: "Header",
                operationName: MEDIATORS.HEADER,
                form: <HeaderForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HeaderForm>,
            },
            {
                title: "Log",
                operationName: MEDIATORS.LOG,
                form: <LogForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LogForm>,
            },
            {
                title: "Loopback",
                operationName: MEDIATORS.LOOPBACK,
                form: <LoopbackForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoopbackForm>,
            },
            {
                title: "Property",
                operationName: MEDIATORS.PROPERTY,
                form: <PropertyForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyForm>,
            },
            {
                title: "Property Group",
                operationName: MEDIATORS.PROPERTYGROUP,
                form: <PropertyGroupForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PropertyGroupForm>,
            },
            {
                title: "Respond",
                operationName: MEDIATORS.RESPOND,
                form: <RespondForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RespondForm>,
            },
            {
                title: "Send",
                operationName: MEDIATORS.SEND,
                form: <SendForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SendForm>,
            },
            {
                title: "Sequence",
                operationName: MEDIATORS.SEQUENCE,
                form: <SequenceForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SequenceForm>,
            },
            {
                title: "Store",
                operationName: MEDIATORS.STORE,
                form: <StoreForm nodePosition={props.nodePosition} documentUri={props.documentUri}></StoreForm>,
            },
            {
                title: "Validate",
                operationName: MEDIATORS.VALIDATE,
                form: <ValidateForm nodePosition={props.nodePosition} documentUri={props.documentUri}></ValidateForm>,
            }
        ],
        "transformation": [
            {
                title: "Data Mapper",
                operationName: MEDIATORS.DATAMAPPER,
                form: <DataMapperForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DataMapperForm>,
            },
            {
                title: "Enrich",
                operationName: MEDIATORS.ENRICH,
                form: <EnrichForm nodePosition={props.nodePosition} documentUri={props.documentUri}></EnrichForm>,
            },
            {
                title: "Fast XSLT",
                operationName: MEDIATORS.FASTXSLT,
                form: <FastXSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FastXSLTForm>,
            },
            {
                title: "Fault",
                operationName: MEDIATORS.FAULT,
                form: <FaultForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FaultForm>,
            },
            {
                title: "Json Transform",
                operationName: MEDIATORS.JSONTRANSFORM,
                form: <JSONTransformForm nodePosition={props.nodePosition} documentUri={props.documentUri}></JSONTransformForm>,
            },
            {
                title: "Payload",
                operationName: MEDIATORS.PAYLOAD,
                form: <PayloadForm nodePosition={props.nodePosition} documentUri={props.documentUri}></PayloadForm>,
            },
            {
                title: "Rewrite",
                operationName: MEDIATORS.REWRITE,
                form: <RewriteForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RewriteForm>,
            },
            {
                title: "Smooks",
                operationName: MEDIATORS.SMOOKS,
                form: <SmooksForm nodePosition={props.nodePosition} documentUri={props.documentUri}></SmooksForm>,
            },
            {
                title: "xquery",
                operationName: MEDIATORS.XQUERY,
                form: <XQueryForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XQueryForm>,
            },
            {
                title: "XSLT",
                operationName: MEDIATORS.XSLT,
                form: <XSLTForm nodePosition={props.nodePosition} documentUri={props.documentUri}></XSLTForm>,
            }
        ],
        "filter": [
            {
                title: "Filter",
                operationName: MEDIATORS.FILTER,
                form: <FilterForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FilterForm>,
            }
        ]
    };

    const endpoints = [
        {
            title: "Address Endpoint",
            operationName: ENDPOINTS.ADDRESS,
            form: <AddressEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></AddressEndpointForm>,
        },
        {
            title: "Default Endpoint",
            operationName: ENDPOINTS.DEFAULT,
            form: <DefaultEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></DefaultEndpointForm>,
        },
        {
            title: "Failover Endpoint",
            operationName: ENDPOINTS.FAILOVER,
            form: <FailoverEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></FailoverEndpointForm>,
        },
        {
            title: "HTTP Endpoint",
            operationName: ENDPOINTS.HTTP,
            form: <HTTPEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></HTTPEndpointForm>,
        },
        {
            title: "Loadbalance Endpoint",
            operationName: ENDPOINTS.LOADBALANCE,
            form: <LoadbalanceEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></LoadbalanceEndpointForm>,
        },
        {
            title: "Named Endpoint",
            operationName: ENDPOINTS.NAMED,
            form: <NamedEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></NamedEndpointForm>,
        },
        {
            title: "Recipient List Endpoint",
            operationName: ENDPOINTS.RECIPIENTLIST,
            form: <RecipientListEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></RecipientListEndpointForm>,
        },
        {
            title: "Template Endpoint",
            operationName: ENDPOINTS.TEMPLATE,
            form: <TemplateEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></TemplateEndpointForm>,
        },
        {
            title: "WSDL Endpoint",
            operationName: ENDPOINTS.WSDL,
            form: <WSDLEndpointForm nodePosition={props.nodePosition} documentUri={props.documentUri}></WSDLEndpointForm>,
        }
    ];

    const mediatorRulesOnPlus = [
        {
            name: MEDIATORS.CALL,
            operations: ["endpoints"]
        },
        {
            name: MEDIATORS.SEND,
            operations: ["endpoints"]
        },
        {
            name: MEDIATORS.RESPOND,
            operations: []
        },
        {
            name: MEDIATORS.LOOPBACK,
            operations: []
        },
        {
            name: MEDIATORS.DROP,
            operations: []
        },
        {
            name: MEDIATORS.FILTER,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.VALIDATE,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.SWITCH,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.CACHE,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.THROTTLE,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.AGGREGATE,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.CLONE,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.ENTITLEMENT,
            operations: ["mediators", "sequences", "connectors"]
        },
        {
            name: MEDIATORS.ITERATE,
            operations: ["mediators", "sequences", "connectors"],
            exception: ["send", "respond", "loopback", "drop"]
        },
        {
            name: MEDIATORS.FOREACH,
            operations: ["mediators", "sequences", "connectors"],
            exception: ["send", "respond", "loopback", "drop"]
        },
        {
            name: MEDIATORS.RULE,
            operations: []
        }
    ];

    type MediatorsType = typeof mediators;

    useEffect(() => {
        sidePanelContext.setShowBackBtn(false);
        let form;
        if (sidePanelContext.isEditing) {
            for (const key in mediators) {
                form = mediators[key as keyof typeof mediators].find((mediator) => isEqualOperationName(mediator.operationName));
                if (form) break;
            }
            if (!form) form = endpoints.find((mediator) => isEqualOperationName(mediator.operationName));

            if (form) {
                setShowMenu(false);
                setMediatorForm(form.form);
                return;
            }
        } else {
            const mediator = mediatorRulesOnPlus.find((mediator) => isEqualOperationName(mediator.name));

            // If the mediator is found
            if (mediator) {
                if (mediator.exception) {
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
                sidePanelContext.setShowBackBtn(true);
                setShowMenu(false);
                setConnectorForm(undefined);
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
            case "connector":
                setMediatorForm(undefined);
                return;
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
            const connectors = await rpcClient.getMiDiagramRpcClient().getConnectors();
            setConnectorList(connectors.data);
            setLoading(false);
        })();
    }, []);

    const ConnectorList = () => {
        return connectorList.length === 0 ? <h3 style={{ textAlign: "center" }}>No connectors found</h3> :
            <ButtonGrid>
                {connectorList.map((connector) => (
                    <ButtonContainer key={connector.name} >
                        <Button key={connector.name} appearance='icon' sx={{ width: "90px", height: "120px", padding: "5px 0" }} onClick={() => showConnectorActions(connector.path)}>
                            <div>
                                <img src={`data:image/png;base64, ${connector.icon}`} alt="Connector Icon" style={{ width: "70px", height: "70px" }} />
                                <div style={{ marginTop: "15px" }}>
                                    <IconLabel>
                                        {connector.name.charAt(0).toUpperCase() + connector.name.slice(1)}
                                    </IconLabel>
                                </div>
                            </div>
                        </Button>
                    </ButtonContainer>
                ))}
            </ButtonGrid>
    }

    const showConnectorActions = async (connectorPath: string) => {
        sidePanelContext.setShowBackBtn(true);
        const actions = await rpcClient.getMiDiagramRpcClient().getConnector({ path: connectorPath});
        setActions(actions.data.map((action: any) => JSON.parse(action)));
        stackRef.push("connectors");
        setShowConnectors(false);
        setShowMenu(false);
    };

    const ActionList = () => {
        return actions.length === 0 ? <h3 style={{ textAlign: "center" }}>No actions found</h3> :
            <>
                {actions.map((action) => (
                    <ButtonContainer key={action.title} style={{ width: "100%" }}>
                        <Button key={action.operationName} appearance='secondary' sx={{ width: "100%" }} onClick={() => showConnectorForm(action)}>
                            {action.title.charAt(0).toUpperCase() + action.title.slice(1)}
                        </Button>
                    </ButtonContainer>
                ))}
            </>
    }

    const showConnectorForm = async (connectorSchema: any) => {
        sidePanelContext.setShowBackBtn(true);
        stackRef.push("connector");
        setConnectorForm(connectorSchema);
    };

    const MediatorList = () => {
        return Object.keys(mediators).length === 0 ? <h3 style={{ textAlign: "center" }}>No mediators found</h3> :
            <>
                {Object.entries(mediators).map(([key, values]) => (
                    <div key={key}>
                        <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
                        <ButtonGrid>
                            {values.map((action) => (
                                <ButtonContainer key={action.title}>
                                    <Button key={action.operationName} appearance='icon' sx={{ width: "90px", height: "120px", padding: "5px 0" }} onClick={() => showMediatorForm(action)}>
                                        <div style={{ width: "90px"}}>
                                            {/* {getSVGIcon(action.operationName, null, 70, 70)} */}
                                            <LogIcon />
                                            <div style={{ marginTop: "15px" }}>
                                                <IconLabel>{action.title.charAt(0).toUpperCase() + action.title.slice(1)}</IconLabel>
                                            </div>
                                        </div>
                                    </Button>
                                </ButtonContainer>
                            ))}
                        </ButtonGrid>
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
        return endpoints.length === 0 ? <h3 style={{ textAlign: "center" }}>No endpoints found</h3> :
            <ButtonGrid>
                {endpoints.map((endpoint) => (
                    <ButtonContainer key={endpoint.title}>
                        <Button key={endpoint.operationName} appearance='icon' sx={{ width: "90px", height: "120px", padding: "5px 0" }} onClick={() => showEndpointForm(endpoint)}>
                            <div>
                                {/* {getSVGIcon(endpoint.operationName, null, 70, 70)} */}
                                <div style={{ marginTop: "15px" }}>
                                    <IconLabel>{endpoint.title.charAt(0).toUpperCase() + endpoint.title.slice(1)}</IconLabel>
                                </div>
                            </div>
                        </Button>
                    </ButtonContainer>
                ))}
            </ButtonGrid>
    }

    const showEndpointForm = async (endpoint: any) => {
        sidePanelContext.setShowBackBtn(true);
        stackRef.push("endpoints");
        setShowEndpoints(false);
        setShowMenu(false);
        setMediatorForm(endpoint.form);
    };

    return (
        isLoading ? <h1>Loading...S</h1> :
            <div style={{
                padding: "10px",
                height: "calc(100% - 70px)",
                overflowY: "auto",
            }}>
                {showMenu && <VSCodePanels aria-label="Default" activeid={activeTab}>
                    {showConnectors && <VSCodePanelTab id="mediators" onClick={(e: any) => { setActiveTab(e.target.id) }}>Mediators</VSCodePanelTab>}
                    {showConnectors && <VSCodePanelTab id="connectors" onClick={(e: any) => { setActiveTab(e.target.id) }}>Connectors</VSCodePanelTab>}
                    {showEndpoints && <VSCodePanelTab id="endpoints" onClick={(e: any) => { setActiveTab(e.target.id) }}>Endpoints</VSCodePanelTab>}

                    {showMediators && <VSCodePanelView id="mediators">
                        <div style={{ "width": "100%" }}>
                            <MediatorList />
                        </div>
                    </VSCodePanelView>}

                    {showConnectors && <VSCodePanelView id="connectors">
                        <div style={{ "width": "100%" }}>
                            <ConnectorList />
                        </div>
                    </VSCodePanelView>}

                    {showEndpoints && <VSCodePanelView id="endpoints">
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
