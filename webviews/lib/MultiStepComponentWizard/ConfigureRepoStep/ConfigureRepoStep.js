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
import React from "react";
import styled from "@emotion/styled";
import { VSCodeLink, VSCodeProgressRing, VSCodeOption, VSCodeDropdown } from "@vscode/webview-ui-toolkit/react";
import { useEffect, useState } from "react";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { GithubRepoBranchSelector } from "./GithubRepoBranchSelector";
import { RepoStructureConfig } from "./RepoStructureConfig";
import { useQuery } from "@tanstack/react-query";
import { ProviderTypeCard } from "../../ProjectWizard/ProviderTypeCard";
import { ChoreoComponentType, ChoreoImplementationType, GitProvider } from "@wso2-enterprise/choreo-core";
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;
const GhRepoSelectorActions = styled.div `
    display  : flex;
    flex-direction: row;
    gap: 10px;
`;
const GhRepoSelectorContainer = styled.div `
    display  : flex;
    flex-direction: row;
    gap: 30px;
    width: "100%";
`;
const GhRepoSelectorOrgContainer = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 200px;
`;
const GhRepoSelectorRepoContainer = styled.div `
    display  : flex;
    flex-direction: column;
    gap: 5px;
    width: 300px;
`;
const SmallProgressRing = styled(VSCodeProgressRing) `
    height: calc(var(--design-unit) * 4px);
    width: calc(var(--design-unit) * 4px);
`;
const CardContainer = styled.div `
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;
const SubContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;
export const ConfigureRepoStepC = (props) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    const { formData, onFormDataChange, stepValidationErrors } = props;
    const [ghStatus, setGHStatus] = useState({ status: "not-authorized" });
    const [isCloneInProgress, setIsCloneInProgress] = useState(false);
    const selectedCredentialId = (_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.credentialID;
    const gitProvider = (_b = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _b === void 0 ? void 0 : _b.gitProvider;
    const isMonoRepo = (_c = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _c === void 0 ? void 0 : _c.isMonoRepo;
    const { choreoProject, currentProjectOrg: org } = useChoreoWebViewContext();
    const { isLoading: isFetchingCredentials, data: credentials, refetch: refetchCredentials, isRefetching: isRefetching } = useQuery({
        queryKey: ['git-bitbucket-credentials', org === null || org === void 0 ? void 0 : org.uuid, gitProvider],
        queryFn: () => __awaiter(void 0, void 0, void 0, function* () {
            return ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().getCredentials(org === null || org === void 0 ? void 0 : org.uuid, org.id);
        }),
        select: (gitCredentialsData) => {
            return gitCredentialsData === null || gitCredentialsData === void 0 ? void 0 : gitCredentialsData.filter(item => item.type === GitProvider.BITBUCKET).map(({ id, name }) => ({ id, name }));
        },
        enabled: !!(org === null || org === void 0 ? void 0 : org.uuid) && gitProvider === GitProvider.BITBUCKET,
        onSuccess: (data) => {
            if ((data === null || data === void 0 ? void 0 : data.length) > 0 && (!selectedCredentialId || !data.some(item => item.id === selectedCredentialId))) {
                onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { credentialID: data[0].id }) })));
            }
        }
    });
    const handleCredDropdownChange = (credId) => {
        if (credId) {
            setCredential(credId);
        }
    };
    const handleConfigureNewCred = () => __awaiter(void 0, void 0, void 0, function* () {
        // open add credentials page in browser with vscode open external
        const consoleUrl = yield ChoreoWebViewAPI.getInstance().getConsoleUrl();
        ChoreoWebViewAPI.getInstance().openExternal(`${consoleUrl}/organizations/${org.name}/settings/credentials`);
    });
    const { isLoading: isFetchingRepos, data: githubOrgs, refetch, isRefetching: isRefetchingRepos } = useQuery({
        queryKey: [`repoData${choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id}`, gitProvider, selectedCredentialId],
        queryFn: () => __awaiter(void 0, void 0, void 0, function* () {
            const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
            try {
                if (gitProvider === GitProvider.GITHUB) {
                    return ghClient.getAuthorizedRepositories(org === null || org === void 0 ? void 0 : org.id);
                }
                else if (gitProvider === GitProvider.BITBUCKET && selectedCredentialId) {
                    return ghClient.getUserRepos(selectedCredentialId, org === null || org === void 0 ? void 0 : org.id);
                }
                return [];
            }
            catch (error) {
                ChoreoWebViewAPI.getInstance().showErrorMsg("Error while fetching repositories. Please authorize with GitHub.");
                throw error;
            }
        }),
        select: (orgs) => orgs === null || orgs === void 0 ? void 0 : orgs.filter(org => org.repositories.length > 0),
        onSuccess: gitOrgList => {
            var _a, _b, _c;
            if (gitOrgList.length > 0 && (!((_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.org) || !gitOrgList.some(item => { var _a; return item.orgName === ((_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.org); }))) {
                onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { org: gitOrgList[0].orgName }) })));
                if (((_b = gitOrgList[0].repositories) === null || _b === void 0 ? void 0 : _b.length) > 0 && (!((_c = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _c === void 0 ? void 0 : _c.repo) || !gitOrgList[0].repositories.some(item => { var _a; return item.name === ((_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.repo); }))) {
                    onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { repo: gitOrgList[0].repositories[0].name }) })));
                }
            }
        }
    });
    const selectedRepoString = (formData === null || formData === void 0 ? void 0 : formData.repository) ? `${(_d = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _d === void 0 ? void 0 : _d.org}/${(_e = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _e === void 0 ? void 0 : _e.repo}` : undefined;
    const selectedOrg = githubOrgs && githubOrgs.find((org) => { var _a; return org.orgName === ((_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.org); });
    const setGitProvider = (gitProvider) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { gitProvider }) })));
    };
    const setCredential = (credentialID) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { credentialID }) })));
    };
    const setRepository = (org, repo) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { org, repo }) })));
        const preferredRepo = { provider: gitProvider, orgName: org, repoName: repo };
        if (gitProvider === GitProvider.BITBUCKET) {
            preferredRepo.bitbucketCredentialId = selectedCredentialId;
        }
        ChoreoWebViewAPI.getInstance().setPreferredProjectRepository(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id, preferredRepo);
    };
    const setIsRepoCloned = (isCloned) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { isCloned }) })));
    };
    const setIsBareRepo = (isBareRepo) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { isBareRepo }) })));
    };
    useEffect(() => {
        const ghClient = ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient();
        ghClient.onGHAppAuthCallback((status) => {
            setGHStatus(status);
        });
        ghClient.checkAuthStatus();
        ghClient.status.then((status) => {
            setGHStatus(status);
        });
    }, []);
    useEffect(() => {
        if (ghStatus.status === "authorized" || ghStatus.status === "installed") {
            refetch();
        }
    }, [ghStatus]);
    useEffect(() => {
        const checkRepoCloneStatus = () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (choreoProject && selectedRepoString) {
                const projectPath = yield ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject.id);
                if (projectPath) {
                    const isCloned = yield ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isRepoCloned({
                        repository: selectedRepoString,
                        workspaceFilePath: projectPath,
                        // TODO: Handle this properly from the backend
                        // Currently, backend is not validating the branch name
                        branch: ((_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.branch) || "main",
                        gitProvider: gitProvider
                    });
                    setIsRepoCloned(isCloned);
                }
            }
        });
        checkRepoCloneStatus();
    }, [selectedRepoString, choreoProject]);
    const changeGitProvider = (type) => {
        setGitProvider(type);
    };
    const handleAuthorizeWithGithub = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerAuthFlow();
    };
    const handleConfigureNewRepo = () => {
        ChoreoWebViewAPI.getInstance().getChoreoGithubAppClient().triggerInstallFlow();
    };
    const handleGhOrgChange = (e) => {
        var _a;
        const org = githubOrgs.find(org => org.orgName === e.target.value);
        if (org) {
            setRepository(org.orgName, (_a = org.repositories[0]) === null || _a === void 0 ? void 0 : _a.name);
        }
    };
    const handleGhRepoChange = (e) => {
        const currentOrg = githubOrgs && githubOrgs.find((org) => { var _a; return org.orgName === ((_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.org); });
        if (currentOrg) {
            setRepository(currentOrg.orgName, currentOrg.repositories.find(repo => repo.name === e.target.value).name);
        }
    };
    const handleRepoClone = () => __awaiter(void 0, void 0, void 0, function* () {
        var _q, _r, _s, _t;
        if ((choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id) && selectedRepoString) {
            setIsBareRepo(false);
            setIsCloneInProgress(true);
            // check if the repo is empty
            const repoMetaData = yield ChoreoWebViewAPI.getInstance().getProjectClient().getRepoMetadata({
                orgId: org.id,
                orgHandle: org.handle,
                repo: (_q = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _q === void 0 ? void 0 : _q.repo,
                organization: (_r = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _r === void 0 ? void 0 : _r.org,
                branch: (_s = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _s === void 0 ? void 0 : _s.branch,
                credentialId: selectedCredentialId
            });
            if (repoMetaData === null || repoMetaData === void 0 ? void 0 : repoMetaData.isBareRepo) {
                setIsBareRepo(true);
                setIsCloneInProgress(false);
                return;
            }
            const projectPath = yield ChoreoWebViewAPI.getInstance().getProjectLocation(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id);
            if (projectPath) {
                const isCloned = yield ChoreoWebViewAPI.getInstance().getChoreoProjectManager().cloneRepo({
                    repository: selectedRepoString,
                    workspaceFilePath: projectPath,
                    branch: (_t = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _t === void 0 ? void 0 : _t.branch,
                    gitProvider: gitProvider
                });
                setIsRepoCloned(isCloned);
            }
            setIsCloneInProgress(false);
        }
    });
    const handleRepoInit = () => __awaiter(void 0, void 0, void 0, function* () {
        // open github repo in browser with vscode open external
        if ((choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id) && selectedRepoString) {
            if (gitProvider === GitProvider.GITHUB) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://github.com/${selectedRepoString}`);
            }
            else if (gitProvider === GitProvider.BITBUCKET) {
                ChoreoWebViewAPI.getInstance().openExternal(`http://bitbucket.org/${selectedRepoString}`);
            }
        }
    });
    const showRefreshButton = ghStatus.status === "authorized" || ghStatus.status === "installed";
    const showLoader = ghStatus.status === "auth-inprogress" || ghStatus.status === "install-inprogress" || isFetchingRepos;
    const showAuthorizeButton = ghStatus.status === "not-authorized" || ghStatus.status === "error";
    const showConfigureButton = ghStatus.status === "authorized" || ghStatus.status === "installed";
    const showCredLoader = isFetchingCredentials || isRefetching;
    let loaderMessage = "Loading repositories...";
    if (ghStatus.status === "auth-inprogress") {
        loaderMessage = "Authorizing with Github...";
    }
    else if (ghStatus.status === "install-inprogress") {
        loaderMessage = "Installing Github App...";
    }
    return (React.createElement(StepContainer, null,
        !isMonoRepo && (React.createElement(React.Fragment, null,
            React.createElement(SubContainer, null,
                React.createElement(CardContainer, null,
                    React.createElement(ProviderTypeCard, { type: GitProvider.GITHUB, label: "GitHub", currentType: gitProvider, onChange: changeGitProvider }),
                    React.createElement(ProviderTypeCard, { type: GitProvider.BITBUCKET, label: "BitBucket", currentType: gitProvider, onChange: changeGitProvider }))),
            gitProvider === GitProvider.GITHUB && (React.createElement(React.Fragment, null,
                React.createElement(GhRepoSelectorActions, null,
                    showAuthorizeButton && React.createElement("span", null,
                        React.createElement(VSCodeLink, { onClick: handleAuthorizeWithGithub }, "Authorize with Github"),
                        " to refresh repo list or to configure a new repository."),
                    showRefreshButton && React.createElement(VSCodeLink, { onClick: () => refetch() }, "Refresh Repositories"),
                    showConfigureButton && React.createElement(VSCodeLink, { onClick: handleConfigureNewRepo }, "Configure New Repo"),
                    !showLoader && isRefetchingRepos && React.createElement(SmallProgressRing, null)))),
            gitProvider === GitProvider.BITBUCKET && (React.createElement(React.Fragment, null,
                React.createElement(GhRepoSelectorActions, null,
                    showRefreshButton && React.createElement(VSCodeLink, { onClick: () => refetchCredentials() }, "Refresh Credentials"),
                    showCredLoader && React.createElement(SmallProgressRing, null)),
                !isFetchingCredentials && credentials.length === 0 &&
                    React.createElement(VSCodeLink, { onClick: handleConfigureNewCred }, "Configure New Credential"),
                !isFetchingCredentials &&
                    (React.createElement(React.Fragment, null,
                        React.createElement(GhRepoSelectorContainer, null,
                            React.createElement(GhRepoSelectorOrgContainer, null,
                                React.createElement("label", { htmlFor: "cred-drop-down" }, "Select Credential"),
                                React.createElement(VSCodeDropdown, { id: "cred-drop-down", value: selectedCredentialId, onChange: (e) => { handleCredDropdownChange(e.target.value); } }, credentials.map((credential) => (React.createElement(VSCodeOption, { key: credential.id, value: credential.id, id: `cred-item-${credential.name}` }, credential.name)))))))),
                React.createElement(GhRepoSelectorActions, null,
                    showRefreshButton && React.createElement(VSCodeLink, { onClick: () => refetch() }, "Refresh Repositories"),
                    !showLoader && isRefetchingRepos && React.createElement(SmallProgressRing, null)))),
            showLoader && loaderMessage,
            showLoader && React.createElement(VSCodeProgressRing, null),
            githubOrgs && githubOrgs.length > 0 && (React.createElement(GhRepoSelectorContainer, null,
                React.createElement(GhRepoSelectorOrgContainer, null,
                    React.createElement("label", { htmlFor: "org-drop-down" }, "Organization"),
                    React.createElement(VSCodeDropdown, { id: "org-drop-down", value: (_f = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _f === void 0 ? void 0 : _f.org, onChange: handleGhOrgChange }, githubOrgs.map((org) => (React.createElement(VSCodeOption, { key: org.orgName, value: org.orgName, id: `org-item-${org.orgName}` }, org.orgName))))),
                React.createElement(GhRepoSelectorRepoContainer, null,
                    React.createElement("label", { htmlFor: "repo-drop-down" }, "Repository"),
                    React.createElement(VSCodeDropdown, { id: "repo-drop-down", value: (_g = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _g === void 0 ? void 0 : _g.repo, onChange: handleGhRepoChange }, selectedOrg === null || selectedOrg === void 0 ? void 0 : selectedOrg.repositories.map((repo) => (React.createElement(VSCodeOption, { key: repo.name, value: repo.name, id: `repo-item-${repo.name}` }, repo.name))))))),
            !isFetchingRepos && !((_h = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _h === void 0 ? void 0 : _h.isCloned) && !((_j = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _j === void 0 ? void 0 : _j.isBareRepo) && !isCloneInProgress && (React.createElement(React.Fragment, null,
                "Selected Repository is not available locally in Project folder. Clone the repository to continue.",
                React.createElement(VSCodeLink, { onClick: handleRepoClone }, "Clone Repository"))),
            !isFetchingRepos && ((_k = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _k === void 0 ? void 0 : _k.isBareRepo) && (React.createElement(React.Fragment, null,
                "Repository is not initialized. Please initialize the repository before cloning can continue.",
                React.createElement(GhRepoSelectorActions, null,
                    React.createElement(VSCodeLink, { onClick: handleRepoInit }, "Initialize"),
                    React.createElement(VSCodeLink, { onClick: handleRepoClone }, "Recheck & Clone")))),
            isCloneInProgress && (React.createElement(React.Fragment, null,
                React.createElement("span", null, "Cloning Repository..."),
                React.createElement(VSCodeProgressRing, null))),
            selectedRepoString && !isFetchingRepos && ((_l = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _l === void 0 ? void 0 : _l.isCloned) && !((_m = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _m === void 0 ? void 0 : _m.isBareRepo) && (React.createElement(GithubRepoBranchSelector, { formData: formData, onFormDataChange: onFormDataChange })))),
        ((_o = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _o === void 0 ? void 0 : _o.isCloned) && !((_p = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _p === void 0 ? void 0 : _p.isBareRepo) && (React.createElement(RepoStructureConfig, { formData: formData, onFormDataChange: onFormDataChange, formErrors: stepValidationErrors }))));
};
export const ConfigureRepoStep = {
    title: 'Configure Repository',
    component: ConfigureRepoStepC,
    validationRules: [
        {
            field: 'repository',
            message: 'Repository is not cloned. Please clone the repository to continue.',
            rule: (_value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                return (_a = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _a === void 0 ? void 0 : _a.isCloned;
            })
        },
        {
            field: 'repository',
            message: 'Repository is not initialized. Please initialize the repository to continue.',
            rule: (_value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                var _b;
                return ((_b = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _b === void 0 ? void 0 : _b.isBareRepo) === false;
            })
        },
        {
            field: 'repository',
            message: 'A branch must be selected to continue.',
            rule: (_value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                var _c;
                return ((_c = formData === null || formData === void 0 ? void 0 : formData.repository) === null || _c === void 0 ? void 0 : _c.branch) !== undefined;
            })
        },
        // web app config related validations
        {
            field: "webAppConfig",
            message: "Package manager version is invalid",
            rule: (value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                if (formData.type === ChoreoComponentType.WebApplication &&
                    [
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                    ].includes(formData.implementationType)) {
                    const nodeRegex = new RegExp(/^(?=.*\d)\d+(\.\d+)*(?:-[a-zA-Z0-9]+)?$/);
                    return nodeRegex.test(value === null || value === void 0 ? void 0 : value.webAppPackageManagerVersion);
                }
                return true;
            }),
        },
        {
            field: "webAppConfig",
            message: "Build command is required",
            rule: (value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                var _d;
                if (formData.type === ChoreoComponentType.WebApplication &&
                    [
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                    ].includes(formData.implementationType)) {
                    return ((_d = value === null || value === void 0 ? void 0 : value.webAppBuildCommand) === null || _d === void 0 ? void 0 : _d.length) > 0;
                }
                return true;
            }),
        },
        {
            field: "webAppConfig",
            message: "Build output directory is required",
            rule: (value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                var _e;
                if (formData.type === ChoreoComponentType.WebApplication &&
                    [
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                    ].includes(formData.implementationType)) {
                    return ((_e = value === null || value === void 0 ? void 0 : value.webAppOutputDirectory) === null || _e === void 0 ? void 0 : _e.length) > 0;
                }
                return true;
            }),
        },
        {
            field: 'port',
            message: 'Port is required',
            rule: (value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                if (formData.type === ChoreoComponentType.WebApplication &&
                    formData.implementationType === ChoreoImplementationType.Docker) {
                    return value !== undefined && value !== '';
                }
                return true;
            })
        },
        {
            field: 'port',
            message: 'Port should be a number',
            rule: (value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                if (formData.type === ChoreoComponentType.WebApplication &&
                    formData.implementationType === ChoreoImplementationType.Docker) {
                    return value !== undefined && !isNaN(value);
                }
                return true;
            })
        },
    ]
};
//# sourceMappingURL=ConfigureRepoStep.js.map