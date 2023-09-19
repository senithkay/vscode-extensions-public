var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
import React from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { useQuery } from "@tanstack/react-query";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { Codicon } from "../Codicon/Codicon";
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
import { RepoBranchSelector } from "../RepoBranchSelector/RepoBranchSelector";
const GhRepoSelectorContainer = styled.div `
    display  : flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 30px;
    width: "100%";
`;
const GhRepoSelectorOrgContainer = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
    margin-right: 80px;
`;
const GhRepoSelectorRepoContainer = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
`;
const RefreshBtn = styled(VSCodeButton) `
    margin-top: auto;
    padding: 1px;
`;
export function GithubRepoSelector(props) {
    const { selectedRepo, onRepoSelect, setLoadingRepos, setLoadingBranches } = props;
    const { userInfo, currentProjectOrg } = useChoreoWebViewContext();
    const { isLoading: isFetchingRepos, data: authorizedOrgs, refetch, isRefetching } = useQuery({
        queryKey: [`repoData`, userInfo === null || userInfo === void 0 ? void 0 : userInfo.userId],
        queryFn: () => __awaiter(this, void 0, void 0, function* () {
            const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
            try {
                return ghClient.getAuthorizedRepositories(currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.id);
            }
            catch (error) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. Please authorize with GitHub.");
                throw error;
            }
        })
    });
    const filteredOrgs = authorizedOrgs === null || authorizedOrgs === void 0 ? void 0 : authorizedOrgs.filter(org => org.repositories.length > 0);
    const selectedOrg = (filteredOrgs === null || filteredOrgs === void 0 ? void 0 : filteredOrgs.find(org => org.orgName === (selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org))) || (filteredOrgs === null || filteredOrgs === void 0 ? void 0 : filteredOrgs[0]);
    const handleGhOrgChange = (value) => {
        var _a;
        const org = filteredOrgs.find(org => org.orgName === value);
        if (org && org.repositories.length > 0) {
            onRepoSelect(org.orgName, (_a = org.repositories[0]) === null || _a === void 0 ? void 0 : _a.name, selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.branch);
        }
        else {
            onRepoSelect(org === null || org === void 0 ? void 0 : org.orgName);
        }
    };
    const handleGhRepoChange = (value) => {
        onRepoSelect(selectedOrg === null || selectedOrg === void 0 ? void 0 : selectedOrg.orgName, value, selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.branch);
    };
    const handleGhBranchChange = (value) => {
        onRepoSelect(selectedOrg === null || selectedOrg === void 0 ? void 0 : selectedOrg.orgName, selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.repo, value);
    };
    if (!selectedRepo.org) {
        if (selectedOrg === null || selectedOrg === void 0 ? void 0 : selectedOrg.orgName) {
            handleGhOrgChange(selectedOrg.orgName);
        }
    }
    const showLoader = isFetchingRepos || isRefetching;
    showLoader ? setLoadingRepos(true) : setLoadingRepos(false);
    const repos = selectedOrg && selectedOrg.repositories.sort((a, b) => {
        // Vscode test-runner can't seem to scroll and find the necessary repo
        // Therefore sorting and showing the test repo at the very top of the list
        if (a.name.includes("vscode"))
            return -1;
        if (b.name.includes("vscode"))
            return 1;
        return 0;
    }).map((repo) => (repo.name)) || [];
    const orgs = (filteredOrgs === null || filteredOrgs === void 0 ? void 0 : filteredOrgs.map((org) => (org.orgName))) || [];
    return (React.createElement(React.Fragment, null,
        React.createElement(GhRepoSelectorContainer, null,
            React.createElement(GhRepoSelectorOrgContainer, null,
                React.createElement("label", { htmlFor: "org-drop-down" }, "Organization"),
                React.createElement(AutoComplete, { items: orgs, selectedItem: selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org, onChange: handleGhOrgChange })),
            React.createElement(GhRepoSelectorRepoContainer, null,
                React.createElement("label", { htmlFor: "repo-drop-down" }, "Repository"),
                React.createElement(AutoComplete, { items: repos, selectedItem: selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.repo, onChange: handleGhRepoChange })),
            React.createElement(RefreshBtn, { appearance: "icon", onClick: () => refetch(), title: "Refresh repository list", disabled: isRefetching, id: 'refresh-repository-btn' },
                React.createElement(Codicon, { name: "refresh" }))),
        React.createElement(RepoBranchSelector, { org: selectedRepo.org, repo: selectedRepo.repo, branch: selectedRepo.branch, onBranchChange: handleGhBranchChange, credentialID: "", setLoadingBranches: setLoadingBranches })));
}
//# sourceMappingURL=GithubRepoSelector.js.map