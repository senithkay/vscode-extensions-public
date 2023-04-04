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
import { VSCodeLink, VSCodeProgressRing, VSCodeOption, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import { GHAppAuthStatus } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useContext, useEffect, useState } from "react";
import { Step, StepProps } from "../../Commons/MultiStepWizard/types";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { GithubRepoBranchSelector } from "./GithubRepoBranchSelector";
import { RepoStructureConfig } from "./RepoStructureConfig";
import { useQuery } from "@tanstack/react-query";

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

    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isCloneInProgress, setIsCloneInProgress] = useState<boolean>(false);

    const { choreoProject } = useContext(ChoreoWebViewContext);

    const {isLoading: isFetchingRepos, data: authorizedOrgs, refetch } = useQuery({
        queryKey: [`repoData${choreoProject?.id}`], //TODO: add userId to the key instead of choreoProjectId
        queryFn: async () => {
            const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
            try {
                return ghClient.getAuthorizedRepositories();
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. Please authorize with GitHub.");
                throw error;
            }
        }
    });

    const selectedRepoString = formData?.repository ? `${formData?.repository?.org}/${formData?.repository?.repo}` : undefined;

    const selectedOrg = authorizedOrgs && authorizedOrgs.find((org) => org.orgName === formData?.repository?.org);

    const setRepository = (org: string, repo: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, org, repo} }));
    };

    const setIsRepoCloned = (isCloned: boolean ) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, isCloned} }));
    };

    const setDefaultSelection = () => {
        onFormDataChange(prevFormData => {
            let repository = prevFormData?.repository;
            if (!(prevFormData?.repository?.org && prevFormData?.repository?.repo) && authorizedOrgs && authorizedOrgs.length > 0) {
                repository = { ...prevFormData?.repository, org: authorizedOrgs[0].orgName, repo: authorizedOrgs[0].repositories[0].name };
            }
            return { ...prevFormData, repository };
        });
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

    useEffect(() => {
        setDefaultSelection();
    }, [authorizedOrgs]);

    useEffect(() => {
        if (ghStatus.status === "authorized" || ghStatus.status === "installed") {
            refetch();
        }
    }, [ghStatus]);

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
    }, [selectedRepoString, choreoProject]);

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
        const currentOrg = authorizedOrgs && authorizedOrgs.find((org) => org.orgName === formData?.repository?.org);
        if (currentOrg) {
            setRepository(currentOrg.orgName, currentOrg.repositories.find(repo => repo.name === e.target.value)!.name);
        }
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
    const showAuthorizeButton = ghStatus.status === "not-authorized" || ghStatus.status === "error";
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
                {showAuthorizeButton && <span><VSCodeLink onClick={handleAuthorizeWithGithub}>Authorize with Github</VSCodeLink> to refresh</span>}
                {showRefreshButton && <VSCodeLink onClick={() => refetch()}>Refresh Repositories</VSCodeLink>}
                {showConfigureButton && <VSCodeLink onClick={handleConfigureNewRepo}>Configure New Repo</VSCodeLink>}

            </GhRepoSelectorActions>
            {showLoader && loaderMessage}
            {showLoader && <VSCodeProgressRing />}
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
                <GithubRepoBranchSelector 
                    formData={formData}
                    onFormDataChange={onFormDataChange}
                />
            )}
            {(selectedRepoString && !isFetchingRepos  && !formData?.repository?.isCloned) &&
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
            {formData?.repository?.isCloned && (
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
            rule: async (_value: any, formData, context) => {
                const { isChoreoProject, choreoProject } = context;
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
