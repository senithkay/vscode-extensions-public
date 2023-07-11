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
import {
    Component,
    OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
    OPEN_GITHUB_REPO_PAGE_EVENT,
} from "@wso2-enterprise/choreo-core";
import { Codicon } from "../../Codicon/Codicon";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { useSelectedOrg } from "../../hooks/use-selected-org";
import { ContextMenu, MenuItem } from "../../Commons/ContextMenu";

const InlineIcon = styled(Codicon)`
  vertical-align: sub;
  padding-left: 5px;
`;

export const ComponentContextMenu = (props: {
    component: Component;
    deletingComponent: boolean;
    handleDeleteComponentClick: (component: Component) => void;
}) => {
    const { component, deletingComponent, handleDeleteComponentClick } = props;
    const { repository } = component;
    const { choreoUrl } = useContext(ChoreoWebViewContext);
    const { selectedOrg } = useSelectedOrg();

    const componentBaseUrl = `${choreoUrl}/organizations/${selectedOrg?.handle}/projects/${component.projectId}/components/${component.handler}`;
    const openComponentUrl = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
            properties: { component: component?.name },
        });
        ChoreoWebViewAPI.getInstance().openExternal(componentBaseUrl);
    }, [componentBaseUrl]);

    const gitHubBaseUrl = `https://github.com/${repository?.organizationApp}/${repository?.nameApp}`;
    const repoLink = `${gitHubBaseUrl}/tree/${repository?.branchApp}${repository?.appSubPath ? `/${repository.appSubPath}` : ""
        }`;

    const onOpenRepo = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_GITHUB_REPO_PAGE_EVENT,
        });
        ChoreoWebViewAPI.getInstance().openExternal(repoLink);
    };

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
        },
    ];
    if (!component.local) {
        menuItems.push({
            id: "choreo-console",
            label: (
                <>
                    <InlineIcon name="link-external" />
                    &nbsp; Open in Choreo Console
                </>
            ),
            onClick: () => openComponentUrl(),
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
        disabled: deletingComponent,
    });

    return <ContextMenu items={menuItems}></ContextMenu>;
};
