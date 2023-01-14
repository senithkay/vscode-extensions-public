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
import { useEffect, useState } from "react";
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
    onRepoSelect: (org: string, repo: string) => void;
}

export function GithubRepoSelector(props: GithubRepoSelectorProps) {

    const { selectedRepo, onRepoSelect } = props;

    const [authorizedOrgs, setAuthorizedOrgs] = useState<GithubOrgnization[]>([]);
    const [ghStatus, setGHStatus] = useState<GHAppAuthStatus>({ status: "not-authorized" });
    const [isFetchingRepos, setIsFetchingRepos] = useState(false);
    const [selectedGHOrg, setSelectedGHOrg] = useState<GithubOrgnization | undefined>(undefined);
    const [selectedGHRepo, setSelectedGHRepo] = useState<GithubRepository | undefined>(undefined);

    useEffect(() => {
        if (selectedRepo?.org) {
            const org = authorizedOrgs.find(org => org.orgName === selectedRepo.org);
            setSelectedGHOrg(org);
            if (org) {
                const repo = org.repositories.find(repo => repo.name === selectedRepo.repo);
                setSelectedGHRepo(repo);
            }
        }
    }, [authorizedOrgs, selectedRepo?.org, selectedRepo?.repo]);

    useEffect(() => {
        if (selectedGHOrg && selectedGHRepo) {
            onRepoSelect(selectedGHOrg.orgName, selectedGHRepo.name);
        }
    }, [onRepoSelect, selectedGHOrg, selectedGHRepo]);

    async function getRepoList() {
        setIsFetchingRepos(true);
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        try {
            const repos = await ghClient.getAuthorizedRepositories();
            setAuthorizedOrgs(repos);
            setSelectedGHOrg(repos.length > 0 ? repos[0] : undefined)
        } catch (error) {
            setAuthorizedOrgs([]);
            console.log("Error while fetching authorized repositories: " + error);
        }
        setIsFetchingRepos(false);
    }

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
    }, [ghStatus]);

    const handleAuthorizeWithGithub = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow();
    };

    const handleConfigureNewRepo = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
    };

    const handleGhOrgChange = (e: any) => {
        setSelectedGHOrg(authorizedOrgs.find(org => org.orgName === e.target.value));
    };

    const handleGhRepoChange = (e: any) => {
        setSelectedGHRepo(selectedGHOrg?.repositories.find(repo => repo.name === e.target.value));
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
            {selectedGHOrg && (
                <GhRepoSelectorContainer>
                    <GhRepoSelectorOrgContainer>
                        <label htmlFor="org-drop-down">Organization</label>
                        <VSCodeDropdown id="org-drop-down" onChange={handleGhOrgChange}>
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
                        <VSCodeDropdown id="repo-drop-down" onChange={handleGhRepoChange}>
                            {selectedGHOrg && selectedGHOrg.repositories.map((repo) => (
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
        </>
    );
}
