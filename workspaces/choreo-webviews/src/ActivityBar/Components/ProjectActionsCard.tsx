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
import styled from "@emotion/styled";
import React, { useContext } from "react";
import { ArchiViewButton } from "./ArchitectureViewButton";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ViewTitle } from "./ViewTitle";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { useSelectedOrg } from "../../hooks/use-selected-org";

const Container = styled.div`
    margin-top: 10px;
`;

const Body = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 15px;
    margin-left: 10px;
`;

export const ProjectActionsCard: React.FC = () => {

    const { choreoUrl, choreoProject } = useContext(ChoreoWebViewContext);
    const { selectedOrg } = useSelectedOrg();

    const projectURL = `${choreoUrl}/organizations/${selectedOrg?.handle}/projects/${choreoProject?.id}`;

    const openProjectInChoreoConsole = () => {
        ChoreoWebViewAPI.getInstance().openExternal(projectURL);
    }
    
    return (
        <Container>
            <ViewTitle>Actions</ViewTitle>
            <Body>
                <ArchiViewButton />
                <VSCodeLink>Cell View</VSCodeLink>
                <VSCodeLink onClick={openProjectInChoreoConsole}>Open in Choreo Console</VSCodeLink>
            </Body>
        </Container>
    );
};
