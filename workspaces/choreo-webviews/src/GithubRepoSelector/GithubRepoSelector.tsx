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
import { VSCodeProgressRing, VSCodeDropdown, VSCodeOption, VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { GHAppAuthStatus } from "@wso2-enterprise/choreo-client/lib/github/types";
import React, { useContext, useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { Codicon } from "../Codicon/Codicon";

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
    width: 300px;
`;

const SmallProgressRing = styled(VSCodeProgressRing)`
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
    margin-top: auto;
    padding: 4px;
`;

const RefreshBtn = styled(VSCodeButton)`
    margin-top: auto;
    padding: 4px;
`;

export interface GithubRepoSelectorProps {
    selectedRepo?: {
        org: string;
        repo: string;
    };
    onRepoSelect: (org?: string, repo?: string) => void;
}

export function GithubRepoSelector(props: GithubRepoSelectorProps) {

    const { selectedRepo, onRepoSelect } = props;

    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });

    const { choreoProject } = useContext(ChoreoWebViewContext);

    const { isLoading: isFetchingRepos, data: authorizedOrgs, refetch, isRefetching } = useQuery({
        queryKey: [`repoData${choreoProject?.id}`],
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

    const filteredOrgs = authorizedOrgs?.filter(org => org.repositories.length > 0);

    const selectedOrg = filteredOrgs?.find(org => org.orgName === selectedRepo?.org) || filteredOrgs?.[0];


    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
        ghClient.status.then((status) => {
            setGHStatus(status);
        });
    }, []);

    const handleGhOrgChange = (e: any) => {
        const org = filteredOrgs.find(org => org.orgName === e.target.value);
        if (org && org.repositories.length > 0) {
            onRepoSelect(org.orgName, org.repositories[0]?.name);
        } else {
            onRepoSelect(org?.orgName);
        }
    };

    const handleGhRepoChange = (e: any) => {
        onRepoSelect(selectedOrg?.orgName, e.target.value);
    };

    const showRefreshButton = ghStatus.status === "authorized" || ghStatus.status === "installed";
    const showLoader = isFetchingRepos || isRefetching;
    return (
        <>
            {filteredOrgs && filteredOrgs.length > 0 && (
                <GhRepoSelectorContainer>
                    <GhRepoSelectorOrgContainer>
                        <label htmlFor="org-drop-down">Organization</label>
                        <VSCodeDropdown id="org-drop-down" value={selectedRepo?.org} onChange={handleGhOrgChange}>
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
                        <VSCodeDropdown id="repo-drop-down" value={selectedRepo?.repo} onChange={handleGhRepoChange}>
                            {selectedOrg && selectedOrg.repositories.sort((a, b) => {
                                // Vscode test-runner can't seem to scroll and find the necessary repo
                                // Therefore sorting and showing the test repo at the very top of the list
                                if (a.name.includes("vscode")) return -1;
                                if (b.name.includes("vscode")) return 1;
                                return 0;
                            }).map((repo) => (
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
                    {showRefreshButton && !showLoader && <RefreshBtn
                        appearance="icon"
                        onClick={() => refetch()}
                        title="Refresh repository list"
                        disabled={isRefetching}
                        id='refresh-repository-btn'
                    >
                        <Codicon name="refresh" />
                    </RefreshBtn>}
                    {showLoader && <SmallProgressRing />}
                </GhRepoSelectorContainer>
            )}
        </>
    );
}
