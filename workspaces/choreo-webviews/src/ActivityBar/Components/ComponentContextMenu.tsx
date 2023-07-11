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
import { Codicon } from "../../Codicon/Codicon";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useSelectedOrg } from "../../hooks/use-selected-org";
import { ContextMenu, MenuItem } from "../../Commons/ContextMenu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useChoreoComponentsContext } from "../../context/choreo-components-ctx";


const InlineIcon = styled(Codicon)`
    vertical-align: sub;
    padding-left: 5px;
`;


export const ComponentContextMenu = (props: { component: Component }) => {
    const { component } = props;
    const { refreshComponents } = useChoreoComponentsContext()
    const { repository } = component;
    const { choreoUrl } = useContext(ChoreoWebViewContext);
    const { selectedOrg } = useSelectedOrg();
    const queryClient = useQueryClient();

    const componentBaseUrl = `${choreoUrl}/organizations/${selectedOrg?.handle}/projects/${component.projectId}/components/${component.handler}`;
    const openComponentUrl = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
            properties: { component: component?.name }
        });
        ChoreoWebViewAPI.getInstance().openExternal(componentBaseUrl);
    }, [componentBaseUrl]);

    const gitHubBaseUrl = `https://github.com/${repository?.organizationApp}/${repository?.nameApp}`;
    const repoLink = `${gitHubBaseUrl}/tree/${repository?.branchApp}${repository?.appSubPath ? `/${repository.appSubPath}` : ''}`;

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
                const previousComponents: Component[] | undefined = queryClient.getQueryData(["overview_component_list", component.projectId])
                const filteredComponents = previousComponents?.filter(item => data.local ? item.name !== data.name : item.id !== data.id);
                queryClient.setQueryData(["overview_component_list", component.projectId], filteredComponents)
                refreshComponents();
            }
        },
    });


    const menuItems: MenuItem[] = [
        {
            id: "github-remote",
            label: (
                <>
                    <InlineIcon name="github" />
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
                    <InlineIcon name="link-external" />
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
                <InlineIcon name="trash" />
                &nbsp; {deletingComponent ? "Deleting..." : "Delete Component"}
            </>
        ),
        onClick: () => handleDeleteComponentClick(component),
        disabled: deletingComponent
    });

    return <ContextMenu items={menuItems}></ContextMenu>
};
