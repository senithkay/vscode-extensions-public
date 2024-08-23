/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { MACHINE_VIEW, PopupMachineStateValue, PopupVisualizerLocation } from '@wso2-enterprise/mi-core';
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { EndpointWizard } from './views/Forms/EndpointForm';
import styled from '@emotion/styled';
import { HttpEndpointWizard } from "./views/Forms/HTTPEndpointForm/index";
import { AddressEndpointWizard } from "./views/Forms/AddressEndpointForm";
import { WsdlEndpointWizard } from "./views/Forms/WSDLEndpointForm/index";
import { DefaultEndpointWizard } from "./views/Forms/DefaultEndpointForm";
import { LoadBalanceWizard } from './views/Forms/LoadBalanceEPform';
import { FailoverWizard } from './views/Forms/FailoverEndpointForm';
import { RecipientWizard } from './views/Forms/RecipientEndpointForm';
import { TemplateEndpointWizard } from './views/Forms/TemplateEndpointForm';
import { DataServiceDataSourceWizard } from "./views/Forms/DataServiceForm/MainPanelForms/DataSourceForm/DatasourceForm";
import path from 'path';
import { ConnectorStore } from './views/Forms/ConnectionForm';
import AddConnection from './views/Forms/ConnectionForm/ConnectionFormGenerator';
import { AddDriver } from './views/Popup/AddDriver';

const ViewContainer = styled.div`
    
    height: 100vh;
`;

const PopupPanel = (props: { formState: PopupMachineStateValue, handleClose?: () => void }) => {
    const { rpcClient } = useVisualizerContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();

    useEffect(() => {
        if (typeof props.formState === 'object' && 'open' in props.formState) {
            fetchContext();
        }
    }, [props.formState]);

    useEffect(() => {
        fetchContext();
    }, []);

    const fetchContext = () => {
        const endpointPath = new URL(path.join('src', 'main', 'wso2mi', 'artifacts', 'endpoints').toString(), window.location.origin).pathname;
        rpcClient.getPopupVisualizerState().then((machineSate: PopupVisualizerLocation) => {
            switch (machineSate?.view) {
                case MACHINE_VIEW.EndPointForm:
                    setViewComponent(<EndpointWizard handlePopupClose={props.handleClose} isPopup={true} path={machineSate.documentUri} />);
                    break;
                case MACHINE_VIEW.HttpEndpointForm:
                    setViewComponent(<HttpEndpointWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} type={machineSate.customProps.type} />);
                    break;
                case MACHINE_VIEW.AddressEndpointForm:
                    setViewComponent(<AddressEndpointWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} type={machineSate.customProps.type} />);
                    break;
                case MACHINE_VIEW.WsdlEndpointForm:
                    setViewComponent(<WsdlEndpointWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} type={machineSate.customProps.type} />);
                    break;
                case MACHINE_VIEW.DefaultEndpointForm:
                    setViewComponent(<DefaultEndpointWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} type={machineSate.customProps.type} />);
                    break;
                case MACHINE_VIEW.LoadBalanceEndPointForm:
                    setViewComponent(<LoadBalanceWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} />);
                    break;
                case MACHINE_VIEW.FailoverEndPointForm:
                    setViewComponent(<FailoverWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} />);
                    break;
                case MACHINE_VIEW.RecipientEndPointForm:
                    setViewComponent(<RecipientWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} />);
                    break;
                case MACHINE_VIEW.TemplateEndPointForm:
                    setViewComponent(<TemplateEndpointWizard handlePopupClose={props.handleClose} path={`${machineSate.documentUri}${endpointPath}`} />);
                    break;
                case MACHINE_VIEW.ConnectorStore:
                    setViewComponent(<ConnectorStore handlePopupClose={props.handleClose} isPopup={true} path={machineSate.documentUri} />);
                    break;
                case MACHINE_VIEW.DssDataSourceForm:
                    setViewComponent(<DataServiceDataSourceWizard path={machineSate.documentUri} datasource={machineSate.customProps.datasource} handlePopupClose={props.handleClose}/>);
                    break;
                case MACHINE_VIEW.ConnectionForm:
                    setViewComponent(
                        <AddConnection 
                            connectionName={machineSate.customProps.connectionName}
                            allowedConnectionTypes={machineSate.customProps.allowedConnectionTypes}
                            connector={machineSate.customProps.connector}
                            fromSidePanel={machineSate.customProps.fromSidePanel}
                            isPopup={true}
                            path={machineSate.documentUri}
                            handlePopupClose={props.handleClose}
                        />
                    );
                    break;
                case MACHINE_VIEW.AddDriverPopup:
                    setViewComponent(<AddDriver handlePopupClose={props.handleClose} path={machineSate.documentUri} identifier={machineSate.customProps.identifier} />);
                    break;
                default:
                    setViewComponent(null);
            }
        });
    }

    return (
        <ViewContainer>
            {viewComponent}
        </ViewContainer >
    );
};

export default PopupPanel;   
