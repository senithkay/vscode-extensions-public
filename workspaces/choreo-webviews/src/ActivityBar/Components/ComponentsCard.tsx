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
import React, { useCallback } from "react";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import styled from "@emotion/styled";
import {
    OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT,
    OPEN_SOURCE_CONTROL_VIEW_EVENT,
} from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentRow } from "./ComponentRow";
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ProgressIndicator } from "./ProgressIndicator";
import { ViewTitle } from "./ViewTitle";
import { NoComponentsMessage } from "./NoComponentsMessage";
import { useChoreoComponentsContext } from "../../context/choreo-components-ctx";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: 15px;
`;

const Header = styled.div`
    display: flex;
    flex-direction: row;
    gap: 2px;
    align-items: center;
`;

const CodeIconWithMargin = styled(Codicon)`
    margin-right: 3px;
`;

export const ComponentsCard = () => {
    const { choreoProject } = useChoreoWebViewContext();
    const {
        components,
        componentLoadError,
        isLoadingComponents,
        isRefetchingComponents,
        expandedComponents,
        refreshComponents,
        collapseAllComponents,
        toggleExpandedComponents,
    } = useChoreoComponentsContext();

    const handleCreateComponentClick = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT,
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.component.create");
    };

    const handleRefreshComponentsClick = () => {
        refreshComponents();
    };

    const handleSourceControlClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_SOURCE_CONTROL_VIEW_EVENT,
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("workbench.scm.focus");
    }, []);

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
                    <CodeIconWithMargin name="plus" />
                </VSCodeButton>
                <VSCodeButton
                    appearance="icon"
                    onClick={handleRefreshComponentsClick}
                    title="Refresh Component List"
                    id="refresh-components-btn"
                >
                    <CodeIconWithMargin name="refresh" />
                </VSCodeButton>
                <VSCodeButton
                    onClick={() => collapseAllComponents()}
                    appearance="icon"
                    title="Collapse all components"
                    id="collapse-components-btn"
                >
                    <CodeIconWithMargin name="collapse-all" />
                </VSCodeButton>
            </Header>
            {(isLoadingComponents || isRefetchingComponents) && <ProgressIndicator />}
            <Body>
                {components &&
                    components.map((component, index) => (
                        <>
                            <ComponentRow
                                component={component}
                                handleSourceControlClick={handleSourceControlClick}
                                expanded={expandedComponents.includes(component.name)}
                                handleExpandClick={toggleExpandedComponents}
                            />
                            {index !== components.length - 1 && <VSCodeDivider />}
                        </>
                    ))}
                {!isLoadingComponents && components && components.length === 0 && <NoComponentsMessage />}
                {componentLoadError && <div>{componentLoadError}</div>}
            </Body>
        </Container>
    );

    return choreoProject ? componentsView : <div>Loading</div>;
};
