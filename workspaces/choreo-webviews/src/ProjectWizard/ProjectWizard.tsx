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
import { VSCodeTextField, VSCodeTextArea, VSCodeCheckbox, VSCodeButton, VSCodeProgressRing, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useContext, useEffect, useState } from "react";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { BitbucketRepoSelector } from "../BitbucketRepoSelector/BitbucketRepoSelector";
import { BitbucketCredSelector } from "../BitbucketCredSelector/BitbucketCredSelector";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { CREATE_COMPONENT_CANCEL_EVENT, CREATE_PROJECT_FAILURE_EVENT, CREATE_PROJECT_START_EVENT, CREATE_PROJECT_SUCCESS_EVENT } from "@wso2-enterprise/choreo-core";
import { FilteredCredentialData, GitProvider } from "@wso2-enterprise/choreo-client/lib/github/types";

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

const GhRepoSelectorActions = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;

export function ProjectWizard() {

    const { loginStatus, loginStatusPending, selectedOrg, error } = useContext(ChoreoWebViewContext);

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creationInProgress, setCreationInProgress] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [initMonoRepo, setInitMonoRepo] = useState(true);
    const [selectedGHOrgName, setSelectedGHOrgName] = useState("");
    const [selectedGHRepo, setSelectedGHRepo] = useState("");
    const [isBareRepo, setIsBareRepo] = useState(false);
    const [gitProvider, setGitProvider] = useState(GitProvider.GITHUB);
    const [selectedCredential, setSelectedCredential] = useState<FilteredCredentialData>({ id: '', name: '' });

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
            eventName: CREATE_PROJECT_START_EVENT
        });
    }, []);

    const handleInitiMonoRepoCheckChange = (e: any) => {
        setInitMonoRepo(e.target.checked);
    };

    const handleCreateProject = async () => {
        setCreationInProgress(true);
        const webviewAPI = ChoreoWebViewAPI.getInstance();
        const projectClient = webviewAPI.getProjectClient();
        if (selectedOrg) {
            try {
                // check if the repo is empty
                const repoMetaData = await projectClient.getRepoMetadata({
                    repo: selectedGHRepo,
                    organization: selectedGHOrgName,
                    branch: "main",
                    credentialId: selectedCredential.id
                });
                if (repoMetaData?.isBareRepo) {
                    setIsBareRepo(true);
                    setCreationInProgress(false);
                    return;
                }
                const createdProject = await projectClient.createProject({
                    name: projectName,
                    description: projectDescription,
                    orgId: selectedOrg.id,
                    orgHandle: selectedOrg.handle
                });
                if (initMonoRepo) {
                    await webviewAPI.setProjectRepository(createdProject.id, `${selectedGHOrgName}/${selectedGHRepo}`);
                    await webviewAPI.setProjectProvider(createdProject.id, gitProvider);
                }
                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                    eventName: CREATE_PROJECT_SUCCESS_EVENT, 
                    properties: {
                        name: createdProject?.name,
                    }
                });
                await webviewAPI.triggerCmd("wso2.choreo.projects.registry.refresh");
                await webviewAPI.triggerCmd("wso2.choreo.project.overview", createdProject);
                await webviewAPI.triggerCmd("wso2.choreo.projects.tree.refresh");
                webviewAPI.closeWebView();
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                    eventName: CREATE_PROJECT_FAILURE_EVENT, 
                    properties: {
                        name: projectName,
                        cause: error.message + " " + error.cause
                    }
                });
                setErrorMsg(error.message + " " + error.cause);
            }
        }
        setCreationInProgress(false);
    };

    const handleRepoSelect = (org?: string, repo?: string) => { 
        setSelectedGHOrgName(org || "");
        setSelectedGHRepo(repo || "");
    };

    const handleRepoInit = async () => {
        // open github repo in browser with vscode open external
        if (selectedGHOrgName && selectedGHRepo) {
            if (gitProvider === GitProvider.GITHUB) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://github.com/${selectedGHOrgName}/${selectedGHRepo}`);
            } else if(gitProvider === GitProvider.BITBUCKET) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://bitbucket.org/${selectedGHOrgName}/${selectedGHRepo}`);
            }
        }
    };

    const changeGitProvider = () => {
        if (gitProvider === GitProvider.GITHUB) {
            setGitProvider(GitProvider.BITBUCKET);
        } else {
            setSelectedCredential({ id: '', name: '' });
            setGitProvider(GitProvider.GITHUB);
        }
    }

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
                        // TODO: Add validation
                        // validate={projectName.length > 0}
                        validationMessage="Project name is required"
                        placeholder="Name"
                        onInput={(e: any) => setProjectName(e.target.value)}
                        value={projectName}
                        id='project-name-input'
                    >
                        Project Name <RequiredFormInput />
                    </VSCodeTextField>
                    <VSCodeTextArea
                        placeholder="Description"
                        onInput={(e: any) => setProjectDescription(e.target.value)}
                        value={projectDescription}
                        id='project-description-input'
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
                        (<div>
                            Git Provider: {gitProvider}&nbsp;&nbsp;&nbsp;&nbsp;
                            <VSCodeLink onClick={changeGitProvider}>Change to {gitProvider === GitProvider.GITHUB ? GitProvider.BITBUCKET : GitProvider.GITHUB}</VSCodeLink>
                        </div>)
                    }
                    {initMonoRepo && selectedOrg !== undefined &&
                        (<>
                            {gitProvider === GitProvider.GITHUB && <GithubRepoSelector selectedRepo={{ org: selectedGHOrgName, repo: selectedGHRepo }} onRepoSelect={handleRepoSelect} />}
                            {gitProvider === GitProvider.BITBUCKET && <BitbucketCredSelector org={selectedOrg} selectedCred={selectedCredential} onCredSelect={setSelectedCredential}/>}
                            {gitProvider === GitProvider.BITBUCKET && <BitbucketRepoSelector selectedRepo={{ org: selectedGHOrgName, repo: selectedGHRepo }} onRepoSelect={handleRepoSelect} selectedCred={selectedCredential} />}
                        </>)
                    }
                    {initMonoRepo && isBareRepo &&
                        (<>
                            Repository is not initialized. Please initialize the repository before cloning can continue.
                            <GhRepoSelectorActions>
                                <VSCodeLink onClick={handleRepoInit}>
                                    Initialize
                                </VSCodeLink> 
                                <VSCodeLink onClick={handleCreateProject}>
                                    Recheck & Create Project
                                </VSCodeLink>    
                            </GhRepoSelectorActions>
                        </>)
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
                            onClick={() => { 
                                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                                    eventName: CREATE_COMPONENT_CANCEL_EVENT
                                });
                                ChoreoWebViewAPI.getInstance().closeWebView();
                            }}
                        >
                                Cancel
                        </VSCodeButton>
                        <VSCodeButton
                            appearance="primary"
                            onClick={handleCreateProject}
                            disabled={creationInProgress || !isValid}
                            id='create-project-btn'
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
