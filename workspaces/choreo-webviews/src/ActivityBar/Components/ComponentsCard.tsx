/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import React, { useContext } from "react";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import styled from "@emotion/styled";
import { OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentRow } from "./ComponentRow";
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { useGetComponents } from "../../hooks/use-get-components";
import { ProgressIndicator } from "./ProgressIndicator";
import { ViewTitle } from "./ViewTitle";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const Body = styled.div`
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 0;
    margin-top: 15px;
`

const Header = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 2px;
    align-items: center;
`;

export const ComponentsCard = () => {
    const { choreoProject } = useContext(ChoreoWebViewContext);

    const { components, componentLoadError, isLoadingComponents, isRefetchingComponents, refreshComponents } = useGetComponents();

    const handleCreateComponentClick = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.component.create");
    }

    const handleRefreshComponentsClick = () => {
        refreshComponents();
    }
    
    const componentsView = (
        <Container>
            <Header>
                <ViewTitle>Components</ViewTitle>
                <VSCodeButton
                    appearance="icon"
                    onClick={handleCreateComponentClick}
                    title="Add Component"
                    id="add-component-btn"
                    style={{ marginLeft: "auto" }}
                >
                    <Codicon name="plus" />
                </VSCodeButton>
                <VSCodeButton
                    appearance="icon"
                    onClick={handleRefreshComponentsClick}
                    title="Refresh Component List"
                    id="refresh-components-btn"
                >
                    <Codicon name="refresh" />
                </VSCodeButton>
                <VSCodeButton
                    appearance="icon"
                    title="Collapse all components"
                    id="collapse-components-btn"
                >
                    <Codicon name="collapse-all" />
                </VSCodeButton>
            </Header>
            <Body>
                {(isLoadingComponents || isRefetchingComponents) && <ProgressIndicator />}
                {components && components.map((component, index) => 
                    (<>
                        <ComponentRow component={component} />
                        {index !== components.length - 1 && <VSCodeDivider />}
                    </>)
                )}
                {!isLoadingComponents && components && components.length === 0 && <div>No Components</div>}
                {componentLoadError && <div>{componentLoadError}</div>}
            </Body>
        </Container> 
    );

    return (choreoProject 
        ? componentsView
        : <div>Loading</div>
    )
};
