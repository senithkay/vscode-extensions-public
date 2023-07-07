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
import React, { useCallback, useContext } from "react";
import styled from "@emotion/styled";
import { Component, DELETE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT, OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT, OPEN_GITHUB_REPO_PAGE_EVENT } from "@wso2-enterprise/choreo-core";
import { VSCodeButton, VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ComponentDetails } from "./ComponentDetails";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useSelectedOrg } from "../../hooks/use-selected-org";
import { ContextMenu, MenuItem } from "../../Commons/ContextMenu";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Container = styled.div`
    display: flex;
    flex-direction: column;
`;

// Header div will lay the items horizontally
const Header = styled.div`
    display: flex;
    flex-direction: row;
    gap: 2px;
    margin: 5px;
    align-items: center;
    position: relative;
`;
// Body div will lay the items vertically
const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-left: 18px;
    margin-bottom: 10px;
`;

const ComponentName = styled.span`
    font-size: 13px;
    cursor: pointer;
    font-weight: 600;
`;

const InlineIcon = styled.span`
    vertical-align: sub;
    padding-left: 5px;
`;

const Flex = styled.div`
    flex: 1;
`


export const ComponentRow = (props: { 
    component: Component, 
    refetchComponents: () => void, 
    handleSourceControlClick: () => void,
    reachedChoreoLimit: boolean;
    loading: boolean;
    expanded: boolean;
    handleExpandClick: (componentName: string) => void;
}) => {
    const { component, refetchComponents, handleSourceControlClick, reachedChoreoLimit, loading, expanded, handleExpandClick } = props;
    const { repository } = component;
    const { choreoUrl } = useContext(ChoreoWebViewContext);
    const { selectedOrg } = useSelectedOrg();
    const queryClient = useQueryClient();

    // component URL
    const componentBaseUrl = `${choreoUrl}/organizations/${selectedOrg?.handle}/projects/${component.projectId}/components/${component.handler}`;
    const openComponentUrl = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
            properties: { component: component?.name }
        });
        ChoreoWebViewAPI.getInstance().openExternal(componentBaseUrl);
    }, [componentBaseUrl]);

    const gitHubBaseUrl = `https://github.com/${repository.organizationApp}/${repository.nameApp}`;
    const repoLink = `${gitHubBaseUrl}/tree/${repository.branchApp}${repository.appSubPath ? `/${repository.appSubPath}` : ''}`;

    const onOpenRepo = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_GITHUB_REPO_PAGE_EVENT
        });
        ChoreoWebViewAPI.getInstance().openExternal(repoLink);
    };

    const { mutate: handleDeleteComponentClick, isLoading: deletingComponent } = useMutation({
        mutationFn: (component: Component) => ChoreoWebViewAPI.getInstance().deleteComponent({ component, projectId: component.projectId }),
        onError: (error: Error) => ChoreoWebViewAPI.getInstance().showErrorMsg(error.message),
        onMutate: () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: DELETE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
                properties: {  component: component.name },
            })
        },
        onSuccess: async (data) => {
            if (data) {
                await queryClient.cancelQueries({ queryKey: ["overview_component_list", component.projectId] })
                const previousComponents: Component[] = queryClient.getQueryData(["overview_component_list", component.projectId])
                const filteredComponents = previousComponents?.filter(item => data.local ? item.name !== data.name : item.id !== data.id);
                queryClient.setQueryData(["overview_component_list", component.projectId], filteredComponents)
                refetchComponents();
            }
        },
    });


    const menuItems: MenuItem[] = [
        {
            id: "github-remote",
            label: (
                <>
                    <InlineIcon>
                        <Codicon name="github" />
                    </InlineIcon>{" "}
                    &nbsp; Open in Github
                </>
            ),
            onClick: () => onOpenRepo(),
        }
    ]
    if (!component.local) {
        menuItems.push({
            id: "choreo-console",
            label: (
                <>
                    <InlineIcon>
                        <Codicon name="link-external" />
                    </InlineIcon>{" "}
                    &nbsp; Open in Choreo Console
                </>
            ),
            onClick: () => openComponentUrl()
        });
    }
    menuItems.push({
        id: "delete",
        label: (
            <>
                <InlineIcon>
                    <Codicon name="trash" />
                </InlineIcon>{" "}
                &nbsp; {deletingComponent ? "Deleting..." : "Delete Component"}
            </>
        ),
        onClick: () => handleDeleteComponentClick(component),
        disabled: deletingComponent
    });

    const actionRequired = component.hasDirtyLocalRepo || component.isRemoteOnly || component.local

    return (<Container>
        <Header>
            <VSCodeButton
                appearance="icon"
                onClick={() => handleExpandClick(component.name)}
                title={expanded ? "Collapse" : "Expand"}
                id="expand-components-btn"
            >
                <Codicon name={expanded ? "chevron-down" : "chevron-right"} />
            </VSCodeButton>
            <ComponentName>{props.component.displayName}</ComponentName>
            {component.local && 
                <VSCodeTag 
                    title={"Only available locally"}
                    style={{ marginLeft: "3px" }}
                >
                    Local
                </VSCodeTag>}
            {component.isRemoteOnly && 
                <VSCodeTag 
                    title={"Only available remotely"}
                    style={{ marginLeft: "3px" }}
                >
                    Remote
                </VSCodeTag>}
            <Flex />
            {actionRequired && (
                <VSCodeButton
                    appearance="icon"
                    disabled
                    title="Action Required"
                    style={{ cursor: 'default' }}
                >
                    <Codicon name="info" />
                </VSCodeButton>
            )}
            <ContextMenu items={menuItems}></ContextMenu>
        </Header>
        {expanded && (
            <Body>
                <ComponentDetails 
                    loading={loading || deletingComponent}
                    component={props.component} 
                    handleSourceControlClick={handleSourceControlClick} 
                    reachedChoreoLimit={reachedChoreoLimit}
                    refetchComponents={refetchComponents}    
                />
            </Body>
        )}
    </Container>)
};
