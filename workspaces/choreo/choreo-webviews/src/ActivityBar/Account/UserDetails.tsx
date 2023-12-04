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
import React from "react";
import styled from "@emotion/styled";
import { UserInfo } from "./UserInfo";
import { VSCodeButton, VSCodeDivider } from "@vscode/webview-ui-toolkit/react";
import { ProjectDetails } from "./ProjectDetails";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import { Codicon } from "../../Codicon/Codicon";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { OrganizationInfo } from "./OrganizationInfo";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    align-items: flex-start;
    gap: 10px;
    width: 100%;
`;

const IconLabel = styled.div`
    margin-left: 5px;
    @media (max-width: 280px) {
        display: none;
    }
`;

// seperator with a margin of 10px on top and bottom
const Seperator = styled(VSCodeDivider)`
    margin: 10px 0;
`;

const openWalkthrough = () => {
    ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.getStarted");
};

export const UserDetails = () => {
    const { loginStatusPending, choreoProject, currentProjectOrg } = useChoreoWebViewContext();

    return (
        <Container>
            {loginStatusPending && <ProgressIndicator />}
            <UserInfo />
            <Seperator />
            <OrganizationInfo />
            {currentProjectOrg && choreoProject && (
                <>
                    <Seperator />
                    <ProjectDetails />
                </>
            )}
            <Seperator />
            <VSCodeButton appearance="icon" onClick={openWalkthrough} title="Open Choreo Walkthrough">
                <Codicon name="info" />
                <IconLabel>Feature Walkthrough</IconLabel>
            </VSCodeButton>
        </Container>
    );
};
