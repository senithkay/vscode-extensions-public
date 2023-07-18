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
import { VSCodeProgressRing, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import React from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { Codicon } from "../Codicon/Codicon";
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
import { RepoBranchSelector } from "../RepoBranchSelector/RepoBranchSelector";
import { useOrgOfCurrentProject } from "../hooks/use-org-of-current-project";

const GhRepoSelectorContainer = styled.div`
    display  : flex;
    flex-wrap: wrap;
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
`;

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
    margin-top: auto;
    padding: 4px;
`;

const RefreshBtn = styled(VSCodeButton)`
    margin-top: auto;
    padding: 1px;
`;

export interface GithubRepoSelectorProps {
    selectedRepo?: {
        org: string;
        repo: string;
        branch: string;
    };
    onRepoSelect: (org?: string, repo?: string, branch?: string) => void;
}

export function GithubRepoSelector(props: GithubRepoSelectorProps) {

    const { selectedRepo, onRepoSelect } = props;

    const { userInfo } = useChoreoWebViewContext();

    const { currentProjectOrg } = useOrgOfCurrentProject();

    const { isLoading: isFetchingRepos, data: authorizedOrgs, refetch, isRefetching } = useQuery({
        queryKey: [`repoData`, userInfo?.userId],
        queryFn: async () => {
            const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
            try {
                return ghClient.getAuthorizedRepositories(currentProjectOrg?.id);
            } catch (error: any) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. Please authorize with GitHub.");
                throw error;
            }
        }
    });

    const filteredOrgs = authorizedOrgs?.filter(org => org.repositories.length > 0);

    const selectedOrg = filteredOrgs?.find(org => org.orgName === selectedRepo?.org) || filteredOrgs?.[0];

    const handleGhOrgChange = (value: string) => {
        const org = filteredOrgs.find(org => org.orgName === value);
        if (org && org.repositories.length > 0) {
            onRepoSelect(org.orgName, org.repositories[0]?.name);
        } else {
            onRepoSelect(org?.orgName);
        }
    };

    const handleGhRepoChange = (value: string) => {
        onRepoSelect(selectedOrg?.orgName, value, selectedRepo?.branch);
    };

    const handleGhBranchChange = (value: string) => {
        onRepoSelect(selectedOrg?.orgName, selectedRepo?.repo, value );
    };

    const showLoader = isFetchingRepos || isRefetching;

    const repos: string[] = selectedOrg && selectedOrg.repositories.sort((a, b) => {
        // Vscode test-runner can't seem to scroll and find the necessary repo
        // Therefore sorting and showing the test repo at the very top of the list
        if (a.name.includes("vscode")) return -1;
        if (b.name.includes("vscode")) return 1;
        return 0;
    }).map((repo) => (repo.name)) || [];
    const orgs: string[] = filteredOrgs?.map((org) => (org.orgName)) || [];

    return (
        <>
            {filteredOrgs && filteredOrgs.length > 0 && (
                <GhRepoSelectorContainer>
                    <GhRepoSelectorOrgContainer>
                        <label htmlFor="org-drop-down">Organization</label>
                        <AutoComplete items={orgs} selectedItem={selectedRepo?.org} onChange={handleGhOrgChange}></AutoComplete>
                    </GhRepoSelectorOrgContainer>
                    <GhRepoSelectorRepoContainer>
                        <label htmlFor="repo-drop-down">Repository</label>
                        <AutoComplete items={repos} selectedItem={selectedRepo?.repo} onChange={handleGhRepoChange}></AutoComplete>
                    </GhRepoSelectorRepoContainer>
                    {!showLoader && <RefreshBtn
                        appearance="icon"
                        onClick={() => refetch()}
                        title="Refresh repository list"
                        disabled={isRefetching}
                        id='refresh-repository-btn'
                    >
                        <Codicon name="refresh" />
                    </RefreshBtn>}
                    {showLoader && <SmallProgressRing />}
                    <RepoBranchSelector
                        org={selectedRepo.org}
                        repo={selectedRepo.repo}
                        branch={selectedRepo.branch}
                        onBranchChange={handleGhBranchChange}
                        credentialID={""}
                    />
                </GhRepoSelectorContainer>
            )}
        </>
    );
}
