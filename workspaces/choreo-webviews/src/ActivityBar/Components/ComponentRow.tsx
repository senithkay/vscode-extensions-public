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
import { Component } from "@wso2-enterprise/choreo-core";
import { VSCodeButton, VSCodeTag } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
import { ComponentDetails } from "./ComponentDetails";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { RepositoryLink } from "./RepositoryLink"
import { useSelectedOrg } from "../../hooks/use-selected-org";

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
`;
// Body div will lay the items vertically
const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 15px;
    position: relative;
`;

const ComponentName = styled.span`
    font-size: 14px;
    cursor: pointer;
`;


export const ComponentRow = (props: { component: Component }) => {
    const { component } = props;
    const { choreoUrl } = useContext(ChoreoWebViewContext);
    const { selectedOrg } = useSelectedOrg();

    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    }

    // component URL
    const componentBaseUrl = `${choreoUrl}/organizations/${selectedOrg?.handle}/projects/${component.projectId}/components/${component.handler}`;
    const openComponentUrl = useCallback(() => {
        ChoreoWebViewAPI.getInstance().openExternal(componentBaseUrl);
    }, [componentBaseUrl]);

    return (<Container>
        <Header>
            <VSCodeButton
                appearance="icon"
                onClick={handleExpandClick}
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
            <VSCodeButton
                appearance="icon"
                onClick={openComponentUrl}
                title={"Open in Choreo Console"}
                id="open-in-console-btn"
                style={{ marginLeft: "auto" }}
                disabled={component?.local}
            >
                <Codicon name={"link-external"} />
            </VSCodeButton>
            <RepositoryLink repo={component?.repository} />
        </Header>
        {expanded && (
            <Body>
                <ComponentDetails component={props.component} />
            </Body>
        )}
    </Container>)
};
