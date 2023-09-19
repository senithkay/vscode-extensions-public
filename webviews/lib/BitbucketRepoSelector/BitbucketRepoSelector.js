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
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { RepoBranchSelector } from "../RepoBranchSelector/RepoBranchSelector";
import { Codicon } from "../Codicon/Codicon";
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
const BBRepoSelectorContainer = styled.div `
    display  : flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 30px;
    width: "100%";
`;
const BBRepoSelectorOrgContainer = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
    margin-right: 80px;
`;
const BBRepoSelectorRepoContainer = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
`;
const RefreshBtn = styled(VSCodeButton) `
    margin-top: auto;
    padding: 1px;
`;
const RepoSelector = styled.div `
    display  : flex;
    flex-direction: row;
    gap: 30px;
`;
export function BitbucketRepoSelector(props) {
    const { selectedRepo, onRepoSelect, selectedCred, refreshRepoList, setLoadingRepos, setLoadingBranches } = props;
    const { currentProjectOrg } = useChoreoWebViewContext();
    const [repoDetails, setRepoDetails] = useState([]);
    const [bborgs, setBBorgs] = useState([]);
    const [bbrepos, setBBrepos] = useState([]);
    const useGetRepoData = (selectedCred) => __awaiter(this, void 0, void 0, function* () {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        try {
            return yield ghClient.getUserRepos(selectedCred, currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.id);
        }
        catch (error) {
            ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. ");
            throw error;
        }
    });
    const { isFetching, refetch, isRefetching } = useQuery({
        queryKey: [selectedCred.id],
        queryFn: () => __awaiter(this, void 0, void 0, function* () {
            const userRepos = yield useGetRepoData(selectedCred.id || '');
            return userRepos;
        }),
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
        var _a, _b;
        if (repoDetails.length > 0) {
            const allOrgs = [];
            const allRepos = [];
            let isSelectedRepoAvailable = false;
            const currentOrg = (selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org) || ((_a = repoDetails === null || repoDetails === void 0 ? void 0 : repoDetails[0]) === null || _a === void 0 ? void 0 : _a.orgName) || '';
            let currentRepo = '';
            const currentBranch = (selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.branch) || '';
            if (selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org) {
                const selectedUserRepos = (repoDetails === null || repoDetails === void 0 ? void 0 : repoDetails.filter((repo) => repo.orgName === selectedRepo.org)) || [];
                if (selectedUserRepos.length > 0) {
                    isSelectedRepoAvailable = selectedUserRepos[0].repositories.some((repository) => repository.name === selectedRepo.repo);
                    currentRepo = isSelectedRepoAvailable ? selectedRepo.repo : ((_b = selectedUserRepos[0].repositories[0]) === null || _b === void 0 ? void 0 : _b.name) || '';
                }
            }
            onRepoSelect(currentOrg, currentRepo, currentBranch);
            repoDetails === null || repoDetails === void 0 ? void 0 : repoDetails.forEach((userRepo) => {
                allOrgs.push(userRepo.orgName);
            });
            setBBorgs(allOrgs);
            repoDetails === null || repoDetails === void 0 ? void 0 : repoDetails.forEach((userRepo) => {
                if (userRepo.orgName === (selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org)) {
                    userRepo.repositories.forEach((repo) => {
                        allRepos.push(repo.name);
                    });
                }
            });
            setBBrepos(allRepos);
        }
        else {
            setBBorgs([]);
            setBBrepos([]);
        }
    }, [repoDetails, selectedRepo, onRepoSelect]);
    const handleBBOrgChange = (value) => {
        var _a, _b, _c;
        const org = bborgs.find((org) => org === value);
        const selectedUserRepos = repoDetails.filter((repo) => repo.orgName === (selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org));
        if (selectedUserRepos && selectedUserRepos.length > 0) {
            onRepoSelect(org, ((_b = (_a = selectedUserRepos[0]) === null || _a === void 0 ? void 0 : _a.repositories[0]) === null || _b === void 0 ? void 0 : _b.name) || '', (_c = selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.branch) !== null && _c !== void 0 ? _c : '');
        }
        else {
            onRepoSelect(org, '', '');
        }
    };
    const handleBBRepoChange = (value) => {
        onRepoSelect(selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org, value, selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.branch);
    };
    const handleGhBranchChange = (value) => {
        onRepoSelect(selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org, selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.repo, value);
    };
    ((isFetching || isRefetching) && selectedCred.id) ? setLoadingRepos(true) : setLoadingRepos(false);
    const credentialsAvailable = !!selectedCred.id;
    return (React.createElement(React.Fragment, null,
        !credentialsAvailable && "Please select a bitbucket credential.",
        credentialsAvailable && (React.createElement(React.Fragment, null,
            React.createElement(RepoSelector, null,
                React.createElement(BBRepoSelectorContainer, null,
                    React.createElement(BBRepoSelectorOrgContainer, null,
                        React.createElement("label", { htmlFor: "org-drop-down" }, "Workspace"),
                        React.createElement(AutoComplete, { items: bborgs !== null && bborgs !== void 0 ? bborgs : [], selectedItem: selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.org, onChange: handleBBOrgChange })),
                    React.createElement(BBRepoSelectorRepoContainer, null,
                        React.createElement("label", { htmlFor: "repo-drop-down" }, "Repository"),
                        React.createElement(AutoComplete, { items: bbrepos !== null && bbrepos !== void 0 ? bbrepos : [], selectedItem: selectedRepo === null || selectedRepo === void 0 ? void 0 : selectedRepo.repo, onChange: handleBBRepoChange })),
                    React.createElement(RefreshBtn, { appearance: "icon", onClick: () => refetch(), title: "Refresh bitbucket repository list", disabled: isRefetching, id: 'refresh-bb-repository-btn' },
                        React.createElement(Codicon, { name: "refresh" })))),
            React.createElement(RepoBranchSelector, { org: selectedRepo.org, repo: selectedRepo.repo, branch: selectedRepo.branch, onBranchChange: handleGhBranchChange, credentialID: selectedCred.id, setLoadingBranches: setLoadingBranches })))));
}
//# sourceMappingURL=BitbucketRepoSelector.js.map