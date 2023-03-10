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
import { VSCodeTextField, VSCodeTextArea, VSCodeCheckbox, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useContext, useState } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { RequiredFormInput } from "../Commons/RequiredInput";

const WizardContainer = styled.div`
    width: 100%;
    display  : flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
`;

const ErrorMessageContainer = styled.div`
    color: var(--vscode-errorForeground);
`;

export function ProjectWizard() {

    const { loginStatus, loginStatusPending, selectedOrg, error } = useContext(ChoreoWebViewContext);

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creationInProgress, setCreationInProgress] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [initMonoRepo, setInitMonoRepo] = useState(true);
    const [githubRepo, setGithubRepo] = useState("");

    const handleInitiMonoRepoCheckChange = (e: any) => {
        setInitMonoRepo(e.target.checked);
    };

    const handleCreateProject = async () => {
        setCreationInProgress(true);
        const webviewAPI = ChoreoWebViewAPI.getInstance();
        const projectClient = webviewAPI.getProjectClient();
        if (selectedOrg) {
            try {
                const createdProject = await projectClient.createProject({
                    name: projectName,
                    description: projectDescription,
                    orgId: selectedOrg.id,
                    orgHandle: selectedOrg.handle
                });
                await webviewAPI.setProjectRepository(createdProject.id, githubRepo);
                await webviewAPI.triggerCmd("wso2.choreo.projects.registry.refresh");
                await webviewAPI.triggerCmd("wso2.choreo.project.overview", createdProject);
                await webviewAPI.triggerCmd("wso2.choreo.projects.tree.refresh");
                webviewAPI.closeWebView();
            } catch (error: any) {
                setErrorMsg(error.message + " " + error.cause);
            }
        }
        setCreationInProgress(false);
    };

    const handleRepoSelect = (org?: string, repo?: string) => { 
        if (org && repo) {
            setGithubRepo(`${org}/${repo}`);
        } else {
            setGithubRepo("");
        }
    };

    const isValid: boolean = projectName.length > 0;

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <h2>New Choreo Project</h2>
                    
                    <VSCodeTextField
                        disabled={true}
                        value={selectedOrg?.name || "loading..."}
                        title="To change the Organization, Go to `Account` view."
                    >
                        Organization 
                    </VSCodeTextField>
                    <VSCodeTextField
                        autofocus
                        validate={projectName.length > 0}
                        validationMessage="Project name is required"
                        placeholder="Name"
                        onInput={(e: any) => setProjectName(e.target.value)}
                        value={projectName}
                    >
                        Project Name <RequiredFormInput />
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
                    {initMonoRepo && <GithubRepoSelector onRepoSelect={handleRepoSelect} />}
                    {errorMsg !== "" && <ErrorMessageContainer>{errorMsg}</ErrorMessageContainer>}
                    {error && (
                        <ErrorMessageContainer>
                            {error.message + error.cause}
                        </ErrorMessageContainer>
                    )}
                    {initMonoRepo && 
                        <VSCodeTextField
                            autofocus
                            readOnly={true}
                            value={githubRepo}
                        >
                            Selected Repository
                        </VSCodeTextField>
                    }
                    <ActionContainer>

                        <VSCodeButton
                            appearance="secondary"
                            onClick={() => { ChoreoWebViewAPI.getInstance().closeWebView(); }}
                        >
                                Cancel
                        </VSCodeButton>
                        <VSCodeButton
                            appearance="primary"
                            onClick={handleCreateProject}
                            disabled={creationInProgress || !isValid}
                        >
                                Create
                        </VSCodeButton>
                        {creationInProgress && <VSCodeProgressRing />}
                    </ActionContainer>
                </WizardContainer>
            )}
        </>
    );
}
