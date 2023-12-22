/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';
import { useVisualizerContext } from "@wso2-enterprise/eggplant-rpc-client"
// import { WebViewAPI } from './WebViewAPI';
import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import { ComponentListView } from './ComponentListView';
import { TitleBar } from './components/TitleBar';
import styled from '@emotion/styled';
import { ResourcesList } from './ResourcesList';
import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { Typography } from '@wso2-enterprise/ui-toolkit';

export interface SelectedComponent {
    fileName: string;
    serviceST: ServiceDeclaration
}

export function Overview() {
    const [currentComponents, setCurrentComponents] = useState<any>();
    const [selectedComponent, setSelectedComponent] = useState<SelectedComponent>();
    const [loading, setLoading] = useState(true);
    const { eggplantRpcClient } = useVisualizerContext();

    const [isPanelOpen, setPanelOpen] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    const openPanel = () => {
        setPanelOpen(!isPanelOpen);
    };

    const handleIsFetching = (value: boolean) => {
        setIsFetching(value);
    }


    const fetchData = async () => {
        try {
            const res = await eggplantRpcClient?.getWebviewRpcClient()?.getBallerinaProjectComponents();
            setCurrentComponents(res);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const LoaderContainer = styled.div({
        width: "100%",
        overflow: "hidden",
        height: "90vh",
        display: "grid"
    });

    const LoaderContent = styled.div({
        margin: "auto",
    });

    const Loader = () => {
        return (
            <LoaderContainer>
                <LoaderContent>
                    <VSCodeProgressRing style={{ height: 24, margin: 'auto' }} />
                    Fetching components...
                </LoaderContent>
            </LoaderContainer>
        )
    }

    if (loading) {
        // Render a loading indicator
        return <Loader />;
    }

    const handleClear = () => {
        setSelectedComponent(null);
    }

    return (
        <>
            <TitleBar clearSelection={handleClear} />
            {currentComponents ? (
                selectedComponent ? (
                    <>
                        <Typography variant="h3">{selectedComponent.serviceST.absoluteResourcePath.map(res => res.value)}</Typography>
                        <ResourcesList component={selectedComponent} />
                    </>
                ) : (
                    <ComponentListView handleIsFetching={handleIsFetching} currentComponents={currentComponents} setSelectedComponent={setSelectedComponent} />
                )
            ) : (
                <div>No data available</div>
            )}
            {isFetching &&
                <LoaderContent>
                    <VSCodeProgressRing style={{ height: 24, margin: 'auto' }} />
                </LoaderContent>
            }
        </>
    );
}
