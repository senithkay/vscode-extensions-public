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
import React from "react";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import styled from "@emotion/styled";
import { OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentRow } from "./ComponentRow";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ProgressIndicator } from "./ProgressIndicator";
import { ViewTitle } from "./ViewTitle";
import { useChoreoComponentsContext } from "../../context/choreo-components-ctx";
import { NoComponentsAlert } from "./componentAlerts/NoComponentsAlert";
import { ComponentSyncAlert } from "./componentAlerts/ComponentSyncAlert";
import { ComponentsPushAlert } from "./componentAlerts/ComponentsPushAlert";

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
    margin-top: 5px;
`;

const CodeIconWithMargin = styled(Codicon)`
    margin-right: 3px;
`;

const ComponentActionWrap = styled.div`
    display: flex;
    justify-content: flex-end;
    flex: 1;
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

    const componentsView = (
        <Container>
            <ComponentSyncAlert />
            <ComponentsPushAlert />
            <Header>
                <ViewTitle>Components</ViewTitle>
                <ComponentActionWrap>
                    {components?.length > 0 && (
                        <VSCodeButton
                            appearance="icon"
                            onClick={handleCreateComponentClick}
                            title="Add Component"
                            id="add-component-btn"
                        >
                            <CodeIconWithMargin name="plus" />
                        </VSCodeButton>
                    )}
                    <VSCodeButton
                        appearance="icon"
                        onClick={handleRefreshComponentsClick}
                        title="Refresh Component List"
                        id="refresh-components-btn"
                    >
                        <CodeIconWithMargin name="refresh" />
                    </VSCodeButton>
                    {components?.length > 0 && (
                        <VSCodeButton
                            onClick={() => collapseAllComponents()}
                            appearance="icon"
                            title="Collapse all components"
                            id="collapse-components-btn"
                        >
                            <CodeIconWithMargin name="collapse-all" />
                        </VSCodeButton>
                    )}
                </ComponentActionWrap>
            </Header>
            {(isLoadingComponents || isRefetchingComponents) && <ProgressIndicator />}
            <Body>
                <NoComponentsAlert />
                {components?.map((component) => (
                    <>
                        <ComponentRow
                            component={component}
                            expanded={expandedComponents.includes(component.name)}
                            handleExpandClick={toggleExpandedComponents}
                        />
                    </>
                ))}
                {componentLoadError && <div>{componentLoadError}</div>}
            </Body>
        </Container>
    );

    return choreoProject ? componentsView : <div>Loading</div>;
};
