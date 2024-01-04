/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Overview } from "@wso2-enterprise/overview-view";
import { ServiceDesigner } from "@wso2-enterprise/service-designer-view";
import React, { useEffect } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { NavigationBar } from "./components/NavigationBar";
/** @jsx jsx */
import { jsx, Global, css } from '@emotion/react';
import styled from "@emotion/styled";
import { VisualizerLocationContext } from "@wso2-enterprise/ballerina-core";
import { DataMapperOverlay } from "./components/DataMapperOverlay"

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

export function Webview() {
    const { viewLocation, setViewLocation, ballerinaRpcClient } = useVisualizerContext();

    useEffect(() => {
        setViewLocationState();
        ballerinaRpcClient.onStateChanged((state: { viewContext: VisualizerLocationContext }) => {
            setViewLocation(state.viewContext);
        });
    }, []);

    const setViewLocationState = async () => {
        const state = await ballerinaRpcClient.getVisualizerRpcClient().getVisualizerState();
        if (state) {
            setViewLocation(state);
        }
    }

    const OrgLabel = styled.span`
        color: var(--vscode-descriptionForeground);
    `;

    return (
        <>
            <Global styles={globalStyles} />
            <VisualizerContainer>
                <NavigationBar />
                {viewLocation.view === "Overview" && <Overview />}
                {viewLocation.view === "ServiceDesigner" && <ServiceDesigner model={null} rpcClient={null} />}
                {viewLocation.view === "DataMapper" && <DataMapperOverlay />}
                {viewLocation.view === "Architecture" && <h2>Hello Arch</h2>}
            </VisualizerContainer>
        </>
    );
};
