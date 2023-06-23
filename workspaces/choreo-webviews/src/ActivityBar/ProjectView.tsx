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

import React, { useContext } from "react";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ComponentsCard } from "./Components/ComponentsCard";
import { ProjectActionsCard } from "./Components/ProjectActionsCard";
import { SignIn } from "../SignIn/SignIn";
import styled from "@emotion/styled";
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import { ChoreoWebViewAPI } from "./../utilities/WebViewRpc";
import { ProgressIndicator } from "./Components/ProgressIndicator";


const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    width: 100%;
`;

const NotAChoreoProjectCard = () => {
    const openChoreoProject = () => {
        ChoreoWebViewAPI.getInstance().triggerCmd("wso2.choreo.project.open");
    }
    return (
        <div>
            <p><VSCodeLink onClick={openChoreoProject}>Open a Choreo Project</VSCodeLink> to view the components</p>
        </div>
    )
}

export const ProjectView = () => {
    const { choreoProject, loginStatus, isChoreoProject } = useContext(ChoreoWebViewContext);
    return (
        <Container>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {choreoProject && <ProjectActionsCard />}
            {choreoProject && <ComponentsCard />}
            {!isChoreoProject && loginStatus == "LoggedIn" && <NotAChoreoProjectCard />}
            {isChoreoProject && !choreoProject && loginStatus === "LoggedIn" && <ProgressIndicator />}
        </Container>
    )
};
