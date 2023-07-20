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
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { FilteredCredentialData, Repo, UserRepo } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { RepoBranchSelector } from "../RepoBranchSelector/RepoBranchSelector";
import { Codicon } from "../Codicon/Codicon";
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";

const BBRepoSelectorContainer = styled.div`
    display  : flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 30px;
    width: "100%";
`;

const BBRepoSelectorOrgContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
    margin-right: 80px;
`;

const BBRepoSelectorRepoContainer = styled.div`
    display  : flex;
    flex-direction: column;
    gap: 5px;
`;

const RefreshBtn = styled(VSCodeButton)`
    margin-top: auto;
    padding: 1px;
`;

const RepoSelector = styled.div`
    display  : flex;
    flex-direction: row;
    gap: 30px;
`;

export interface BitbucketRepoSelectorProps {
    selectedCred: FilteredCredentialData;
    selectedRepo?: {
        org: string;
        repo: string;
        branch: string;
    };
    onRepoSelect: (org?: string, repo?: string, branch?: string) => void;
    refreshRepoList: boolean;
    setLoadingRepos: (loading: boolean) => void;
    setLoadingBranches: (loading: boolean) => void;
}

export function BitbucketRepoSelector(props: BitbucketRepoSelectorProps) {

    const { selectedRepo, onRepoSelect, selectedCred, refreshRepoList, setLoadingRepos, setLoadingBranches } = props;
    const { currentProjectOrg } = useChoreoWebViewContext()
    const [repoDetails, setRepoDetails] = useState<UserRepo[]>([]);
    const [bborgs, setBBorgs] = useState<string[]>([]);
    const [bbrepos, setBBrepos] = useState<string[]>([]);

    const useGetRepoData = async (selectedCred: string) => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        try {
            return await ghClient.getUserRepos(selectedCred, currentProjectOrg?.id);
        } catch (error: any) {
            ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. ");
            throw error;
        }
    };

    const { isFetching, refetch, isRefetching } = useQuery({
        queryKey: [selectedCred.id],
        queryFn: async () => {
            const userRepos = await useGetRepoData(selectedCred.id || '');
            return userRepos;
        },
        enabled: !!selectedCred.id,
        onSuccess: (data) => {
            if (data) {
                setRepoDetails(data);
            }
        }
    });

    useEffect(() => {
        refetch();
    }, [refreshRepoList]);

    useEffect(() => {
        if (repoDetails.length > 0) {
            const allOrgs: string[] = [];
            const allRepos: string[] = [];
            let isSelectedRepoAvailable = false;
            const currentOrg = selectedRepo?.org || repoDetails?.[0]?.orgName || '';
            let currentRepo = '';
            const currentBranch = selectedRepo?.branch || '';

            if (selectedRepo?.org) {
                const selectedUserRepos = repoDetails?.filter((repo) => repo.orgName === selectedRepo.org) || [];
                if (selectedUserRepos.length > 0) {
                    isSelectedRepoAvailable = selectedUserRepos[0].repositories.some((repository) => repository.name === selectedRepo.repo);
                    currentRepo = isSelectedRepoAvailable ? selectedRepo.repo : selectedUserRepos[0].repositories[0]?.name || '';
                }
            }

            onRepoSelect(currentOrg, currentRepo, currentBranch);

            repoDetails?.forEach((userRepo: UserRepo) => {
                allOrgs.push(userRepo.orgName);
            });
            setBBorgs(allOrgs);

            repoDetails?.forEach((userRepo: UserRepo) => {
                if (userRepo.orgName === selectedRepo?.org) {
                    userRepo.repositories.forEach((repo: Repo) => {
                        allRepos.push(repo.name);
                    });
                }
            });
            setBBrepos(allRepos);
        } else {
            setBBorgs([]);
            setBBrepos([]);
        }
    }, [repoDetails, selectedRepo, onRepoSelect]);

    const handleBBOrgChange = (value: any) => {
        const org = bborgs.find((org) => org === value);

        const selectedUserRepos = repoDetails.filter((repo) => repo.orgName === selectedRepo?.org);

        if (selectedUserRepos && selectedUserRepos.length > 0) {
            onRepoSelect(org, selectedUserRepos[0]?.repositories[0]?.name || '', selectedRepo?.branch ?? '');
        } else {
            onRepoSelect(org, '', '');
        }
    };

    const handleBBRepoChange = (value: any) => {
        onRepoSelect(selectedRepo?.org, value, selectedRepo?.branch);
    };

    const handleGhBranchChange = (value: string) => {
        onRepoSelect(selectedRepo?.org, selectedRepo?.repo, value);
    };

    ((isFetching || isRefetching) && selectedCred.id) ? setLoadingRepos(true) : setLoadingRepos(false);

    const credentialsAvailable = !!selectedCred.id;
    return (
        <>
            {!credentialsAvailable && "Please select a bitbucket credential."}
            {credentialsAvailable && (
                <>
                    <RepoSelector>
                        <BBRepoSelectorContainer>
                            <BBRepoSelectorOrgContainer>
                                <label htmlFor="org-drop-down">Workspace</label>
                                <AutoComplete items={bborgs ?? []} selectedItem={selectedRepo?.org} onChange={handleBBOrgChange}></AutoComplete>
                            </BBRepoSelectorOrgContainer>
                            <BBRepoSelectorRepoContainer>
                                <label htmlFor="repo-drop-down">Repository</label>
                                <AutoComplete items={bbrepos ?? []} selectedItem={selectedRepo?.repo} onChange={handleBBRepoChange}></AutoComplete>
                            </BBRepoSelectorRepoContainer>
                            <RefreshBtn
                                appearance="icon"
                                onClick={() => refetch()}
                                title="Refresh bitbucket repository list"
                                disabled={isRefetching}
                                id='refresh-bb-repository-btn'
                            >
                                <Codicon name="refresh" />
                            </RefreshBtn>
                        </BBRepoSelectorContainer>
                    </RepoSelector>
                    <RepoBranchSelector
                        org={selectedRepo.org}
                        repo={selectedRepo.repo}
                        branch={selectedRepo.branch}
                        onBranchChange={handleGhBranchChange}
                        credentialID={selectedCred.id}
                        setLoadingBranches={setLoadingBranches}
                    />
                </>
            )}
        </>
    );
}
