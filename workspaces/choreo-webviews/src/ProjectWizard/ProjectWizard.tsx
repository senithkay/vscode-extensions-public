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
import { VSCodeTextField, VSCodeTextArea, VSCodeCheckbox, VSCodeButton, VSCodeLink, VSCodeDropdown, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { OrgSelector } from "../OrgSelector/OrgSelector";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    gap: 20px;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
`;

const ErrorMessageContainer = styled.div`
    color: var(--vscode-errorForeground);
`

export function ProjectWizard() {

    const { loginStatus, loginStatusPending, selectedOrg, error } = useContext(ChoreoWebViewContext);

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creationInProgress, setCreationInProgress] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [initMonoRepo, setInitMonoRepo] = useState(false);

    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status: string) => {
            console.log("GH App Auth Callback: " + status);
        });
    },[]);

    const handleInitiMonoRepoCheckChange = (e: any) => {
        setInitMonoRepo(e.target.checked);
    };

    const handleCreateProject = async () => {
        setCreationInProgress(true);
        const projectClient = ChoreoWebViewAPI.getInstance().getProjectClient();
        if (selectedOrg) {
            try {
                const createdProject = await projectClient.createProject({
                    name: projectName,
                    description: projectDescription,
                    orgId: selectedOrg.id,
                    orgHandle: selectedOrg.handle
                });
                const webviewAPI = ChoreoWebViewAPI.getInstance();
                webviewAPI.triggerCmd("wso2.choreo.project.overview", createdProject);
                webviewAPI.triggerCmd("wso2.choreo.projects.refresh");
                webviewAPI.closeWebView();
            } catch (error: any) {
                setErrorMsg(error.message + " " + error.cause);
            }
        }
        setCreationInProgress(false);
    };

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <h2>New Choreo Project</h2>
                    <OrgSelector />
                    <VSCodeTextField
                        autofocus
                        placeholder="Name"
                        onInput={(e: any) => setProjectName(e.target.value)}
                        value={projectName}
                    >
                        Project Name
                    </VSCodeTextField>
                    <VSCodeTextArea
                        placeholder="Description"
                        onInput={(e: any) => setProjectDescription(e.target.value)}
                        value={projectDescription}
                    >
                        Project Description
                    </VSCodeTextArea>
                    <VSCodeCheckbox
                        checked={initMonoRepo}
                        onChange={handleInitiMonoRepoCheckChange}
                    >
                        Initialize a mono repo
                    </VSCodeCheckbox>
                    {initMonoRepo &&
                        <>
                            <VSCodeLink
                               onClick={() => { ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow(); }}
                            >
                                Authorize with Github
                            </VSCodeLink>
                            <VSCodeDropdown>Select Repository</VSCodeDropdown>
                        </>
                    }
                    {errorMsg !== "" && <ErrorMessageContainer>{errorMsg}</ErrorMessageContainer>}
                    {error && (
                        <ErrorMessageContainer>
                            {error.message + error.cause}
                        </ErrorMessageContainer>
                    )}
                    <ActionContainer>

                        <VSCodeButton
                            appearance="secondary"
                            onClick={() => { ChoreoWebViewAPI.getInstance().closeWebView(); }}
                        >
                                Cancel
                        </VSCodeButton>
                        {creationInProgress && <VSCodeProgressRing />}
                        <VSCodeButton
                            appearance="primary"
                            onClick={handleCreateProject}
                            disabled={creationInProgress}
                        >
                                Create
                        </VSCodeButton>
                    </ActionContainer>
                </WizardContainer>
            )}
        </>
    );
}
