/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import { MACHINE_VIEW, PopupMachineStateValue, PopupVisualizerLocation } from '@wso2-enterprise/ballerina-core';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import AddConnectionWizard from './views/Eggplant/Connection/AddConnectionWizard';

const ViewContainer = styled.div`
    height: 100vh;
`;

const PopupPanel = (props: { formState: PopupMachineStateValue }) => {
    const { rpcClient } = useRpcContext();
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
        rpcClient.getPopupVisualizerState().then((machineSate: PopupVisualizerLocation) => {
            switch (machineSate?.view) {
                case MACHINE_VIEW.AddConnectionWizard:
                    setViewComponent(<AddConnectionWizard onClose={() => {}} />);
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
