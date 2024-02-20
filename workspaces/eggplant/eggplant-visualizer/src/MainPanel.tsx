/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client";
import { MachineStateValue, VisualizerLocation } from "@wso2-enterprise/eggplant-core";
import { ServiceDesignerView, Resource } from "@wso2-enterprise/service-designer-view";
import LowCode from "./views/EggplantDiagram";
import { Loader } from './components/Loader';
import styled from '@emotion/styled';
import { NavigationBar } from './components/NavigationBar';
import EggplantDiagram from './views/EggplantDiagram';
import ActivityPanel from './views/ActivityPanel';
import Overview from './views/Overview';
import { ServiceDesigner } from './views/ServiceDesigner';


const VisualizerContainer = styled.div`
    width: 100%;
    height: 100%;
`;

const ComponentViewWrapper = styled.div`
    height: 100vh;
`;

const MainPanel = () => {
    const { rpcClient } = useVisualizerContext();
    const [visualizerLocation, setVisualizerLocation] = useState<VisualizerLocation>();

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        if (typeof newState === 'object' && 'ready' in newState && newState.ready === 'viewReady') {
            fetchContext();
        }
    });

    const fetchContext = () => {
        rpcClient.getVisualizerLocation().then((value) => {
            setVisualizerLocation(value);
        });
    }

    useEffect(() => {
        fetchContext();
    }, []);

    const viewComponent = useMemo(() => {
        if (!visualizerLocation?.view) {
            return <Loader />;
        }
        switch (visualizerLocation?.view) {
            case "Overview":
                return <Overview />;
            case "EggplantDiagram":
                return <EggplantDiagram />
            case "ServiceDesigner":
                return <ServiceDesigner />
            default:
                return <Loader />;
        }
    }, [visualizerLocation?.view]);


    return (
        <div>
            <VisualizerContainer>
                <NavigationBar />
                <ComponentViewWrapper>
                    {viewComponent}
                </ComponentViewWrapper>
            </VisualizerContainer>
        </div>
    );
};

export default MainPanel;

