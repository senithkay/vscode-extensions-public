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
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { GithubRepoSelector } from "../GithubRepoSelector/GithubRepoSelector";
import { ChoreoAppInstaller } from "../GithubRepoSelector/ChoreoAppInstaller";
import { BitbucketRepoSelector } from "../BitbucketRepoSelector/BitbucketRepoSelector";
import { GitProvider } from "@wso2-enterprise/choreo-core";
import { ErrorBanner } from "../Commons/ErrorBanner";
import { Codicon } from "../Codicon/Codicon";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ProgressIndicator } from "../ActivityBar/Components/ProgressIndicator";
const GhRepoSelectorActions = styled.div `
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;
const RepoStepWrapper = styled.div `
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
const RepoStepNumber = styled.div `
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
const RepoStepContent = styled.div `
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;
const RepoSubContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
    min-height: 83px;
`;
const RepoSelectorContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 30px;
`;
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 10px;
`;
const ListItemWrapper = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;
const ListWrapper = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 10px;
`;
export function ConfigureRepoAccordion(props) {
    const { selectedOrg, gitProvider, selectedCredential, selectedGHOrgName, setSelectedGHOrgName, selectedGHRepo, setSelectedGHRepo, isBareRepo, setIsBareRepo, validationInProgress, setValidationInProgress, selectedBranch, setSelectedBranch, setErrorMsg } = props;
    const { currentProjectOrg } = useChoreoWebViewContext();
    const [refreshRepoList, setRefreshRepoList] = useState(false);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [loadingBranches, setLoadingBranches] = useState(false);
    useEffect(() => {
        if (selectedGHRepo) {
            checkBareRepoStatus();
        }
    }, [selectedBranch, selectedGHRepo]);
    const handleRepoSelect = (org, repo, branch) => {
        setSelectedGHOrgName(org || "");
        setSelectedGHRepo(repo || "");
        setSelectedBranch(branch || "");
    };
    const handleRepoInit = () => __awaiter(this, void 0, void 0, function* () {
        // open github repo in browser with vscode open external
        if (selectedGHOrgName && selectedGHRepo) {
            if (gitProvider === GitProvider.GITHUB) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://github.com/${selectedGHOrgName}/${selectedGHRepo}/new/main?readme=1`);
            }
            else if (gitProvider === GitProvider.BITBUCKET) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://bitbucket.org/${selectedGHOrgName}/${selectedGHRepo}/create-file/?filename=README.md&template=true`);
            }
        }
    });
    const handleNewRepoCreation = () => __awaiter(this, void 0, void 0, function* () {
        if (gitProvider === GitProvider.GITHUB) {
            ChoreoWebViewAPI.getInstance().openExternal(`https://github.com/new`);
        }
        else if (gitProvider === GitProvider.BITBUCKET) {
            ChoreoWebViewAPI.getInstance().openExternal(`https://bitbucket.org/${selectedGHOrgName}/workspace/create/repository`);
        }
    });
    const handleGuideClick = () => __awaiter(this, void 0, void 0, function* () {
        ChoreoWebViewAPI.getInstance().openExternal(`https://wso2.com/choreo/docs/develop-components/deploy-a-containerized-application/#connect-your-repository-to-choreo`);
    });
    const handleRepoRefresh = () => __awaiter(this, void 0, void 0, function* () {
        setRefreshRepoList(!refreshRepoList);
    });
    const handleAppInstallSuccess = () => __awaiter(this, void 0, void 0, function* () {
        handleRepoRefresh();
    });
    const checkBareRepoStatus = () => __awaiter(this, void 0, void 0, function* () {
        try {
            setValidationInProgress(true);
            const webviewAPI = ChoreoWebViewAPI.getInstance();
            const projectClient = webviewAPI.getProjectClient();
            // check if the repo is empty
            const repoMetaData = yield projectClient.getRepoMetadata({
                orgId: currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.id,
                orgHandle: currentProjectOrg === null || currentProjectOrg === void 0 ? void 0 : currentProjectOrg.handle,
                repo: selectedGHRepo,
                organization: selectedGHOrgName,
                branch: selectedBranch.length > 0 ? selectedBranch : "main",
                credentialId: selectedCredential.id
            });
            if (repoMetaData === null || repoMetaData === void 0 ? void 0 : repoMetaData.isBareRepo) {
                setIsBareRepo(true);
            }
            else {
                setIsBareRepo(false);
            }
            setValidationInProgress(false);
        }
        catch (error) {
            setErrorMsg(error.message + " " + error.cause);
        }
    });
    const bareRepoError = 'Get started by creating a new file or uploading an existing file. We recommend every repository include a README, LICENSE, and .gitignore.';
    const showProgressBar = validationInProgress || loadingRepos || loadingBranches;
    return (React.createElement(React.Fragment, null,
        React.createElement("h3", null, "Configure Repository"),
        React.createElement(RepoStepWrapper, null,
            React.createElement(RepoStepNumber, null, " 1 "),
            React.createElement(RepoStepContent, null,
                React.createElement("h3", null, "  Starting from scratch?  "),
                gitProvider === GitProvider.GITHUB && (React.createElement(StepContainer, null,
                    React.createElement(ListItemWrapper, null,
                        React.createElement(Codicon, { name: "circle-filled" }),
                        React.createElement("span", null,
                            "Create a ",
                            React.createElement(VSCodeLink, { onClick: handleNewRepoCreation }, "New Repository"),
                            " in GitHub.")),
                    React.createElement(ListWrapper, null,
                        React.createElement(ListItemWrapper, null,
                            React.createElement(Codicon, { name: "circle-filled" }),
                            React.createElement("span", null,
                                "Give repository permissions to Choreo by installing Github Application. See ",
                                React.createElement(VSCodeLink, { onClick: handleGuideClick }, "Installation Guide"),
                                " for more information")),
                        React.createElement(ListItemWrapper, { style: { marginLeft: '25px' } },
                            React.createElement(Codicon, { name: "circle-outline" }),
                            React.createElement(ChoreoAppInstaller, { onAppInstallation: handleAppInstallSuccess, orgId: selectedOrg.id }))),
                    React.createElement(ListItemWrapper, null,
                        React.createElement(Codicon, { name: "circle-filled" }),
                        React.createElement("span", null, "Select the newly created repo from Select repository.")))),
                gitProvider === GitProvider.BITBUCKET && (selectedCredential.id ? (React.createElement(StepContainer, null,
                    React.createElement(ListItemWrapper, null,
                        React.createElement(Codicon, { name: "circle-filled" }),
                        React.createElement("span", null,
                            "Create a ",
                            React.createElement(VSCodeLink, { onClick: handleNewRepoCreation }, "New Repository"),
                            " in bitbucket.")),
                    React.createElement(ListItemWrapper, null,
                        React.createElement(Codicon, { name: "circle-filled" }),
                        React.createElement("span", null, "Select the newly created repo from Select repository.")))) : (React.createElement("span", null, "Please select a bitbucket credential."))))),
        React.createElement(RepoStepWrapper, null,
            React.createElement(RepoStepNumber, null, " 2 "),
            React.createElement(RepoStepContent, null,
                React.createElement("h3", null, "  Select repository  "),
                React.createElement(RepoSubContainer, null,
                    React.createElement(RepoSelectorContainer, null,
                        React.createElement("span", null, "Select the desired repository."),
                        gitProvider === GitProvider.GITHUB &&
                            React.createElement(GithubRepoSelector, { selectedRepo: { org: selectedGHOrgName, repo: selectedGHRepo, branch: selectedBranch }, onRepoSelect: handleRepoSelect, setLoadingRepos: setLoadingRepos, setLoadingBranches: setLoadingBranches }),
                        gitProvider === GitProvider.BITBUCKET &&
                            React.createElement(BitbucketRepoSelector, { selectedRepo: { org: selectedGHOrgName, repo: selectedGHRepo, branch: selectedBranch }, onRepoSelect: handleRepoSelect, selectedCred: selectedCredential, refreshRepoList: refreshRepoList, setLoadingRepos: setLoadingRepos, setLoadingBranches: setLoadingBranches })),
                    isBareRepo && !validationInProgress && (React.createElement(React.Fragment, null,
                        React.createElement(ErrorBanner, { errorMsg: bareRepoError }),
                        React.createElement(GhRepoSelectorActions, null,
                            React.createElement(VSCodeLink, { onClick: handleRepoInit }, "Create File"),
                            React.createElement(VSCodeButton, { onClick: checkBareRepoStatus }, "Recheck")))))),
            showProgressBar && React.createElement(ProgressIndicator, null))));
}
//# sourceMappingURL=ConfigureRepoAccordion.js.map