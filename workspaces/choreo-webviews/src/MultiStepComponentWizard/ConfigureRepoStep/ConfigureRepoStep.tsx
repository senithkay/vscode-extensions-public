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
import { VSCodeLink, VSCodeProgressRing, VSCodeOption, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import { GHAppAuthStatus, GithubOrgnization } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useCallback, useContext, useEffect, useState } from "react";
import { Step, StepProps } from "../../Commons/MultiStepWizard/types";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { GithubRepoBranchSelector } from "./GithubRepoBranchSelector";
import { RepoStructureConfig } from "./RepoStructureConfig";

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
    
    const [isRepoCloned, setIsRepoCloned] = useState<boolean>(false);
    const [isFetchingRepos, setIsFetchingRepos] = useState(false);

    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isCloneInProgress, setIsCloneInProgress] = useState<boolean>(false);

    const { choreoProject } = useContext(ChoreoWebViewContext);

    let selectedRepoString = formData?.repository ? `${formData?.repository?.org}/${formData?.repository?.repo}` : undefined;

    const authorizedOrgs = formData?.cache?.authorizedOrgs || [];
    const selectedOrg = authorizedOrgs.find((org) => org.orgName === formData?.repository?.org) || authorizedOrgs[0];

    if (!selectedRepoString && selectedOrg) {
        selectedRepoString = `${selectedOrg.orgName}/${selectedOrg.repositories[0].name}`;
    }

    const setRepository = (org: string, repo: string) => {
        const repository = { ...formData?.repository, org, repo };
        onFormDataChange({ repository });
    };

    const setAuthorizedOrgs = (orgs: GithubOrgnization[]) => {
        const cache = { ...formData?.cache, authorizedOrgs: orgs };
        onFormDataChange({ cache });
    };


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
        } catch (error: any) {
            setAuthorizedOrgs([]);
            ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. Please authorize with GitHub.");
        }
        setIsFetchingRepos(false);
    }, []);

    useEffect(() => {
        if ((ghStatus.status === "authorized" || ghStatus.status === "installed") && authorizedOrgs.length === 0) {
            getRepoList();
        }
    }, [getRepoList, ghStatus]);

    useEffect(() => {
        const checkRepoCloneStatus = async () => {
             if (choreoProject && selectedRepoString) {
                 const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject.id);
                 if (projectPath) {
                     const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                         repository: selectedRepoString,
                         workspaceFilePath: projectPath,
                         // TODO: Handle this properly from the backend
                         // Currently, backend is not validating the branch name
                         branch: formData?.repository?.branch || "main"
                     });
                     setIsRepoCloned(isCloned);
                 }
             }
         };
         checkRepoCloneStatus();
     }, [formData?.repository?.branch, selectedRepoString, choreoProject]);

    const handleAuthorizeWithGithub = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow();
    };

    const handleConfigureNewRepo = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
    };

    const handleGhOrgChange = (e: any) => {
        const org = authorizedOrgs.find(org => org.orgName === e.target.value);
        if (org) {
            setRepository(org.orgName, org.repositories[0]?.name);
        }
    };

    const handleGhRepoChange = (e: any) => {
        if (selectedOrg) {
            setRepository(selectedOrg.orgName, selectedOrg.repositories.find(repo => repo.name === e.target.value)!.name);
        }
    };

    const handleBranchChange = (branch: string) => {
        const repository = { ...formData?.repository, branch };
        onFormDataChange({ repository });
    };

    const handleRepoClone = async () => {
        if (choreoProject?.id && selectedRepoString && formData?.repository?.branch) {
            setIsCloneInProgress(true);
            const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject?.id);
            if (projectPath) {
                const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().cloneRepo({
                    repository: selectedRepoString,
                    workspaceFilePath: projectPath,
                    branch: formData?.repository?.branch
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
                        <VSCodeDropdown id="org-drop-down" value={formData?.repository?.org} onChange={handleGhOrgChange}>
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
                        <VSCodeDropdown id="repo-drop-down" value={formData?.repository?.repo} onChange={handleGhRepoChange}>
                            {selectedOrg?.repositories.map((repo) => (
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
            {selectedRepoString && !isFetchingRepos && (
                <GithubRepoBranchSelector repository={selectedRepoString} selectedBranch={formData?.repository?.branch} onBranchSelected={handleBranchChange} />
            )}
            {(selectedRepoString && !isRepoCloned) &&
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
            {isRepoCloned && (
                <RepoStructureConfig 
                        formData={formData}
                        onFormDataChange={onFormDataChange}
                />
            )}
        </StepContainer>
    );
};

export const ConfigureRepoStep: Step<Partial<ComponentWizardState>> = {
    title: 'Configure Repository',
    component: ConfigureRepoStepC,
    validationRules: [
        {
            field: 'repository',
            message: 'Repository is not cloned. Please clone the repository to continue.',
            rule: async (value: any, formData, context) => {
                const {  isChoreoProject, choreoProject }  = context;
                if (choreoProject && formData?.repository?.repo && isChoreoProject) {
                    const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject.id);
                    if (projectPath) {
                        const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                            repository: `${formData?.repository?.org}/${formData?.repository?.repo}`,
                            workspaceFilePath: projectPath,
                            // TODO: Handle this properly from the backend
                            // Currently, backend is not validating the branch name
                            branch: formData?.repository?.branch || "main"
                        });
                        return isCloned;
                    }
                }
                return false;
            }
        },
    ]
};
