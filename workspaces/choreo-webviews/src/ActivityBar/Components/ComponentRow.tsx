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
import { Component, OPEN_SOURCE_CONTROL_VIEW_EVENT } from "@wso2-enterprise/choreo-core";
import { VSCodeButton, VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ComponentDetails } from "./ComponentDetails";
import { ComponentContextMenu } from "./ComponentContextMenu";
import { useComponentDelete } from "../../hooks/use-component-delete";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";

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

const Flex = styled.div`
  flex: 1;
`;

export const ComponentRow = (props: {
    component: Component;
    expanded: boolean;
    handleExpandClick: (componentName: string) => void;
    loading?: boolean;
}) => {
    const { component, loading, expanded, handleExpandClick } = props;
    const { deletingComponent, handleDeleteComponentClick } = useComponentDelete(component);
    const actionRequired = component.hasDirtyLocalRepo || component.isRemoteOnly || component.local;

    const handleSourceControlClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_SOURCE_CONTROL_VIEW_EVENT,
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("workbench.scm.focus");
    }, []);

    let componentTag: "Local" | "Remote" | undefined;
    if (component.local) {
        componentTag = "Local";
    } else if (component.isRemoteOnly) {
        componentTag = "Remote";
    }

    return (
        <Container>
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
                {componentTag && (
                    <VSCodeTag title={"Only available locally"} style={{ marginLeft: "3px" }}>
                        {componentTag}
                    </VSCodeTag>
                )}
                <Flex />
                {actionRequired && (
                    <VSCodeButton appearance="icon" disabled title="Action Required" style={{ cursor: "default" }}>
                        <Codicon name="info" />
                    </VSCodeButton>
                )}
                <ComponentContextMenu
                    component={component}
                    deletingComponent={deletingComponent}
                    handleDeleteComponentClick={handleDeleteComponentClick}
                />
            </Header>
            {expanded && (
                <Body>
                    <ComponentDetails
                        loading={loading || deletingComponent}
                        component={props.component}
                        handleSourceControlClick={handleSourceControlClick}
                    />
                </Body>
            )}
        </Container>
    );
};
