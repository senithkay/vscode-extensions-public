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
import { VSCodeDropdown, VSCodeOption, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import { FilteredCredentialData, Repo, UserRepo } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

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

export interface GithubRepoSelectorProps {
    selectedCred: FilteredCredentialData;
    selectedRepo?: {
        org: string;
        repo: string;
    };
    onRepoSelect: (org?: string, repo?: string) => void;
    refreshRepoList: boolean;
}

export function BitbucketRepoSelector(props: GithubRepoSelectorProps) {

    const { selectedRepo, onRepoSelect, selectedCred, refreshRepoList } = props;
    const [repoDetails, setRepoDetails] = useState<UserRepo[]>([]);
    const [bborgs, setBBorgs] = useState<string[]>([]);
    const [bbrepos, setBBrepos] = useState<string[]>([]);

    const useGetRepoData = async (selectedCred: string) => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        try {
            return await ghClient.getUserRepos(selectedCred);
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

            if (selectedRepo?.org) {
                const selectedUserRepos = repoDetails?.filter((repo) => repo.orgName === selectedRepo.org) || [];
                if (selectedUserRepos.length > 0) {
                    isSelectedRepoAvailable = selectedUserRepos[0].repositories.some((repository) => repository.name === selectedRepo.repo);
                    currentRepo = isSelectedRepoAvailable ? selectedRepo.repo : selectedUserRepos[0].repositories[0]?.name || '';
                }
            }

            onRepoSelect(currentOrg, currentRepo);

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

    const handleBBOrgChange = (e: any) => {
        const org = bborgs.find((org) => org === e.target.value);

        const selectedUserRepos = repoDetails.filter((repo) => repo.orgName === selectedRepo?.org);

        if (selectedUserRepos && selectedUserRepos.length > 0) {
            onRepoSelect(org, selectedUserRepos[0]?.repositories[0]?.name || '');
        } else {
            onRepoSelect(org, '');
        }
    };

    const handleGhRepoChange = (e: any) => {
        onRepoSelect(selectedRepo?.org, e.target.value);
    };

    const loaderMessage = "Loading repositories...";
    const showLoader = isFetching || isRefetching;

    return (
        <>
            <GhRepoSelectorActions>
                {showLoader && loaderMessage}
                {showLoader && <VSCodeProgressRing />} 
            </GhRepoSelectorActions>
            {bborgs && bborgs.length > 0 && !showLoader && selectedCred.id && (
                <GhRepoSelectorContainer>
                    <GhRepoSelectorOrgContainer>
                        <label htmlFor="org-drop-down">Workspace</label>
                        <VSCodeDropdown id="org-drop-down" value={selectedRepo?.org} onChange={handleBBOrgChange}>
                            {bborgs.map((orgName) => (
                                <VSCodeOption
                                    key={orgName}
                                    value={orgName}
                                    id={`org-item-${orgName}`}
                                >
                                    {orgName}
                                </VSCodeOption>
                            ))}
                        </VSCodeDropdown>
                    </GhRepoSelectorOrgContainer>
                    <GhRepoSelectorRepoContainer>
                        <label htmlFor="repo-drop-down">Repository</label>
                        <VSCodeDropdown id="repo-drop-down" value={selectedRepo?.repo} onChange={handleGhRepoChange}>
                            {bbrepos?.map((repo) => (
                                <VSCodeOption
                                    key={repo}
                                    value={repo}
                                    id={`repo-item-${repo}`}
                                >
                                    {repo}
                                </VSCodeOption>
                            ))}
                        </VSCodeDropdown>
                    </GhRepoSelectorRepoContainer>
                </GhRepoSelectorContainer>
            )}
        </>
    );
}

