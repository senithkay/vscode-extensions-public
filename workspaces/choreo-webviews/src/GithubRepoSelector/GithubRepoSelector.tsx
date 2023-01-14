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
import { VSCodeProgressRing, VSCodeLink, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react";
import { GithubOrgnization, GHAppAuthStatus, GithubRepository } from "@wso2-enterprise/choreo-client/lib/github/types";
import { useCallback, useEffect, useState } from "react";
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
    selectedRepo?: {
        org: string;
        repo: string;
    };
    onRepoSelect: (org?: string, repo?: string) => void;
}

export function GithubRepoSelector(props: GithubRepoSelectorProps) {

    const { selectedRepo, onRepoSelect } = props;

    const [authorizedOrgs, setAuthorizedOrgs] = useState<GithubOrgnization[]>([]);
    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isFetchingRepos, setIsFetchingRepos] = useState(false);
    const [selectedRepository, setSelectedRepo] = useState<[GithubOrgnization,GithubRepository] | undefined>(undefined);

    useEffect(() => {
        if (selectedRepo?.org) {
            const org = authorizedOrgs.find(org => org.orgName === selectedRepo.org);
            if (org) {
                const repo = org.repositories.find(repo => repo.name === selectedRepo.repo);
                if (repo) {
                    setSelectedRepo([org, repo]);
                }
            }
        }
    }, [authorizedOrgs, selectedRepo?.org, selectedRepo?.repo]);

    useEffect(() => {
        if (selectedRepository) {
            onRepoSelect(selectedRepository[0].orgName, selectedRepository[1].name);
        } else {
            onRepoSelect(undefined, undefined);
        }
    }, [onRepoSelect, selectedRepository]);

    useEffect(() => {
        if (authorizedOrgs.length > 0) {
            setSelectedRepo([authorizedOrgs[0], authorizedOrgs[0].repositories[0]]);
        } else {
            setSelectedRepo(undefined);
        }
    }, [authorizedOrgs]);

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
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
    }, []);

    useEffect(() => {
        if (ghStatus.status === "authorized" || ghStatus.status === "installed") {
            getRepoList();
        }
    }, [getRepoList, ghStatus]);

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
        <>
            <GhRepoSelectorActions>
                {showAuthorizeButton && <VSCodeLink onClick={handleAuthorizeWithGithub}>Authorize with Github</VSCodeLink>}
                {showRefreshButton && <VSCodeLink onClick={getRepoList}>Refresh Repositories</VSCodeLink>}
                {showConfigureButton && <VSCodeLink onClick={handleConfigureNewRepo}>Configure New Repo</VSCodeLink>}
                {showLoader && loaderMessage}
                {showLoader && <VSCodeProgressRing />}
            </GhRepoSelectorActions>
            {showAuthorizeButton && <>Please authorize to get list of repositories.</>}
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
        </>
    );
}
