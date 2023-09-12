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
import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";
import {
    Component,
    GitProvider,
    OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
    OPEN_GITHUB_REPO_PAGE_EVENT,
} from "@wso2-enterprise/choreo-core";
import {
    ContextMenu,
} from "@wso2-enterprise/ui-toolkit";
import { Codicon } from "../../Codicon/Codicon";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { BitBucketIcon, GithubIcon } from "../../icons";
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from "@vscode/webview-ui-toolkit/react";

export interface MenuItem {
    id: number | string;
    label: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
}

const VSCodeDataGridInlineCell = styled(VSCodeDataGridCell)`
    text-align: left;
    width: 220px;
    display: flex;
    align-items: center;
    padding: 6px 10px;
`;

const InlineIcon = styled(Codicon)`
    vertical-align: sub;
    padding-left: 5px;
`;

const IconWrap = styled.div`
    height: 15px;
    width: 15px;
`;

export const ComponentContextMenu = (props: {
    component: Component;
    deletingComponent: boolean;
    handleDeleteComponentClick: (component: Component) => void;
}) => {
    const { component, deletingComponent, handleDeleteComponentClick } = props;
    const { choreoUrl, currentProjectOrg } = useChoreoWebViewContext();

    const [isOpen, setIsOpen] = useState(false);

    const componentBaseUrl = `${choreoUrl}/organizations/${currentProjectOrg?.handle}/projects/${component.projectId}/components/${component.handler}`;
    const openComponentUrl = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_CONSOLE_COMPONENT_OVERVIEW_PAGE_EVENT,
            properties: { component: component?.name },
        });
        ChoreoWebViewAPI.getInstance().openExternal(componentBaseUrl);
    }, [componentBaseUrl]);


    const menuItems: MenuItem[] = [];

    if (component.endpointsPath) {
        menuItems.push({
            id: "open-endpoints",
            label: (
                <>
                    <InlineIcon name="code" />
                    &nbsp; View endpoints.yaml
                </>
            ),
            onClick: () => ChoreoWebViewAPI.getInstance().goToSource(component.endpointsPath),
        });
    }

    if (!component.local && component.repository) {
        const { repository } = component;
        const gitBaseUrl = repository.gitProvider === GitProvider.BITBUCKET ? "https://bitbucket.org" : "https://github.com";
        let gitUrl = `${gitBaseUrl}/${repository?.organizationApp}/${repository?.nameApp}`;
        gitUrl = repository.gitProvider === GitProvider.BITBUCKET ? `${gitUrl}/src` : `${gitUrl}/tree`;
        gitUrl = component.local
            ? `${gitUrl}/${repository?.branchApp}`
            : `${gitUrl}/${repository?.branchApp}/${repository.appSubPath ?? ""}`;

        const onOpenRepo = () => {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: OPEN_GITHUB_REPO_PAGE_EVENT,
            });
            ChoreoWebViewAPI.getInstance().openExternal(gitUrl);
        };

        menuItems.push({
            id: "github-remote",
            label: (
                <>
                    <IconWrap style={{ width: 16, height: 16 }}>
                        {repository.gitProvider === GitProvider.BITBUCKET ? <BitBucketIcon /> : <GithubIcon />}
                    </IconWrap>
                    &nbsp; {repository.gitProvider === GitProvider.BITBUCKET ? "Open in BitBucket" : "Open in GitHub"}
                </>
            ),
            onClick: () => onOpenRepo(),
        });
    }
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

    const handleItemClick = (item: MenuItem) => {
        item.onClick();
        setIsOpen(false);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        setIsOpen(true);
    };

    const handleMenuClose = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        event.stopPropagation();
        setIsOpen(false);
    };

    const icon = (<Codicon name="ellipsis" />);

    return (
        <ContextMenu isOpen={isOpen} icon={icon} isLoading={deletingComponent} menuId={component.displayName} onClick={handleClick} onClose={handleMenuClose} sx={{right: 0, marginTop: 50}}>
            <VSCodeDataGrid aria-label="Context Menu">
                {menuItems.map((item) => (
                    <VSCodeDataGridRow
                        key={item.id}
                        onClick={(event) => {
                            if (!item.disabled) {
                                event.stopPropagation();
                                handleItemClick(item);
                                setIsOpen(false);
                            }
                        }}
                        style={{
                            cursor: item.disabled ? "not-allowed" : "pointer",
                            opacity: item.disabled ? 0.5 : 1,
                        }}
                        id={`component-list-menu-${item.id}`}
                    >
                        <VSCodeDataGridInlineCell>{item.label}</VSCodeDataGridInlineCell>
                    </VSCodeDataGridRow>
                ))}
            </VSCodeDataGrid>
        </ContextMenu>
    );
};
