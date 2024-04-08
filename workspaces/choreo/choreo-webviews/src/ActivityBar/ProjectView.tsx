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
// import { useChoreoWebViewContext } from "../context/chorelso-web-view-ctx";
import { useAuthContext } from "../context/choreo-auth-ctx";
import { useLinkedDirContext } from "../context/choreo-linked-dir-ctx";

// import { ProjectActionsCard } from "./Components/ProjectActionsCard";
import styled from "@emotion/styled";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
// import { EmptyWorkspaceMessage } from "./Components/EmptyWorkspaceMessage";
import { SignInToChoreoMessage } from "./Components/SignIntoChoreoMessage";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    height: 100%;
    width: 100%;
`;

export const ProjectView = () => {
    // const { choreoProject, loginStatus, isChoreoProject, loadingProject } = useChoreoWebViewContext();
    const { userInfo, loading: loadingAuth, isInitialLoading: initialLoadAuth } = useAuthContext();
    const { links, loading: loadingDirs, isInitialLoading: initialLoadDirs } = useLinkedDirContext();

    return (
        <Container>
            {(loadingAuth || loadingDirs) && <ProgressIndicator id="project-view-progress" />}
            {!initialLoadAuth && !initialLoadDirs && (
                <>
                    {userInfo ? (
                        <>
                            {links.map((item) => (
                                <div key={item.linkRelativePath}>
                                    <div>Component Path: {item.componentRelativePath}</div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <SignInToChoreoMessage showProjectHeader />
                    )}
                </>
            )}

            {/* {loginStatus === "LoggedOut" && <SignInToChoreoMessage showProjectHeader/>}
            {loginStatus == "LoggedIn" && (
                <>
                    {loadingProject ? (
                        <ProgressIndicator />
                    ) : (
                        <>
                            {isChoreoProject && choreoProject && <ProjectActionsCard />}
                            {isChoreoProject && !choreoProject && <EmptyWorkspaceMessage projectUnavailable />}
                            {!isChoreoProject && <EmptyWorkspaceMessage />}
                        </>
                    )}
                </>
            )} */}
        </Container>
    );
};
