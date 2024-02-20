/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useEffect, useMemo, useState } from 'react';
import { MachineStateValue, MachineViews, VisualizerLocation } from '@wso2-enterprise/ballerina-core';
import { useVisualizerContext } from '@wso2-enterprise/ballerina-rpc-client';
/** @jsx jsx */
import { Global, css } from '@emotion/react';
import styled from "@emotion/styled";

import { NavigationBar } from "./components/NavigationBar"
import { LoadingRing } from "./components/Loader";


import { ArchitectureDiagram } from './views/ArchitectureDiagram';
import { DataMapper } from './views/DataMapper';
import { ERDiagram } from './views/ERDiagram';
import { GraphQLDiagram } from './views/GraphQLDiagram';
import { Overview } from './views/Overview';
import { SequenceDiagram } from './views/SequenceDiagram';
import { ServiceDesigner } from './views/ServiceDesigner';
import { TypeDiagram } from './views/TypeDiagram';

const globalStyles = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;

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
        if (typeof newState === 'object' && 'viewActive' in newState && newState.viewActive === 'viewReady') {
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
            return <LoadingRing />;
        }
        switch (visualizerLocation?.view) {
            case "Overview":
                return <Overview />;
            case "ArchitectureDiagram":
                return <ArchitectureDiagram />
            case "ServiceDesigner":
                return <ServiceDesigner />
            case "ERDiagram":
                return <ERDiagram />
            case "DataMapper":
                return (
                    <DataMapper
                        filePath={visualizerLocation.documentUri}
                        fnLocation={visualizerLocation.position}
                    />
                );
            case "GraphQLDiagram":
                return <GraphQLDiagram />
            case "SequenceDiagram":
                return <SequenceDiagram />
            case "TypeDiagram":
                return <TypeDiagram />
            default:
                return <LoadingRing />;
        }
    }, [visualizerLocation?.view]);

    return (
        <>
            <Global styles={globalStyles} />
            <VisualizerContainer>
                <NavigationBar />
                <ComponentViewWrapper>
                    {viewComponent}
                </ComponentViewWrapper>
            </VisualizerContainer>
        </>
    );
};

export default MainPanel;
