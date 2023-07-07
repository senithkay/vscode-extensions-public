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
import React, { Component, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import styled from "@emotion/styled";
import { OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT, OPEN_SOURCE_CONTROL_VIEW_EVENT, PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentRow } from "./ComponentRow";
import { VSCodeButton, VSCodeDivider, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { useGetComponents } from "../../hooks/use-get-components";
import { ProgressIndicator } from "./ProgressIndicator";
import { ViewTitle } from "./ViewTitle";
import { NoComponentsMessage } from "./NoComponentsMessage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
`

const Header = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 2px;
    align-items: center;
`;

const CodeIconWithMargin = styled(Codicon)`
    margin-right: 3px;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;

const ComponentActions = styled.div`
    margin-top: 15px;
`

const VSCodeButtonFullWidth = styled(VSCodeButton)`
    width: 100%
`


export const ComponentsCard = (props: { componentLimit: number }) => {
    const { choreoProject } = useContext(ChoreoWebViewContext);
    const { componentLimit } = props;
    const queryClient = useQueryClient();
    const [expandedComponents, setExpandedComponents] = useState<string[]>([])

    const { components, componentLoadError, isLoadingComponents, isRefetchingComponents, refreshComponents } = useGetComponents();

    const { data: hasSubscription = false, isFetched: fetchedSubscription } = useQuery({
        queryKey: ["overview_project_subscription", choreoProject?.id],
        queryFn: () => ChoreoWebViewAPI.getInstance().hasChoreoSubscription(),
    });

    const { data: usageData } = useQuery({
        queryKey: ["overview_project_comp_count", choreoProject?.id, components, hasSubscription],
        queryFn: () => ChoreoWebViewAPI.getInstance().getComponentCount(),
        enabled: fetchedSubscription && !hasSubscription
    });

    const handleCreateComponentClick = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_COMPONENT_CREATION_FROM_OVERVIEW_PAGE_EVENT
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.component.create");
    }

    const handleRefreshComponentsClick = () => {
        refreshComponents();
    }

    const handleOpenBillingClick = () => ChoreoWebViewAPI.getInstance().openBillingPortal(choreoProject.orgId);

    /** Has components with local changes or unpushed commits */
    const componentsOutOfSync = useMemo(() => {
        return components?.some(
            (component) => component.hasDirtyLocalRepo || component.hasUnPushedLocalCommits
        );
    }, [components]);

    /** 
     * Count of every local components that's without any local git changes to commit/push & valid path in remote repo. 
     * These components can be pushed to Choreo 
     * */
    const pushableComponentCount = useMemo(() => {
        const localOnlyComponents = components.filter(
            (component) => component.local
        );
        return localOnlyComponents.reduce((count, component) => {
            if (!component.hasDirtyLocalRepo && !component.hasUnPushedLocalCommits) {
                return count + 1;
            }
            return count;
        }, 0);
    }, [components])

    const pushableLimitExceeded = useMemo(() => {
        if (hasSubscription) {
            return false;
        }
        if (usageData && pushableComponentCount > 0) {
            return pushableComponentCount > (componentLimit - (usageData?.componentCount || 0));
        }
        return false;
    }, [pushableComponentCount, usageData, hasSubscription, componentLimit]);

    const hasPushableComponents = useMemo(() => pushableComponentCount > 0, [pushableComponentCount]);

    const { mutate: handlePushToChoreoClick, isLoading: pushingComponent } =
        useMutation({
            mutationFn: () => ChoreoWebViewAPI.getInstance().pushLocalComponentsToChoreo(choreoProject?.id),
            onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
            onMutate: () => {
                ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                    eventName: PUSH_ALL_COMPONENTS_TO_CHOREO_EVENT
                })
            },
            onSuccess: async () => {
                await queryClient.cancelQueries({ queryKey: ["overview_component_list", choreoProject?.id] })
                const previousComponents: Component[] = queryClient.getQueryData(["overview_component_list", choreoProject?.id])
                const updatedComponents = previousComponents?.map(item => ({ ...item, local: false }));
                queryClient.setQueryData(["overview_component_list", choreoProject?.id], updatedComponents)
                refreshComponents()
            },
        });

    const hasLocalComponents = useMemo(
        () => components?.some((component) => component.local),
        [components]
    );

    const handleSourceControlClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_SOURCE_CONTROL_VIEW_EVENT
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("workbench.scm.focus");
    }, []);

    const handleExpandClick = useCallback((componentName) => {
        if (expandedComponents.includes(componentName)) {
            setExpandedComponents(expandedComponents.filter(item => item !== componentName));
        } else {
            setExpandedComponents([...expandedComponents, componentName]);
        }
    }, [expandedComponents, setExpandedComponents])


    useEffect(() => {
        const rpcInstance = ChoreoWebViewAPI.getInstance();
        rpcInstance.onRefreshComponents(() => {
            refreshComponents();
        });
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
                    onClick={() => setExpandedComponents([])}
                    appearance="icon"
                    title="Collapse all components"
                    id="collapse-components-btn"
                >
                    <CodeIconWithMargin name="collapse-all" />
                </VSCodeButton>
            </Header>
            {(isLoadingComponents || isRefetchingComponents) && <ProgressIndicator />}
            <Body>
                {components && components.map((component, index) =>
                (<>
                    <ComponentRow
                        component={component}
                        refetchComponents={refreshComponents}
                        handleSourceControlClick={handleSourceControlClick}
                        reachedChoreoLimit={!hasSubscription && 0 >= (componentLimit - (usageData?.componentCount || 0))}
                        loading={pushingComponent}
                        expanded={expandedComponents.includes(component.name)}
                        handleExpandClick={handleExpandClick}
                    />
                    {index !== components.length - 1 && <VSCodeDivider />}
                </>)
                )}
                {!isLoadingComponents && components && components.length === 0 && <NoComponentsMessage />}
                {componentLoadError && <div>{componentLoadError}</div>}
            </Body>
            <ComponentActions>
                {componentsOutOfSync && (
                    <>
                        <p>
                            {hasLocalComponents
                                ? "Some components are not in sync with the upstream github repository. Please commit and push them before pushing to Choreo."
                                : "Some components have changes which are not yet pushed to git repository. Please commit them to be visible on Choreo"}
                        </p>
                        <ActionContainer>
                            {pushingComponent && <VSCodeProgressRing />}
                            <VSCodeButton
                                appearance="secondary"
                                onClick={handleSourceControlClick}
                            >
                                <Codicon name="source-control" />
                                &nbsp; Open Source Control
                            </VSCodeButton>
                            <VSCodeButton
                                appearance="secondary"
                                onClick={() => refreshComponents()}
                                disabled={isLoadingComponents || isRefetchingComponents}
                            >
                                <Codicon name="refresh" />
                                &nbsp; Recheck
                            </VSCodeButton>
                        </ActionContainer>
                    </>
                )}
                {!componentsOutOfSync && (hasPushableComponents || pushingComponent) && (
                    <>
                        {pushableLimitExceeded && !pushingComponent ? (
                            <>
                                <p>
                                    Upgrade you tier to push newly created components to Choreo
                                </p>
                                <VSCodeButtonFullWidth
                                    appearance="primary"
                                    onClick={() => handleOpenBillingClick()}
                                >
                                    Upgrade
                                </VSCodeButtonFullWidth>
                            </>
                        ) : <>
                            <p>
                                Some components are not created in Choreo. Click `Push
                                to Choreo` to create them.
                            </p>
                            {pushingComponent && <VSCodeProgressRing />}
                            <VSCodeButtonFullWidth
                                appearance="primary"
                                disabled={pushingComponent || isLoadingComponents}
                                onClick={() => handlePushToChoreoClick()}
                                id='push-to-choreo-btn'
                            >
                                <Codicon name="cloud-upload" />
                                &nbsp; Push to Choreo
                            </VSCodeButtonFullWidth>
                        </>}
                    </>
                )}
            </ComponentActions>
        </Container>
    );

    return (choreoProject
        ? componentsView
        : <div>Loading</div>
    )
};
