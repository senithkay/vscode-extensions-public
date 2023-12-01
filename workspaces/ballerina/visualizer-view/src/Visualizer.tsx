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
import { DataMapper } from "@wso2-enterprise/data-mapper-view";
import React, { useEffect } from "react";
import { useVisualizerContext } from "@wso2-enterprise/ballerina-rpc-client";
import { NavigationBar } from "./components/NavigationBar";
import styled from "@emotion/styled";
import { VisualizerLocationContext } from "@wso2-enterprise/ballerina-core";
import { fnST } from "./data-provider/st"

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

    const VisualizerContainer = styled.div`
        width: 100%;
    `;

    const OrgLabel = styled.span`
        color: var(--vscode-descriptionForeground);
    `;

    const dataMapper = (
        <DataMapper
            library={undefined}
            targetPosition={{ ...fnST.position, startColumn: 0, endColumn: 0 }}
            fnST={fnST}
            openedViaPlus={false}
            ballerinaVersion={'2201.7.2 (swan lake update 7)'}
            applyModifications={undefined}
            updateFileContent={undefined}
            goToSource={undefined}
            onClose={undefined}
            onSave={undefined}
            importStatements={[]}
            recordPanel={undefined}
            updateActiveFile={undefined}
            updateSelectedComponent={undefined}
        />
    );

    return (
        <VisualizerContainer>
            <NavigationBar />
            {viewLocation.view === "Overview" && <Overview />}
            {viewLocation.view === "ServiceDesigner" && <ServiceDesigner />}
            {viewLocation.view === "DataMapper" && dataMapper}
            {viewLocation.view === "Architecture" && <h2>Hello Arch</h2>}
        </VisualizerContainer>
    );
};