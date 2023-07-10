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
import { GithubAutherizer } from "../GithubRepoSelector/GithubAutherizer";
import { ChoreoAppInstaller } from "../GithubRepoSelector/ChoreoAppInstaller";
import { BitbucketRepoSelector } from "../BitbucketRepoSelector/BitbucketRepoSelector";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { ProjectTypeCard } from "./ProjectTypeCard";
import { CLONE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT, CREATE_COMPONENT_CANCEL_EVENT, CREATE_PROJECT_FAILURE_EVENT, CREATE_PROJECT_START_EVENT, CREATE_PROJECT_SUCCESS_EVENT, GitProvider, GitRepo, Project } from "@wso2-enterprise/choreo-core";
import { FilteredCredentialData } from "@wso2-enterprise/choreo-client/lib/github/types";
import { BitbucketCredSelector } from "../BitbucketCredSelector/BitbucketCredSelector";

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
    padding-bottom: 20px;
`;

const ErrorMessageContainer = styled.div`
    color: var(--vscode-errorForeground);
`;

const GhRepoSelectorActions = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;

const CardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

const SubContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;

const CredContainer = styled.div`
    height: 26px;
`;

const SectionWrapper = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

const RepoStepWrapper = styled.div`
    // Flex Props
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: var(--vscode-panel-border);
    cursor: default;
`;

const RepoStepNumber = styled.div`
    //Flex Props
    display: flex;
    justify-content: center;
    align-items: center;
    align-items: center;
    // End Flex Props
    // Sizing Props
    width: 40px;
    height: 40px;
    // End Sizing Props
    // Border Props
    border-radius: 50%;
    border-style: solid;
    border-width: 1px;
    border-color: var(--vscode-panel-border);
`;

const RepoStepContent = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

export function ProjectWizard() {

    const { loginStatus, loginStatusPending, selectedOrg, error } = useContext(ChoreoWebViewContext);

    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creationInProgress, setCreationInProgress] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [initMonoRepo, setInitMonoRepo] = useState(false);
    const [selectedGHOrgName, setSelectedGHOrgName] = useState("");
    const [selectedGHRepo, setSelectedGHRepo] = useState("");
    const [isBareRepo, setIsBareRepo] = useState(false);
    const [gitProvider, setGitProvider] = useState(undefined);
    const [selectedCredential, setSelectedCredential] = useState<FilteredCredentialData>({ id: '', name: '' });
    const [refreshRepoList, setRefreshRepoList] = useState(false);
    const [projectDir, setProjectDir] = useState("");

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
                    const repoDetails: GitRepo = { provider: gitProvider, orgName: selectedGHOrgName, repoName: selectedGHRepo };
                    if (gitProvider === GitProvider.BITBUCKET) {
                        repoDetails.bitbucketCredentialId = selectedCredential?.id
                    }
                    await webviewAPI.setProjectRepository(createdProject.id, repoDetails);
                }

                handleCloneProject(createdProject);

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

    const handleCloneProject = (project: Project) => {
        ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
            eventName: CLONE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
            properties: {
                project: project?.name
            }
        });
        ChoreoWebViewAPI.getInstance().cloneChoreoProjectWithDir(project, projectDir);
    };

    const handleProjecDirSelection = async () => {
        const projectDirectory = await ChoreoWebViewAPI.getInstance().askProjectDirPath();
        setProjectDir(projectDirectory);
    }

    const handleRepoSelect = (org?: string, repo?: string) => {
        setSelectedGHOrgName(org || "");
        setSelectedGHRepo(repo || "");
    };

    const handleRepoInit = async () => {
        // open github repo in browser with vscode open external
        if (selectedGHOrgName && selectedGHRepo) {
            if (gitProvider === GitProvider.GITHUB) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://github.com/${selectedGHOrgName}/${selectedGHRepo}`);
            } else if (gitProvider === GitProvider.BITBUCKET) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://bitbucket.org/${selectedGHOrgName}/${selectedGHRepo}`);
            }
        }
    };

    const handleNewRepoCreation = async () => {
        if (gitProvider === GitProvider.GITHUB) {
            ChoreoWebViewAPI.getInstance().openExternal(`https://github.com/new`);
        } else if (gitProvider === GitProvider.BITBUCKET) {
            if(!!selectedCredential.id) {
                ChoreoWebViewAPI.getInstance().openExternal(`https://bitbucket.org/${selectedGHOrgName}/workspace/create/repository`);
            }
        }
    }

    const handleRepoRefresh = async () => {
        setRefreshRepoList(!refreshRepoList);
    };

    const changeGitProvider = (type: GitProvider) => {
        setGitProvider(type);
        setSelectedGHOrgName('');
        setSelectedGHRepo('');
        if (type === GitProvider.GITHUB) {
            setSelectedCredential({ id: '', name: '' });
        }
    }


    const isValid: boolean = projectName.length > 0 && !!projectDir && (!initMonoRepo || (!!selectedGHOrgName && !!selectedGHRepo));

    return (
        <>
            {loginStatus !== "LoggedIn" && <SignIn />}
            {!loginStatusPending && loginStatus === "LoggedIn" && (
                <WizardContainer>
                    <h2>New Choreo Project</h2>
                    <SectionWrapper>
                        <h3>Project Details</h3>
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
                    </SectionWrapper>
                    {initMonoRepo &&
                        (
                            <SectionWrapper>
                                <h3>Git Provider Details</h3>
                                <SubContainer>
                                    <CardContainer>
                                        <ProjectTypeCard
                                            type={GitProvider.GITHUB}
                                            label="GitHub"
                                            currentType={gitProvider}
                                            onChange={changeGitProvider}
                                        />
                                        <ProjectTypeCard
                                            type={GitProvider.BITBUCKET}
                                            label="BitBucket"
                                            currentType={gitProvider}
                                            onChange={changeGitProvider}
                                        />
                                    </CardContainer>
                                </SubContainer>
                                <CredContainer>
                                    {gitProvider === GitProvider.GITHUB && <GithubAutherizer />}
                                    {gitProvider === GitProvider.BITBUCKET && <BitbucketCredSelector org={selectedOrg} selectedCred={selectedCredential} onCredSelect={setSelectedCredential} />}
                                </CredContainer>
                            </SectionWrapper>
                        )
                    }
                    {initMonoRepo && gitProvider &&
                        (
                            <SectionWrapper>
                                <h3>Configure Repository</h3>
                                <RepoStepWrapper>
                                    <RepoStepNumber> 1 </RepoStepNumber>
                                    <RepoStepContent>
                                        <h3>  Starting from scratch?  </h3>
                                        <span><VSCodeLink onClick={handleNewRepoCreation}>Create new repo</VSCodeLink> or Proceed to step 2.</span>
                                    </RepoStepContent>
                                </RepoStepWrapper>
                                <RepoStepWrapper>
                                    <RepoStepNumber> 2 </RepoStepNumber>
                                    <RepoStepContent>
                                        {gitProvider === GitProvider.GITHUB && (
                                            <>
                                                <h3>  Install Choreo App to the repo  </h3>
                                                <ChoreoAppInstaller />
                                            </>
                                        )}
                                        {gitProvider === GitProvider.BITBUCKET && (
                                            <>
                                                <h3>  Refresh repository list  </h3>
                                                <VSCodeButton onClick={handleRepoRefresh}>Refresh</VSCodeButton>
                                            </>
                                        )}
                                    </RepoStepContent>
                                </RepoStepWrapper>
                                <RepoStepWrapper>
                                    <RepoStepNumber> 3 </RepoStepNumber>
                                    <RepoStepContent>
                                        <h3>  Select repository  </h3>
                                        {gitProvider === GitProvider.GITHUB &&
                                            <GithubRepoSelector
                                                selectedRepo={{ org: selectedGHOrgName, repo: selectedGHRepo }}
                                                onRepoSelect={handleRepoSelect}
                                            />}
                                        {gitProvider === GitProvider.BITBUCKET &&
                                            <BitbucketRepoSelector
                                                selectedRepo={{ org: selectedGHOrgName, repo: selectedGHRepo }}
                                                onRepoSelect={handleRepoSelect} selectedCred={selectedCredential}
                                                refreshRepoList={refreshRepoList}
                                            />}
                                        {isBareRepo &&
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
                                    </RepoStepContent>
                                </RepoStepWrapper>
                            </SectionWrapper>)
                    }
                    <SectionWrapper>
                        <h3>  Project Location  </h3>
                        <VSCodeLink>
                            <i className={`codicon codicon-folder-opened`} style={{ verticalAlign: "bottom", marginRight: "5px" }} />
                            <span onClick={handleProjecDirSelection}>Browse</span>
                        </VSCodeLink>
                        {!!projectDir && <span>{projectDir}</span>}
                        {!projectDir && <span>Please choose a directory for project workspace</span>}
                    </SectionWrapper>
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
