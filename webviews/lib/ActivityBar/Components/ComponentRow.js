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
import { OPEN_SOURCE_CONTROL_VIEW_EVENT } from "@wso2-enterprise/choreo-core";
import { VSCodeButton, VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ComponentDetails } from "./ComponentDetails";
import { ComponentContextMenu } from "./ComponentContextMenu";
import { useComponentDelete } from "../../hooks/use-component-delete";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
const Container = styled.div `
  display: flex;
  flex-direction: column;
  border: calc(var(--border-width) * 1px) solid var(--vscode-list-inactiveSelectionBackground);
  margin-bottom: 10px;
  border-radius: 3px;
  box-sizing: border-box;
`;
// Header div will lay the items horizontally
const Header = styled.div `
  display: flex;
  flex-direction: row;
  gap: 2px;
  padding: 6px 5px;
  align-items: center;
  position: relative;
  background-color: var(--vscode-list-inactiveSelectionBackground);
  color: var(--vscode-list-inactiveSelectionForeground);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.1s;
  &:hover {
    background-color: var(--vscode-editor-selectionHighlightBackground);
  }
`;
// Body div will lay the items vertically
const Body = styled.div `
  display: flex;
  flex-direction: column;
  gap: 5px;
`;
const ComponentName = styled.span `
  font-size: 13px;
  cursor: pointer;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Flex = styled.div `
  flex: 1;
`;
export const ComponentRow = (props) => {
    const { component, loading, expanded, handleExpandClick } = props;
    const { deletingComponent, handleDeleteComponentClick } = useComponentDelete(component);
    const actionRequired = component.hasDirtyLocalRepo || component.isRemoteOnly || component.local;
    const handleSourceControlClick = useCallback(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: OPEN_SOURCE_CONTROL_VIEW_EVENT,
        });
        ChoreoWebViewAPI.getInstance().triggerCmd("workbench.scm.focus");
    }, []);
    let componentTag;
    if (component.local) {
        componentTag = "Local";
    }
    else if (component.isRemoteOnly) {
        componentTag = "Remote";
    }
    return (React.createElement(Container, null,
        React.createElement(Header, { onClick: () => handleExpandClick(component.name) },
            React.createElement(Codicon, { name: expanded ? "chevron-down" : "chevron-right" }),
            React.createElement(ComponentName, null, props.component.displayName),
            componentTag && (React.createElement(VSCodeTag, { title: "Only available locally", style: { marginLeft: "3px" } }, componentTag)),
            React.createElement(Flex, null),
            actionRequired && (React.createElement(VSCodeButton, { appearance: "icon", disabled: true, title: "Action Required", style: { cursor: "default" } },
                React.createElement(Codicon, { name: "info" }))),
            React.createElement(ComponentContextMenu, { component: component, deletingComponent: deletingComponent, handleDeleteComponentClick: handleDeleteComponentClick })),
        expanded && (React.createElement(Body, null,
            React.createElement(ComponentDetails, { loading: loading || deletingComponent, component: props.component, handleSourceControlClick: handleSourceControlClick })))));
};
//# sourceMappingURL=ComponentRow.js.map