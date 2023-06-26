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
import { CredentialData, FilteredCredentialData, GHAppAuthStatus, GitProvider } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useContext, useEffect, useState } from "react";
import { Step, StepProps } from "../../Commons/MultiStepWizard/types";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { GithubRepoBranchSelector } from "./GithubRepoBranchSelector";
import { RepoStructureConfig } from "./RepoStructureConfig";
import { useQuery } from "@tanstack/react-query";
import { ProjectTypeCard } from "../../ProjectWizard/ProjectTypeCard";
import { ChoreoComponentType, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";

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

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
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

export const ConfigureRepoStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange, stepValidationErrors } = props;

    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isCloneInProgress, setIsCloneInProgress] = useState<boolean>(false);
    const [credentials, setCredentials] = useState<FilteredCredentialData[]>([]);
    const [selectedCredential, setSelectedCredential] = useState<FilteredCredentialData>({ id: '', name: '' });


    const { choreoProject, selectedOrg: org } = useContext(ChoreoWebViewContext);

    const { isLoading: isFetchingCredentials, data: gitCredentialsData, refetch: refetchCredentials, isRefetching: isRefetching } = useQuery({
        queryKey: [org],
        queryFn: async () => ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().getCredentials(org.uuid),
        enabled: !!org
    });

    useEffect(() => {
        const credentialNameArr: FilteredCredentialData[] = [];
        if (gitCredentialsData && gitCredentialsData.length > 0) {
            gitCredentialsData?.forEach(
                (cred: CredentialData) => {
                    if (cred.type === GitProvider.BITBUCKET) {
                        const i: FilteredCredentialData = {
                            id: cred.id,
                            name: cred.name
                        };
                        credentialNameArr.push(i);
                    }
                }
            );
            setCredentials(credentialNameArr);
        }
    }, [gitCredentialsData]);

    const handleCredDropdownChange = (credName: string) => {
        let credId = '';
        if (credName) {
            credentials?.forEach(
                (credential: FilteredCredentialData) => {
                    if (credential.name === credName) {
                        credId = credential.id;
                    };
                }
            );

            setSelectedCredential({ id: credId, name: credName });
            setCredential(credId);
        }
    };

    const handleConfigureNewCred = async () => {
        // open add credentials page in browser with vscode open external
        ChoreoWebViewAPI.getInstance().openExternal(`https://console.choreo.dev/`);
    };

    const { isLoading: isFetchingRepos, data: authorizedOrgs, refetch, isRefetching: isRefetchingRepos } = useQuery({
        queryKey: [`repoData${choreoProject?.id}`], //TODO: add userId to the key instead of choreoProjectId
        queryFn: async () => {
            const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
            try {
                return ghClient.getUserRepos(selectedCredential.id);
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. Please authorize with GitHub.");
                throw error;
            }
        }
    });

    useEffect(() => {
        refetch();
    }, [selectedCredential]);
    
    const gitProvider = formData?.repository?.gitProvider;

    const selectedRepoString = formData?.repository ? `${formData?.repository?.org}/${formData?.repository?.repo}` : undefined;

    const filteredOrgs = authorizedOrgs?.filter(org => org.repositories.length > 0);

    const selectedOrg = filteredOrgs && filteredOrgs.find((org) => org.orgName === formData?.repository?.org);

    const setGitProvider = (gitProvider: GitProvider) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, gitProvider } }));
    };

    const setCredential = (credentialID: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, credentialID } }));
    };

    const setRepository = (org: string, repo: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, org, repo } }));
        ChoreoWebViewAPI.getInstance().setPreferredProjectRepository(choreoProject?.id, `${org}/${repo}`);
    };

    const setIsRepoCloned = (isCloned: boolean) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, isCloned } }));
    };

    const setIsBareRepo = (isBareRepo: boolean) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, isBareRepo } }));
    };

    const setDefaultSelection = async () => {
        const preferredRepo = await ChoreoWebViewAPI.getInstance().getPreferredProjectRepository(choreoProject?.id);
        onFormDataChange(prevFormData => {
            let repository = prevFormData?.repository;
            if (!(prevFormData?.repository?.org && prevFormData?.repository?.repo) && filteredOrgs && filteredOrgs.length > 0) {
                if (preferredRepo) {
                    // split the repo string to org and repo
                    const parts = preferredRepo.split("/");
                    if (parts.length !== 2) {
                        throw new Error(`Invalid repo string: ${preferredRepo}`);
                    }
                    const org = filteredOrgs.find((org) => org.orgName === parts[0]);
                    if (org) {
                        const repo = org.repositories.find((repo) => repo.name === parts[1]);
                        if (repo) {
                            repository = { ...prevFormData?.repository, org: parts[0], repo: parts[1] };
                        }
                    }
                } else {
                    const selectedOrg = filteredOrgs.find((org) => org.repositories.length > 0);
                    if (!selectedOrg) {
                        throw new Error("No repositories found");
                    }
                    repository = { ...prevFormData?.repository, org: selectedOrg.orgName, repo: selectedOrg.repositories[0]?.name };
                    ChoreoWebViewAPI.getInstance().setPreferredProjectRepository(choreoProject?.id, `${repository.org}/${repository.repo}`);
                }
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
                        branch: formData?.repository?.branch || "main",
                        gitProvider: gitProvider
                    });
                    setIsRepoCloned(isCloned);
                }
            }
        };
        checkRepoCloneStatus();
    }, [selectedRepoString, choreoProject]);

    const changeGitProvider = (type: GitProvider) => {
        if (type === GitProvider.BITBUCKET) {
            setSelectedCredential({ id: '', name: '' });
            setCredential('');
        }
        setGitProvider(type);
        setRepository(undefined, undefined);
    }

    const handleAuthorizeWithGithub = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow();
    };

    const handleConfigureNewRepo = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
    };

    const handleGhOrgChange = (e: any) => {
        const org = filteredOrgs.find(org => org.orgName === e.target.value);
        if (org) {
            setRepository(org.orgName, org.repositories[0]?.name);
        }
    };

    const handleGhRepoChange = (e: any) => {
        const currentOrg = filteredOrgs && filteredOrgs.find((org) => org.orgName === formData?.repository?.org);
        if (currentOrg) {
            setRepository(currentOrg.orgName, currentOrg.repositories.find(repo => repo.name === e.target.value)!.name);
        }
    };

    const handleRepoClone = async () => {
        if (choreoProject?.id && selectedRepoString) {
            setIsBareRepo(false);
            setIsCloneInProgress(true);
            // check if the repo is empty
            const repoMetaData = await ChoreoWebViewAPI.getInstance().getProjectClient().getRepoMetadata({
                repo: formData?.repository?.repo,
                organization: formData?.repository?.org,
                branch: formData?.repository?.branch,
                credentialId: selectedCredential.id
            });
            if (repoMetaData?.isBareRepo) {
                setIsBareRepo(true);
                setIsCloneInProgress(false);
                return;
            }
            const projectPath = await ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject?.id);
            if (projectPath) {
                const isCloned = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().cloneRepo({
                    repository: selectedRepoString,
                    workspaceFilePath: projectPath,
                    branch: formData?.repository?.branch,
                    gitProvider: gitProvider
                });
                setIsRepoCloned(isCloned);
            }
            setIsCloneInProgress(false);
        }
    };

    const handleRepoInit = async () => {
        // open github repo in browser with vscode open external
        if (choreoProject?.id && selectedRepoString) {
            if (gitProvider === GitProvider.GITHUB) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://github.com/${selectedRepoString}`);
            } else if (gitProvider === GitProvider.BITBUCKET) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://bitbucket.org/${selectedRepoString}`);
            }
        }
    };

    const showRefreshButton = ghStatus.status === "authorized" || ghStatus.status === "installed";
    const showLoader = ghStatus.status === "auth-inprogress" || ghStatus.status === "install-inprogress" || isFetchingRepos;
    const showAuthorizeButton = ghStatus.status === "not-authorized" || ghStatus.status === "error";
    const showConfigureButton = ghStatus.status === "authorized" || ghStatus.status === "installed";
    const showCredLoader = isFetchingCredentials || isRefetching;
    let loaderMessage = "Loading repositories...";
    if (ghStatus.status === "auth-inprogress") {
        loaderMessage = "Authorizing with Github...";
    } else if (ghStatus.status === "install-inprogress") {
        loaderMessage = "Installing Github App...";
    }

    return (
        <StepContainer>
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
            {gitProvider === GitProvider.GITHUB && (
                <>
                    <GhRepoSelectorActions>
                        {showAuthorizeButton && <span><VSCodeLink onClick={handleAuthorizeWithGithub}>Authorize with Github</VSCodeLink> to refresh repo list or to configure a new repository.</span>}
                        {showRefreshButton && <VSCodeLink onClick={() => refetch()}>Refresh Repositories</VSCodeLink>}
                        {showConfigureButton && <VSCodeLink onClick={handleConfigureNewRepo}>Configure New Repo</VSCodeLink>}
                        {!showLoader && isRefetchingRepos && <SmallProgressRing />}
                    </GhRepoSelectorActions>
                </>
            )}
            {gitProvider === GitProvider.BITBUCKET && (
                <>
                    <GhRepoSelectorActions>
                        {showRefreshButton && <VSCodeLink onClick={() => refetchCredentials()}>Refresh Credentials</VSCodeLink>}
                        {showCredLoader && <SmallProgressRing />}
                    </GhRepoSelectorActions>
                    {!isFetchingCredentials && credentials.length === 0 &&
                        <VSCodeLink onClick={handleConfigureNewCred}>Configure New Credential</VSCodeLink>
                    }
                    {!isFetchingCredentials &&
                        (<>
                            <GhRepoSelectorContainer>
                                <GhRepoSelectorOrgContainer>
                                    <label htmlFor="cred-drop-down">Select Credential</label>
                                    <VSCodeDropdown
                                        id="cred-drop-down"
                                        value={selectedCredential.name}
                                        onChange={(e: any) => { handleCredDropdownChange(e.target.value) }}>
                                        {credentials.map((credential) => (
                                            <VSCodeOption
                                                key={credential.id}
                                                value={credential.name}
                                                id={`cred-item-${credential.name}`}
                                            >
                                                {credential.name}
                                            </VSCodeOption>
                                        ))}
                                    </VSCodeDropdown>
                                </GhRepoSelectorOrgContainer>
                            </GhRepoSelectorContainer>
                        </>)
                    }
                    <GhRepoSelectorActions>
                        {showRefreshButton && <VSCodeLink onClick={() => refetch()}>Refresh Repositories</VSCodeLink>}
                        {!showLoader && isRefetchingRepos && <SmallProgressRing />}
                    </GhRepoSelectorActions>
                </>
            )}
            {showLoader && loaderMessage}
            {showLoader && <VSCodeProgressRing />}
            {filteredOrgs && filteredOrgs.length > 0 && (
                <GhRepoSelectorContainer>
                    <GhRepoSelectorOrgContainer>
                        <label htmlFor="org-drop-down">Organization</label>
                        <VSCodeDropdown id="org-drop-down" value={formData?.repository?.org} onChange={handleGhOrgChange}>
                            {filteredOrgs.map((org) => (
                                <VSCodeOption
                                    key={org.orgName}
                                    value={org.orgName}
                                    id={`org-item-${org.orgName}`}
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
                                    id={`repo-item-${repo.name}`}
                                >
                                    {repo.name}
                                </VSCodeOption>
                            ))}
                        </VSCodeDropdown>
                    </GhRepoSelectorRepoContainer>
                </GhRepoSelectorContainer>
            )}
            {
                !isFetchingRepos && !formData?.repository?.isCloned && !formData?.repository?.isBareRepo && !isCloneInProgress && (
                    <>
                        Selected Repository is not available locally in Project folder. Clone the repository to continue.
                        <VSCodeLink onClick={handleRepoClone}>
                            Clone Repository
                        </VSCodeLink>
                    </>
                )
            }
            {
                !isFetchingRepos && formData?.repository?.isBareRepo && (
                    <>
                        Repository is not initialized. Please initialize the repository before cloning can continue.
                        <GhRepoSelectorActions>
                            <VSCodeLink onClick={handleRepoInit}>
                                Initialize
                            </VSCodeLink>
                            <VSCodeLink onClick={handleRepoClone}>
                                Recheck & Clone
                            </VSCodeLink>
                        </GhRepoSelectorActions>
                    </>
                )
            }
            {
                isCloneInProgress && (
                    <>
                        <span>Cloning Repository...</span>
                        <VSCodeProgressRing />
                    </>
                )
            }

            {selectedRepoString && !isFetchingRepos && formData?.repository?.isCloned && !formData?.repository?.isBareRepo && (
                <GithubRepoBranchSelector
                    formData={formData}
                    onFormDataChange={onFormDataChange}
                />
            )}
            {formData?.repository?.isCloned && !formData?.repository?.isBareRepo && (
                <RepoStructureConfig
                    formData={formData}
                    onFormDataChange={onFormDataChange}
                    formErrors={stepValidationErrors}
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
            rule: async (_value: any, formData) => {
                return formData?.repository?.isCloned;
            }
        },
        {
            field: 'repository',
            message: 'Repository is not initialized. Please initialize the repository to continue.',
            rule: async (_value: any, formData) => {
                return formData?.repository?.isBareRepo === false;
            }
        },
        {
            field: 'repository',
            message: 'A branch must be selected to continue.',
            rule: async (_value: any, formData) => {
                return formData?.repository?.branch !== undefined;
            }
        },

        // web app config related validations
        {

            field: "webAppConfig",
            message: "Package manager version is invalid",
            rule: async (value, formData) => {
                if (
                    formData.type === ChoreoComponentType.WebApplication &&
                    [
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                    ].includes(formData.implementationType)
                ) {
                    const nodeRegex = new RegExp(/^(?=.*\d)\d+(\.\d+)*(?:-[a-zA-Z0-9]+)?$/)
                    return nodeRegex.test(value?.webAppPackageManagerVersion)
                }
                return true;
            },
        },
        {
            field: "webAppConfig",
            message: "Build command is required",
            rule: async (value, formData) => {
                if (
                    formData.type === ChoreoComponentType.WebApplication &&
                    [
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                    ].includes(formData.implementationType)
                ) {
                    return value?.webAppBuildCommand?.length > 0
                }
                return true;
            },
        },
        {

            field: "webAppConfig",
            message: "Build output directory is required",
            rule: async (value, formData) => {
                if (
                    formData.type === ChoreoComponentType.WebApplication &&
                    [
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                    ].includes(formData.implementationType)
                ) {
                    return value?.webAppOutputDirectory?.length > 0
                }
                return true;
            },
        },
        {
            field: 'port',
            message: 'Port is required',
            rule: async (value, formData) => {
                if (
                    formData.type === ChoreoComponentType.WebApplication &&
                    formData.implementationType === ChoreoImplementationType.Docker
                ) {
                    return value !== undefined && value !== '';                
                }
                return true;
            }
        },
        {
            field: 'port',
            message: 'Port should be a number',
            rule: async (value: any, formData) => {
                if (
                    formData.type === ChoreoComponentType.WebApplication &&
                    formData.implementationType === ChoreoImplementationType.Docker
                ) {
                    return value !== undefined && !isNaN(value)
                }
                return true;
            }
        },
    ]
};
