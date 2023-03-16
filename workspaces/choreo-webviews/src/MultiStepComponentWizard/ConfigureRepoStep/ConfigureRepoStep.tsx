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
import { VSCodeTextField, VSCodeLink, VSCodeProgressRing, VSCodeOption, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import { GHAppAuthStatus, GithubOrgnization, GithubRepository } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useCallback, useContext, useEffect, useState } from "react";
import { ErrorIcon, ErrorBanner } from "../../Commons/ErrorBanner";
import { Step, StepProps } from "../../Commons/MultiStepWizard/types";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { GithubRepoBranchSelector } from "../../GithubRepoBranchSelector/GithubRepoBranchSelector";
// import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

const GhRepoSelectorActions = styled.div`
    display  : flex;
    flex-direction: row;
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

export const ConfigureRepoStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;
    const { org, repo, branch, subPath } = formData?.repository || {};
    
    const [isRepoCloned, setIsRepoCloned] = useState<boolean>(false);
    const [authorizedOrgs, setAuthorizedOrgs] = useState<GithubOrgnization[]>([]);
    const [isFetchingRepos, setIsFetchingRepos] = useState(false);
    const [selectedRepository, setSelectedRepo] = useState<[GithubOrgnization,GithubRepository] | undefined>(undefined);
    const [selectedBranch, setSelectedBranch] = useState<string>('');

    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isCloneInProgress, setIsCloneInProgress] = useState<boolean>(false);

    const { choreoProject } = useContext(ChoreoWebViewContext);

    const selectedRepoString = selectedRepository ? `${selectedRepository[0].orgName}/${selectedRepository[1].name}` : "";

    const setRepository = (newOrg: string, newRepo: string) => {
        const repository = { ...formData?.repository, org: newOrg, repo: newRepo };
        onFormDataChange({ repository });
    };
    
    useEffect(() => {
        if (authorizedOrgs.length > 0) {
            setSelectedRepo([authorizedOrgs[0], authorizedOrgs[0].repositories[0]]);
        } else {
            setSelectedRepo(undefined);
        }
    }, [authorizedOrgs]);

    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
        ghClient.status.then((status) => {
            setGHStatus(status);
        });
    }, []);

    const getRepoList = useCallback(async () => {
        setIsFetchingRepos(true);
        setAuthorizedOrgs([]);
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        try {
            const repos = await ghClient.getAuthorizedRepositories();
            setAuthorizedOrgs(repos);
        } catch (error) {
            setAuthorizedOrgs([]);
            console.log("Error while fetching authorized repositories: " + error);
        }
        setIsFetchingRepos(false);
    }, []);

    useEffect(() => {
        if (ghStatus.status === "authorized" || ghStatus.status === "installed") {
            getRepoList();
        }
    }, [getRepoList, ghStatus]);

    useEffect(() => {
        const checkRepoCloneStatus = async () => {
             if (choreoProject && selectedRepoString && selectedBranch) {
                 const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject.id);
                 if (projectPath) {
                     const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                         repository: selectedRepoString,
                         workspaceFilePath: projectPath,
                         branch: selectedBranch
                     });
                     setIsRepoCloned(isCloned);
                 }
             }
         };
         checkRepoCloneStatus();
     }, [selectedBranch, selectedRepoString, choreoProject]);

    const handleAuthorizeWithGithub = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow();
    };

    const handleConfigureNewRepo = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
    };

    const handleGhOrgChange = (e: any) => {
        const org = authorizedOrgs.find(org => org.orgName === e.target.value);
        if (org) {
            setSelectedRepo([org, org.repositories[0]]);
        }
    };

    const handleGhRepoChange = (e: any) => {
        if (selectedRepository) {
            setSelectedRepo([selectedRepository[0], selectedRepository[0].repositories.find(repo => repo.name === e.target.value)!]);
        }
    };

    const handleRepoClone = async () => {
        if (choreoProject?.id && selectedRepository && selectedBranch) {
            setIsCloneInProgress(true);
            const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject?.id);
            if (projectPath) {
                const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().cloneRepo({
                    repository: selectedRepoString,
                    workspaceFilePath: projectPath,
                    branch: selectedBranch
                });
                setIsRepoCloned(isCloned);
            }
            setIsCloneInProgress(false);
        }
    };

    const showRefreshButton = ghStatus.status === "authorized" || ghStatus.status === "installed";
    const showLoader = ghStatus.status === "auth-inprogress" || ghStatus.status === "install-inprogress" || isFetchingRepos;
    const showAuthorizeButton = ghStatus.status === "not-authorized";
    const showConfigureButton = ghStatus.status === "authorized" || ghStatus.status === "installed";
    let loaderMessage = "Loading repositories...";
    if (ghStatus.status === "auth-inprogress") {
        loaderMessage = "Authorizing with Github...";
    } else if (ghStatus.status === "install-inprogress") {
        loaderMessage = "Installing Github App...";
    }

    return (
        <StepContainer>
            <GhRepoSelectorActions>
                {showAuthorizeButton && <VSCodeLink onClick={handleAuthorizeWithGithub}>Authorize with Github</VSCodeLink>}
                {showRefreshButton && <VSCodeLink onClick={getRepoList}>Refresh Repositories</VSCodeLink>}
                {showConfigureButton && <VSCodeLink onClick={handleConfigureNewRepo}>Configure New Repo</VSCodeLink>}

            </GhRepoSelectorActions>
            {showLoader && loaderMessage}
            {showLoader && <VSCodeProgressRing />}
            {showAuthorizeButton && <div>Please authorize to get list of repositories.</div>}
           {authorizedOrgs && authorizedOrgs.length > 0 && (
                <GhRepoSelectorContainer>
                    <GhRepoSelectorOrgContainer>
                        <label htmlFor="org-drop-down">Organization</label>
                        <VSCodeDropdown id="org-drop-down" onChange={handleGhOrgChange}>
                            {authorizedOrgs.map((org) => (
                                <VSCodeOption
                                    key={org.orgName}
                                    value={org.orgName}
                                    selected={selectedRepository && selectedRepository[0]?.orgName === org.orgName}
                                >
                                    {org.orgName}
                                </VSCodeOption>
                            ))}
                        </VSCodeDropdown>
                    </GhRepoSelectorOrgContainer>
                    <GhRepoSelectorRepoContainer>
                        <label htmlFor="repo-drop-down">Repository</label>
                        <VSCodeDropdown id="repo-drop-down" onChange={handleGhRepoChange}>
                            {selectedRepository && selectedRepository[0].repositories.map((repo) => (
                                <VSCodeOption
                                    key={repo.name}
                                    value={repo.name}
                                    selected={selectedRepository[1]?.name === repo.name}
                                >
                                    {repo.name}
                                </VSCodeOption>
                            ))}
                        </VSCodeDropdown>
                    </GhRepoSelectorRepoContainer>
                </GhRepoSelectorContainer>
            )}
            {selectedRepository && selectedRepository[1] && (
                <GithubRepoBranchSelector repository={selectedRepoString} onBranchSelected={setSelectedBranch} />
            )}
            {(selectedRepository && !isRepoCloned) &&
                <>
                    Selected Repository is not available locally in Project folder. Clone the repository to continue.
                    {!isCloneInProgress &&
                        <VSCodeLink onClick={handleRepoClone}>
                            Clone Repository
                        </VSCodeLink>
                    }
                    {isCloneInProgress && 
                        <>
                            <span>Cloning Repository...</span>
                            <VSCodeProgressRing />
                        </>
                    }
                </>
            }
        </StepContainer>
    );
};

export const ConfigureRepoStep: Step<Partial<ComponentWizardState>> = {
    title: 'Configure Repository',
    component: ConfigureRepoStepC,
    validationRules: []
};

