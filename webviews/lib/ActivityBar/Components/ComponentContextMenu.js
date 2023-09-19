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
import styled from "@emotion/styled";
import { GitProvider, OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT, OPEN_GITHUB_REPO_PAGE_EVENT, } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../../Codicon/Codicon";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ContextMenu } from "../../Commons/ContextMenu";
import { BitBucketIcon, GithubIcon } from "../../icons";
const InlineIcon = styled(Codicon) `
    vertical-align: sub;
    padding-left: 5px;
`;
const IconWrap = styled.div `
    height: 15px;
    width: 15px;
`;
export const ComponentContextMenu = (props) => {
    var _a;
    const { component, deletingComponent, handleDeleteComponentClick } = props;
    const { repository } = component;
    const { choreoUrl, currentProjectOrg } = useChoreoWebViewContext();
    const componentBaseUrl = `${choreoUrl}/organizations/${currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.handle}/projects/${component.projectId}/components/${component.handler}`;
    const openComponentUrl = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
            properties: { component: component === null || component === void 0 ? void 0 : component.name },
        });
        ChoreoWebViewAPI.getInstance().openExternal(componentBaseUrl);
    }, [componentBaseUrl]);
    const gitBaseUrl = repository.gitProvider === GitProvider.BITBUCKET ? "https://bitbucket.org" : "https://github.com";
    let gitUrl = `${gitBaseUrl}/${repository === null || repository === void 0 ? void 0 : repository.organizationApp}/${repository === null || repository === void 0 ? void 0 : repository.nameApp}`;
    gitUrl = repository.gitProvider === GitProvider.GITHUB ? `${gitUrl}/tree` : `${gitUrl}/src`;
    gitUrl = component.local
        ? `${gitUrl}/${repository === null || repository === void 0 ? void 0 : repository.branchApp}`
        : `${gitUrl}/${repository === null || repository === void 0 ? void 0 : repository.branchApp}/${(_a = repository.appSubPath) !== null && _a !== void 0 ? _a : ""}`;
    const onOpenRepo = () => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_GITHUB_REPO_PAGE_EVENT,
        });
        ChoreoWebViewAPI.getInstance().openExternal(gitUrl);
    };
    const menuItems = [];
    if (!component.local) {
        menuItems.push({
            id: "github-remote",
            label: (React.createElement(React.Fragment, null,
                React.createElement(IconWrap, { style: { width: 16, height: 16 } }, repository.gitProvider === GitProvider.BITBUCKET ? React.createElement(BitBucketIcon, null) : React.createElement(GithubIcon, null)),
                "\u00A0 ",
                repository.gitProvider === GitProvider.BITBUCKET ? "Open in BitBucket" : "Open in GitHub")),
            onClick: () => onOpenRepo(),
        });
    }
    if (!component.local) {
        menuItems.push({
            id: "choreo-console",
            label: (React.createElement(React.Fragment, null,
                React.createElement(InlineIcon, { name: "link-external" }),
                "\u00A0 Open in Choreo Console")),
            onClick: () => openComponentUrl(),
        });
    }
    menuItems.push({
        id: "delete",
        label: (React.createElement(React.Fragment, null,
            React.createElement(InlineIcon, { name: "trash" }),
            "\u00A0 ",
            deletingComponent ? "Deleting..." : "Delete Component")),
        onClick: () => handleDeleteComponentClick(component),
        disabled: deletingComponent,
    });
    return React.createElement(ContextMenu, { items: menuItems, loading: deletingComponent });
};
//# sourceMappingURL=ComponentContextMenu.js.map