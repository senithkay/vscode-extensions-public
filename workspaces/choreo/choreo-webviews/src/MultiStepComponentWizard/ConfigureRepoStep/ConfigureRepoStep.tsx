/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import { VSCodeLink, VSCodeProgressRing, VSCodeOption, VSCodeDropdown, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { GHAppAuthStatus } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useEffect, useState } from "react";
import { Step, StepProps } from "../../Commons/MultiStepWizard/types";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { ComponentWizardState } from "../types";
import { GithubRepoBranchSelector } from "./GithubRepoBranchSelector";
import { RepoStructureConfig } from "./RepoStructureConfig";
import { useQuery } from "@tanstack/react-query";
import { ProviderTypeCard } from "../../ProjectWizard/ProviderTypeCard";
import { ChoreoComponentType, ChoreoImplementationType, GitProvider, GitRepo } from "@wso2-enterprise/choreo-core";
import { Codicon } from "../../Codicon/Codicon";
import { ProgressIndicator } from "@wso2-enterprise/ui-toolkit/lib/components/ProgressIndicator";
import { Typography } from "@wso2-enterprise/ui-toolkit/lib/components/Typography";
import { SectionWrapper } from "../../ProjectWizard/ProjectWizard";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

const RepoSelectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 30px;
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
    margin-right: 80px;
`;

const GhRepoSelectorRepoContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
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

const RefreshBtn = styled(VSCodeButton)`
    margin-top: auto;
    padding: 1px;
`;

const CredSelectorActions = styled.div`
    display  : flex;
    flex-direction: row;
    padding: 20px 0;
`;

const CredListContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    gap: 20px;
`;

const RepoStepWrapper = styled.div`
    // Flex Props
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    position: relative;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    gap: 10px;
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

const ListItemWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;

const ListWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 10px;
`;

export const ConfigureRepoStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange, stepValidationErrors } = props;

    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isCloneInProgress, setIsCloneInProgress] = useState<boolean>(false);
    const selectedCredentialId = formData?.repository?.credentialID;
    const gitProvider = formData?.repository?.gitProvider;
    const isMonoRepo = formData?.repository?.isMonoRepo;

    const { choreoProject, currentProjectOrg: org } = useChoreoWebViewContext();

    const { isLoading: isFetchingCredentials, data: credentials, refetch: refetchCredentials, isRefetching: isRefetching } = useQuery({
        queryKey: ['git-bitbucket-credentials', org?.uuid, gitProvider],
        queryFn: async () => {
            return ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().getCredentials(org?.uuid, org.id);
        },
        select: (gitCredentialsData) => {
            return gitCredentialsData?.filter(item => item.type === GitProvider.BITBUCKET).map(({ id, name }) => ({ id, name }));
        },
        enabled: !!org?.uuid && gitProvider === GitProvider.BITBUCKET,
        onSuccess: (data) => {
            if (data?.length > 0 && (!selectedCredentialId || !data.some(item => item.id === selectedCredentialId))) {
                onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, credentialID: data[0].id } }));
            }
        }
    });

    const selectedCredential = credentials ? credentials.find(cred => (cred.id === selectedCredentialId && cred.name)) : "";
    const selectedCredName = selectedCredential ? selectedCredential.name : "";

    const handleConfigureNewCred = async () => {
        // open add credentials page in browser with vscode open external
        const consoleUrl = await ChoreoWebViewAPI.getInstance().getConsoleUrl();
        ChoreoWebViewAPI.getInstance().openExternal(`${consoleUrl}/organizations/${org.name}/settings/credentials`);
    };

    const handleBitbucketDropdownChange = (credName: string) => {
        let credId = '';
        if (credName) {
            credentials?.forEach(
                (credential) => {
                    if (credential.name === credName) {
                        credId = credential.id;
                    }
                }
            )

            setCredential(credId);
        }
    };

    const { isLoading: isFetchingRepos, data: githubOrgs, refetch, isRefetching: isRefetchingRepos } = useQuery({
        queryKey: [`repoData${choreoProject?.id}`, gitProvider, selectedCredentialId], //TODO: add userId to the key instead of choreoProjectId
        queryFn: async () => {
            const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
            try {
                if (gitProvider === GitProvider.GITHUB) {
                    return ghClient.getAuthorizedRepositories(org?.id);
                } else if (gitProvider === GitProvider.BITBUCKET && selectedCredentialId) {
                    return ghClient.getUserRepos(selectedCredentialId, org?.id);
                }
                return [];
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. Please authorize with GitHub.");
                throw error;
            }
        },
        select: (orgs) => orgs?.filter(org => org.repositories.length > 0),
        onSuccess: gitOrgList => {
            if (gitOrgList.length > 0 && (!formData?.repository?.org || !gitOrgList.some(item => item.orgName === formData?.repository?.org))) {
                onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, org: gitOrgList[0].orgName } }));
                if (gitOrgList[0].repositories?.length > 0 && (!formData?.repository?.repo || !gitOrgList[0].repositories.some(item => item.name === formData?.repository?.repo))) {
                    onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, repo: gitOrgList[0].repositories[0].name } }));
                }
            }
        }
    });

    const selectedRepoString = formData?.repository ? `${formData?.repository?.org}/${formData?.repository?.repo}` : undefined;

    const selectedOrg = githubOrgs && githubOrgs.find((org) => org.orgName === formData?.repository?.org);

    const setGitProvider = (gitProvider: GitProvider) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, gitProvider } }));
    };

    const setCredential = (credentialID: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, credentialID } }));
    };

    const setRepository = (org: string, repo: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, org, repo } }));
        const preferredRepo: GitRepo = { provider: gitProvider, orgName: org, repoName: repo };
        if (gitProvider === GitProvider.BITBUCKET) {
            preferredRepo.bitbucketCredentialId = selectedCredentialId;
        }
        ChoreoWebViewAPI.getInstance().setPreferredProjectRepository(choreoProject?.id, preferredRepo);
    };

    const setIsRepoCloned = (isCloned: boolean) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, isCloned } }));
    };

    const setIsBareRepo = (isBareRepo: boolean) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, repository: { ...prevFormData.repository, isBareRepo } }));
    };



    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
        ghClient.checkAuthStatus();
        ghClient.status.then((status) => {
            setGHStatus(status);
        });
    }, []);


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
        setGitProvider(type);
    }

    const handleAuthorizeWithGithub = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow();
    };

    const handleNewRepoCreation = async () => {
        if (gitProvider === GitProvider.GITHUB) {
            ChoreoWebViewAPI.getInstance().openExternal(`https://github.com/new`);
        } else if (gitProvider === GitProvider.BITBUCKET) {
            ChoreoWebViewAPI.getInstance().openExternal(`https://bitbucket.org/${formData?.repository?.org}/workspace/create/repository`);
        }
    }

    const handleConfigureNewRepo = async () => {
        setGHStatus({ status: "install-inprogress" });
        await ChoreoWebViewAPI.getInstance().setChoreoInstallOrg(org.id);
        const success = await ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
        await ChoreoWebViewAPI.getInstance().clearChoreoInstallOrg();
        if (success) {
            setGHStatus({ status: "installed" });
        } else {
            setGHStatus({ status: "error" });
        }
    };

    let appInstallerLoaderMessage;
    if (ghStatus.status === "install-inprogress") {
        appInstallerLoaderMessage = "Installing Choreo App...";
    } else {
        appInstallerLoaderMessage = "";
    }

    const handleGuideClick = async () => {
        ChoreoWebViewAPI.getInstance().openExternal(`https://wso2.com/choreo/docs/develop-components/deploy-a-containerized-application/#connect-your-repository-to-choreo`);
    }

    const handleGhOrgChange = (e: any) => {
        const org = githubOrgs.find(org => org.orgName === e.target.value);
        if (org) {
            setRepository(org.orgName, org.repositories[0]?.name);
        }
    };

    const handleGhRepoChange = (e: any) => {
        const currentOrg = githubOrgs && githubOrgs.find((org) => org.orgName === formData?.repository?.org);
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
                orgId: org.id,
                orgHandle: org.handle,
                repo: formData?.repository?.repo,
                organization: formData?.repository?.org,
                branch: formData?.repository?.branch,
                credentialId: selectedCredentialId
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

    const showAuthLoader = ghStatus.status === "auth-inprogress" || ghStatus.status === "install-inprogress" || isFetchingRepos;
    const showAuthorizeButton = ghStatus.status === "not-authorized" || ghStatus.status === "error";
    const showRepoProgressBar = isRefetchingRepos || isFetchingRepos;
    const showCredLoader = isFetchingCredentials || isRefetching;
    let authLoaderMessage = "";
    if (ghStatus.status === "auth-inprogress") {
        authLoaderMessage = "Authorizing with Github...";
    } else if (ghStatus.status === "install-inprogress") {
        authLoaderMessage = "Installing Github App...";
    }
    const repoLoaderMessage = "Loading repositories...";

    return (
        <StepContainer>
            {!isMonoRepo && (<>
                <SectionWrapper>
                    <Typography variant="h4">Git Provider Details</Typography>
                    <SubContainer>
                        <CardContainer>
                            <ProviderTypeCard
                                type={GitProvider.GITHUB}
                                label="GitHub"
                                currentType={gitProvider}
                                onChange={changeGitProvider}
                            />
                            <ProviderTypeCard
                                type={GitProvider.BITBUCKET}
                                label="BitBucket"
                                currentType={gitProvider}
                                onChange={changeGitProvider}
                            />
                        </CardContainer>
                    </SubContainer>
                    {gitProvider === GitProvider.GITHUB && (
                        <GhRepoSelectorActions>
                            {showAuthorizeButton && <span><VSCodeLink onClick={handleAuthorizeWithGithub}>Authorize with Github</VSCodeLink> to refresh repo list or to configure a new repository.</span>}
                            {showAuthLoader && authLoaderMessage}
                        </GhRepoSelectorActions>
                    )}
                    {gitProvider === GitProvider.BITBUCKET && (
                        <>
                            {!isFetchingCredentials && credentials.length === 0 &&
                                <CredSelectorActions>
                                    <span>No Credentials available. Please <VSCodeLink onClick={handleConfigureNewCred}>Configure New Credential</VSCodeLink> in bitbucket.</span>
                                </CredSelectorActions>
                            }
                            {!isFetchingCredentials &&
                                (<>
                                    <CredListContainer>
                                        Select Credential
                                        <VSCodeDropdown
                                            id="cred-drop-down"
                                            value={selectedCredName}
                                            onChange={(e: any) => {
                                                handleBitbucketDropdownChange(e.target.value)
                                            }}>
                                            <VSCodeOption
                                                key={''}
                                                value={''}
                                                id={`cred-item-null`}
                                            >
                                                {''}
                                            </VSCodeOption>
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
                                        <RefreshBtn
                                            appearance="icon"
                                            onClick={() => refetchCredentials()}
                                            title="Refresh credentials"
                                            disabled={isRefetching}
                                            id='refresh-credentials-btn'
                                        >
                                            <Codicon name="refresh" />
                                        </RefreshBtn>
                                    </CredListContainer>
                                </>)
                            }
                            {(showCredLoader || showAuthLoader) && <ProgressIndicator />}
                        </>
                    )}
                </SectionWrapper>
                <SectionWrapper>
                    <RepoStepWrapper>
                        <RepoStepNumber> 1 </RepoStepNumber>
                        <RepoStepContent>
                            <Typography variant="h3">  Starting from scratch?  </Typography>
                            {gitProvider === GitProvider.GITHUB && (
                                <StepContainer>
                                    <ListItemWrapper>
                                        <Codicon name="circle-filled" />
                                        <span>Create a <VSCodeLink onClick={handleNewRepoCreation}>New Repository</VSCodeLink> in GitHub.</span>
                                    </ListItemWrapper>
                                    <ListWrapper>
                                        <ListItemWrapper>
                                            <Codicon name="circle-filled" />
                                            <span>Give repository permissions to Choreo by installing Github Application. See <VSCodeLink onClick={handleGuideClick}>Installation Guide</VSCodeLink> for more information</span>
                                        </ListItemWrapper>
                                        <ListItemWrapper style={{ marginLeft: '25px' }}>
                                            <Codicon name="circle-outline" />
                                            <span>Install the <VSCodeLink onClick={handleConfigureNewRepo}>Choreo Application</VSCodeLink> to the repository.</span>
                                            {appInstallerLoaderMessage}
                                        </ListItemWrapper>
                                    </ListWrapper>
                                    <ListItemWrapper>
                                        <Codicon name="circle-filled" />
                                        <span>Select the newly created repo from Select repository.</span>
                                    </ListItemWrapper>
                                </StepContainer>
                            )}
                            {gitProvider === GitProvider.BITBUCKET && (
                                selectedCredentialId ? (
                                    <StepContainer>
                                        <ListItemWrapper>
                                            <Codicon name="circle-filled" />
                                            <span>Create a <VSCodeLink onClick={handleNewRepoCreation}>New Repository</VSCodeLink> in bitbucket.</span>
                                        </ListItemWrapper>
                                        <ListItemWrapper>
                                            <Codicon name="circle-filled" />
                                            <span>Select the newly created repo from Select repository.</span>
                                        </ListItemWrapper>
                                    </StepContainer>
                                ) : (
                                    <span>Please select a bitbucket credential.</span>
                                )
                            )}
                        </RepoStepContent>
                    </RepoStepWrapper>
                    <RepoStepWrapper>
                        <RepoStepNumber> 2 </RepoStepNumber>
                        <RepoStepContent>
                            <Typography variant="h3">  Select repository  </Typography>
                            {showRepoProgressBar && repoLoaderMessage}
                            {(gitProvider === GitProvider.GITHUB || selectedCredentialId) ? (
                                <RepoSelectorContainer>
                                    <span>Select the desired repository.</span>
                                    {githubOrgs && githubOrgs.length > 0 && (
                                        <GhRepoSelectorContainer>
                                            <GhRepoSelectorOrgContainer>
                                                <label htmlFor="org-drop-down">Organization</label>
                                                <VSCodeDropdown id="org-drop-down" value={formData?.repository?.org} onChange={handleGhOrgChange}>
                                                    {githubOrgs.map((org) => (
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
                                </RepoSelectorContainer>
                            ) : (
                                <span>"Please select a bitbucket credential."</span>
                            )}

                        </RepoStepContent>
                        {showRepoProgressBar && <ProgressIndicator />}
                    </RepoStepWrapper>
                </SectionWrapper>
            </>)}
            {formData?.repository?.isCloned && !formData?.repository?.isBareRepo && (
                <SectionWrapper>
                    <RepoStructureConfig
                        formData={formData}
                        onFormDataChange={onFormDataChange}
                        formErrors={stepValidationErrors}
                    />
                </SectionWrapper>
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
        {
            field: 'repository',
            message: 'Provide a valid path to the Project.',
            rule: async (value: any, _formData) => {
                if (value?.subPath && !value?.isDirectoryValid && value?.createNewDir) {
                    return true
                }
                return value?.isDirectoryValid;
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
                    ].includes(formData.implementationType as ChoreoImplementationType)
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
                    ].includes(formData.implementationType as ChoreoImplementationType)
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
                    ].includes(formData.implementationType as ChoreoImplementationType)
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
