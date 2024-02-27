/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useEffect, useMemo, useState } from 'react';
import { KeyboardNavigationManager, MachineStateValue, MachineViews, VisualizerLocation } from '@wso2-enterprise/ballerina-core';
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
import { handleRedo, handleUndo } from './utils/utils';
import { FunctionDefinition, ServiceDeclaration } from '@wso2-enterprise/syntax-tree';

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
    height: calc(100% - 24px);
`;

const MainPanel = () => {
    const { rpcClient } = useVisualizerContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();

    rpcClient?.onStateChanged((newState: MachineStateValue) => {
        if (typeof newState === 'object' && 'viewActive' in newState && newState.viewActive === 'viewReady') {
            fetchContext();
        }
    });

    const fetchContext = () => {
        rpcClient.getVisualizerLocation().then((value) => {
            if (!value?.view) {
                setViewComponent(<LoadingRing />);
            } else {
                switch (value?.view) {
                    case "Overview":
                        setViewComponent(<Overview visualizerLocation={value} />);
                        break;
                    case "ArchitectureDiagram":
                        setViewComponent(<ArchitectureDiagram />);
                        break;
                    case "ServiceDesigner":
                        setViewComponent(<ServiceDesigner model={value?.syntaxTree as ServiceDeclaration} />);
                        break;
                    case "ERDiagram":
                        setViewComponent(<ERDiagram />);
                        break;
                    case "DataMapper":
                        setViewComponent((
                            <DataMapper
                                filePath={value.documentUri}
                                model={value?.syntaxTree as FunctionDefinition}
                            />
                        ));
                        break;
                    case "GraphQLDiagram":
                        setViewComponent(<GraphQLDiagram />);
                        break;
                    case "SequenceDiagram":
                        setViewComponent(<SequenceDiagram />);
                        break;
                    case "TypeDiagram":
                        setViewComponent(<TypeDiagram />);
                        break;
                    default:
                        setViewComponent(<LoadingRing />);
                }
            }
        });
    }

    useEffect(() => {
        fetchContext();
    }, []);

    useEffect(() => {
        if (visualizerLocation?.view) {
            const mouseTrapClient = KeyboardNavigationManager.getClient();
            mouseTrapClient.bindNewKey(['command+z', 'ctrl+z'], () => handleUndo(rpcClient, visualizerLocation));

            mouseTrapClient.bindNewKey(['command+shift+z', 'ctrl+y'], async () => handleRedo(rpcClient, visualizerLocation));

            return () => {
                mouseTrapClient.resetMouseTrapInstance();
            }
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
