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

export function Overview() {
    const [currentComponents, setCurrentComponents] = useState<any>();
    const [loading, setLoading] = useState(true);
    const { eggplantRpcClient } = useVisualizerContext();

    const [isPanelOpen, setPanelOpen] = useState(false);

    const openPanel = () => {
        setPanelOpen(!isPanelOpen);
    };


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
        height: "100vh",
        display: "grid"
    });

    const LoaderContent = styled.div({
        margin: "auto",
    });

    const Loader = () => {
        return (
            <LoaderContainer>
                <LoaderContent>
                    <VSCodeProgressRing />
                    Fetching components...
                </LoaderContent>
            </LoaderContainer>
        )
    }

    if (loading) {
        // Render a loading indicator
        return <Loader />;
    }

    return (
        <>
            {/* <TitleBar /> */}
            {currentComponents ? (
                <ComponentListView currentComponents={currentComponents} />
            ) : (
                <div>No data available</div>
            )}
        </>
    );
}
