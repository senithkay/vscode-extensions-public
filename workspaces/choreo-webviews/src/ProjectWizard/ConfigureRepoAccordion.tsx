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
import { VSCodeButton, VSCodeProgressRing, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { ChoreoAppInstaller } from "../GithubRepoSelector/ChoreoAppInstaller";
import { BitbucketRepoSelector } from "../BitbucketRepoSelector/BitbucketRepoSelector";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { FilteredCredentialData } from "@wso2-enterprise/choreo-client/lib/github/types";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { Codicon } from "../Codicon/Codicon";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";

const GhRepoSelectorActions = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;

const ValidationWrapper = styled.div`
    display  : flex;
    justify-content: flex-start;
    align-items: flex-end;
    min-height: 25px;
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

const RepoSubContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
    min-height: 83px;
`;

const RepoSelectorContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 10px;
`;

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
    margin-top: auto;
    padding: 4px;
`;

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 10px;
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

export interface ConfigureRepoAccordionProps {
    gitProvider: GitProvider;
    selectedCredential: FilteredCredentialData;
    selectedGHOrgName: string;
    setSelectedGHOrgName: (orgName: string) => void;
    selectedGHRepo: string;
    setSelectedGHRepo: (repoName: string) => void;
    validationInProgress: boolean;
    setValidationInProgress: (inProgress: boolean) => void;
    isBareRepo: boolean;
    setIsBareRepo: (isBareRepo: boolean) => void;
    selectedBranch: string;
    setSelectedBranch: (branch: string) => void;
    setErrorMsg: (msg: string) => void;

}

export function ConfigureRepoAccordion(props: ConfigureRepoAccordionProps) {

    const {
        gitProvider,
        selectedCredential,
        selectedGHOrgName,
        setSelectedGHOrgName,
        selectedGHRepo,
        setSelectedGHRepo,
        isBareRepo,
        setIsBareRepo,
        validationInProgress,
        setValidationInProgress,
        selectedBranch,
        setSelectedBranch,
        setErrorMsg
    } = props;

    const { currentProjectOrg } = useChoreoWebViewContext();
    const [refreshRepoList, setRefreshRepoList] = useState(false);

    useEffect(() => {
        if (selectedGHRepo) {
            checkBareRepoStatus();
        }

    }, [selectedBranch, selectedGHRepo]);

    const handleRepoSelect = (org?: string, repo?: string, branch?: string) => {
        setSelectedGHOrgName(org || "");
        setSelectedGHRepo(repo || "");
        setSelectedBranch(branch || "");
    };

    const handleRepoInit = async () => {
        // open github repo in browser with vscode open external
        if (selectedGHOrgName && selectedGHRepo) {
            if (gitProvider === GitProvider.GITHUB) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://github.com/${selectedGHOrgName}/${selectedGHRepo}/new/main?readme=1`);
            } else if (gitProvider === GitProvider.BITBUCKET) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://bitbucket.org/${selectedGHOrgName}/${selectedGHRepo}/create-file/?filename=README.md&template=true`);
            }
        }
    };

    const handleNewRepoCreation = async () => {
        if (gitProvider === GitProvider.GITHUB) {
            ChoreoWebViewAPI.getInstance().openExternal(`https://github.com/new`);
        } else if (gitProvider === GitProvider.BITBUCKET) {
            ChoreoWebViewAPI.getInstance().openExternal(`https://bitbucket.org/${selectedGHOrgName}/workspace/create/repository`);
        }
    }

    const handleRepoRefresh = async () => {
        setRefreshRepoList(!refreshRepoList);
    };

    const handleAppInstallSuccess = async () => {
        handleRepoRefresh();
    }

    const checkBareRepoStatus = async () => {
        try {
            setValidationInProgress(true);
            const webviewAPI = ChoreoWebViewAPI.getInstance();
            const projectClient = webviewAPI.getProjectClient();

            // check if the repo is empty
            const repoMetaData = await projectClient.getRepoMetadata({
                orgId: currentProjectOrg?.id,
                orgHandle: currentProjectOrg?.handle,
                repo: selectedGHRepo,
                organization: selectedGHOrgName,
                branch: selectedBranch.length > 0 ? selectedBranch : "main",
                credentialId: selectedCredential.id
            });
            if (repoMetaData?.isBareRepo) {
                setIsBareRepo(true);
            } else {
                setIsBareRepo(false);
            }
            setValidationInProgress(false);
        } catch (error: any) {
            setErrorMsg(error.message + " " + error.cause);
        }
    }

    const bareRepoError = 'Get started by creating a new file or uploading an existing file. We recommend every repository include a README, LICENSE, and .gitignore.';

    return (
        <>
            <h3>Configure Repository</h3>
            <RepoStepWrapper>
                <RepoStepNumber> 1 </RepoStepNumber>
                <RepoStepContent>
                    <h3>  Starting from scratch?  </h3>
                    {gitProvider === GitProvider.GITHUB && (
                        <StepContainer>
                            <ListItemWrapper>
                                <Codicon name="circle-filled" />
                                <span>Create a <VSCodeLink onClick={handleNewRepoCreation}>New Repository</VSCodeLink> in GitHub.</span>
                            </ListItemWrapper>
                            <ListWrapper>
                                <ListItemWrapper>
                                    <Codicon name="circle-filled" />
                                    <span>Give Choreo permission to read the repository.</span>
                                </ListItemWrapper>
                                <ListItemWrapper style={{ marginLeft: '25px' }}>
                                    <Codicon name="circle-outline" />
                                    <ChoreoAppInstaller onAppInstallation={handleAppInstallSuccess} />
                                </ListItemWrapper>
                            </ListWrapper>
                            <ListItemWrapper>
                                <Codicon name="circle-filled" />
                                <span>Select the newly created repo from Select repository.</span>
                            </ListItemWrapper>
                        </StepContainer>
                    )}
                    {gitProvider === GitProvider.BITBUCKET && (
                        selectedCredential.id ? (
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
                    <h3>  Select repository  </h3>
                    <RepoSubContainer>
                        <RepoSelectorContainer>
                            <span>Select the desired repository.</span>
                            {gitProvider === GitProvider.GITHUB &&
                                <GithubRepoSelector
                                    selectedRepo={{ org: selectedGHOrgName, repo: selectedGHRepo, branch: selectedBranch }}
                                    onRepoSelect={handleRepoSelect}
                                />}
                            {gitProvider === GitProvider.BITBUCKET &&
                                <BitbucketRepoSelector
                                    selectedRepo={{ org: selectedGHOrgName, repo: selectedGHRepo, branch: selectedBranch }}
                                    onRepoSelect={handleRepoSelect} selectedCred={selectedCredential}
                                    refreshRepoList={refreshRepoList}
                                />}
                            <ValidationWrapper>
                                {validationInProgress && (
                                    <>
                                        <SmallProgressRing />
                                        <span>Validating repository...</span>
                                    </>

                                )}
                            </ValidationWrapper>

                        </RepoSelectorContainer>
                        {isBareRepo && !validationInProgress && (
                            <>
                                <ErrorBanner errorMsg={bareRepoError} />
                                <GhRepoSelectorActions>
                                    <VSCodeButton onClick={handleRepoInit}>
                                        Create File
                                    </VSCodeButton>
                                    <VSCodeButton onClick={checkBareRepoStatus}>
                                        Recheck
                                    </VSCodeButton>
                                </GhRepoSelectorActions>
                            </>
                        )}
                    </RepoSubContainer>
                </RepoStepContent>
            </RepoStepWrapper>
        </>
    );
}
