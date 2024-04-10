/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import { FormView } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import CardWrapper from "./Commons/CardWrapper";

export interface EndpointWizardProps {
    path: string;
}

export function EndpointWizard(props: EndpointWizardProps) {

    const { rpcClient } = useVisualizerContext();

    const setEndpointType = (type: string) => {
        if (type === 'HTTP Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.HttpEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'endpoint'}
                }
            });
        } else if (type === 'WSDL Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.WsdlEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'endpoint'}
                }
            });
        } else if (type === 'Address Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.AddressEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'endpoint'}
                }
            });
        } else if (type === 'Default Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.DefaultEndpointForm,
                    documentUri: props.path,
                    customProps: {type: 'endpoint'}
                }
            });
        } else if (type === 'Failover Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.FailoverEndPointForm,
                    documentUri: props.path
                }
            });
        } else if (type === 'Load Balance Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.LoadBalanceEndPointForm,
                    documentUri: props.path
                }
            });
        } else if (type === 'Recipient List Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.RecipientEndPointForm,
                    documentUri: props.path
                }
            });
        } else if (type === 'Template Endpoint') {
            rpcClient.getMiVisualizerRpcClient().openView({
                type: EVENT_TYPE.OPEN_VIEW,
                location: {
                    view: MACHINE_VIEW.TemplateEndPointForm,
                    documentUri: props.path
                }
            });
        }
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    return (
        <FormView title={"Endpoint Artifact"} onClose={handleCancel}>
            <CardWrapper cardsType={"ENDPOINT"} setType={setEndpointType} />
        </FormView>
    );
}
