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
import { VSCodeTextField, VSCodeTextArea, VSCodeCheckbox, VSCodeButton, VSCodeLink, VSCodeDropdown, VSCodeProgressRing, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import { useContext, useEffect, useState } from "react";
import { OrgSelector } from "../OrgSelector/OrgSelector";
import { SignIn } from "../SignIn/SignIn";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { GHAppAuthStatus, GithubOrgnization, GithubRepository } from "@wso2-enterprise/choreo-client/lib/github/types";

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

const GhRepoSelectorContainer = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 30px;
    width: "100%";
`;

const GhRepoSelectorOrgContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
`;

const GhRepoSelectorRepoContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 300px;
`;

const GhRepoSelectorActions = styled.div`
    display  : flex;
    flex-direction: row;
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
    const [authorizedOrgs, setAuthorizedOrgs] = useState<GithubOrgnization[]>([]);
    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isFetchingRepos, setIsFetchingRepos] = useState(false);
    const [selectedGHOrg, setSelectedGHOrg ] = useState<GithubOrgnization | undefined>(undefined);
    const [selectedGHRepo, setSelectedGHRepo ] = useState<GithubRepository | undefined>(undefined);


    async function getRepoList() {
        setIsFetchingRepos(true);
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        try {
            const repos = await ghClient.getAuthorizedRepositories();
            setAuthorizedOrgs(repos);
            setSelectedGHOrg(repos.length > 0 ? repos[0] : undefined)
        } catch (error) {
            setAuthorizedOrgs([]);
            console.log("Error while fetching authorized repositories: " + error);
        }
        setIsFetchingRepos(false);
    }

    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
    }, []);

    useEffect(() => {
        if (initMonoRepo && ghStatus.status === "authorized") {
            getRepoList();
        }
    },[initMonoRepo, ghStatus]);

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

    const handleAuthorizeWithGithub = () => { 
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow(); 
    }

    const handleGhOrgChange = (e: any) => {
        setSelectedGHOrg(authorizedOrgs.find(org => org.orgName === e.target.value));
    };

    const handleGhRepoChange = (e: any) => {
        setSelectedGHRepo(selectedGHOrg?.repositories.find(repo => repo.name === e.target.value));
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
                            <GhRepoSelectorActions>
                                {(ghStatus.status === "auth-inprogress" || isFetchingRepos) && <VSCodeProgressRing />}
                                <VSCodeLink
                                onClick={ghStatus.status === "authorized" ? getRepoList : handleAuthorizeWithGithub}
                                >
                                    {ghStatus.status === "authorized" ? "Refresh Repositories" : "Authorize with Github"}
                                </VSCodeLink>
                                {ghStatus.status === "authorized" && <>|</>}
                                {ghStatus.status === "authorized" && <VSCodeLink>Configure New Repo</VSCodeLink>}
                            </GhRepoSelectorActions>
                            {selectedGHOrg && (
                                <GhRepoSelectorContainer>
                                <GhRepoSelectorOrgContainer>
                                    <label htmlFor="org-drop-down">Organization</label>
                                    <VSCodeDropdown id="org-drop-down" onChange={handleGhOrgChange}>
                                        {authorizedOrgs.map((org) => (
                                            <VSCodeOption
                                                key={org.orgName}
                                                value={org.orgName}
                                            >
                                                {org.orgName}
                                            </VSCodeOption> 
                                        ))}
                                    </VSCodeDropdown>
                                </GhRepoSelectorOrgContainer>
                                <GhRepoSelectorRepoContainer>
                                    <label htmlFor="repo-drop-down">Repository</label>
                                    <VSCodeDropdown id="repo-drop-down" onChange={handleGhRepoChange}>
                                        {selectedGHOrg && selectedGHOrg.repositories.map((repo) => (
                                            <VSCodeOption
                                                key={repo.name}
                                                value={repo.name}
                                            >
                                                {repo.name}
                                            </VSCodeOption> 
                                        ))}
                                    </VSCodeDropdown>
                                </GhRepoSelectorRepoContainer>
                            </GhRepoSelectorContainer>
                            )}
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
