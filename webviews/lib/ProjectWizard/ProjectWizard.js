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
import { VSCodeTextField, VSCodeTextArea, VSCodeButton, VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { SignIn } from "../SignIn/SignIn";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { GithubAutherizer } from "../GithubRepoSelector/GithubAutherizer";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { ProviderTypeCard } from "./ProviderTypeCard";
import { ProjectTypeCard } from "./ProjectTypeCard";
import { ConfigureRepoAccordion } from "./ConfigureRepoAccordion";
import { CLONE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT, CREATE_COMPONENT_CANCEL_EVENT, CREATE_PROJECT_FAILURE_EVENT, CREATE_PROJECT_START_EVENT, CREATE_PROJECT_SUCCESS_EVENT, GitProvider } from "@wso2-enterprise/choreo-core";
import { BitbucketCredSelector } from "../BitbucketCredSelector/BitbucketCredSelector";
import { AutoComplete } from "@wso2-enterprise/ui-toolkit";
const WizardContainer = styled.div `
    width: 100%;
    display  : flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
`;
const ActionContainer = styled.div `
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;
const ErrorMessageContainer = styled.div `
    color: var(--vscode-errorForeground);
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
const SectionWrapper = styled.div `
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;
const TitleWrapper = styled.div `
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
`;
const OrgContainer = styled.div `
    width: fit-content;
    height: fit-content;
    padding: 5px;
    // Border Props
    border-radius: 5px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
`;
const BrowseBtn = styled(VSCodeButton) `
    width: fit-content;
    padding: 5px;
`;
const REGIONS = [{ label: "Cloud Data Plane - US", value: "US" }, { label: "Cloud Data Plane - EU", value: "EU" }];
export function ProjectWizard(props) {
    const { orgId } = props;
    const { loginStatus, userInfo, loginStatusPending, error, currentProjectOrg } = useChoreoWebViewContext();
    const selectedOrg = currentProjectOrg || (userInfo === null || userInfo === void 0 ? void 0 : userInfo.organizations.find(org => org.id.toString() === orgId));
    const [projectName, setProjectName] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [creationInProgress, setCreationInProgress] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [initMonoRepo, setInitMonoRepo] = useState(true);
    const [selectedGHOrgName, setSelectedGHOrgName] = useState("");
    const [selectedGHRepo, setSelectedGHRepo] = useState("");
    const [isBareRepo, setIsBareRepo] = useState(false);
    const [gitProvider, setGitProvider] = useState(undefined);
    const [selectedCredential, setSelectedCredential] = useState({ id: '', name: '' });
    const [projectDir, setProjectDir] = useState("");
    const [validationInProgress, setValidationInProgress] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("Cloud Data Plane - US");
    const regionLabels = REGIONS.map(region => region.label);
    useEffect(() => {
        ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
            eventName: CREATE_PROJECT_START_EVENT
        });
    }, []);
    const handleInitiMonoRepoCheckChange = (isMonoRepo) => {
        setInitMonoRepo(isMonoRepo);
    };
    const handleRegionChange = (region) => {
        setSelectedRegion(region);
    };
    const handleCreateProject = () => __awaiter(this, void 0, void 0, function* () {
        setCreationInProgress(true);
        const webviewAPI = ChoreoWebViewAPI.getInstance();
        const projectClient = webviewAPI.getProjectClient();
        const regionValue = REGIONS.find(region => region.label === selectedRegion).value;
        if (selectedOrg) {
            try {
                const repoString = getRepoString();
                const createdProject = yield projectClient.createProject({
                    name: projectName,
                    description: projectDescription,
                    orgId: selectedOrg.id,
                    orgHandle: selectedOrg.handle,
                    region: regionValue,
                    repository: initMonoRepo ? repoString : null,
                    credentialId: initMonoRepo ? selectedCredential.id : null,
                    branch: initMonoRepo ? selectedBranch : null,
                });
                handleCloneProject(Object.assign(Object.assign({}, createdProject), { repository: selectedGHRepo, gitOrganization: selectedGHOrgName, gitProvider }));
                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                    eventName: CREATE_PROJECT_SUCCESS_EVENT,
                    properties: {
                        name: createdProject === null || createdProject === void 0 ? void 0 : createdProject.name,
                    }
                });
                webviewAPI.closeWebView();
            }
            catch (error) {
                ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                    eventName: CREATE_PROJECT_FAILURE_EVENT,
                    properties: {
                        name: projectName,
                        cause: error.message + " " + error.cause
                    }
                });
                setErrorMsg(error.message + " " + error.cause);
            }
        }
        setCreationInProgress(false);
    });
    const handleCloneProject = (project) => {
        ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
            eventName: CLONE_COMPONENT_FROM_OVERVIEW_PAGE_EVENT,
            properties: {
                project: project === null || project === void 0 ? void 0 : project.name
            }
        });
        ChoreoWebViewAPI.getInstance().cloneChoreoProjectWithDir(project, projectDir, true);
    };
    const getRepoString = () => {
        if (selectedGHOrgName && selectedGHRepo) {
            if (gitProvider === GitProvider.GITHUB) {
                return `http://github.com/${selectedGHOrgName}/${selectedGHRepo}`;
            }
            else if (gitProvider === GitProvider.BITBUCKET) {
                return `http://bitbucket.org/${selectedGHOrgName}/${selectedGHRepo}`;
            }
        }
        else {
            return "";
        }
    };
    const handleProjecDirSelection = () => __awaiter(this, void 0, void 0, function* () {
        const projectDirectory = yield ChoreoWebViewAPI.getInstance().askProjectDirPath();
        setProjectDir(projectDirectory);
    });
    const changeGitProvider = (type) => {
        setSelectedGHOrgName('');
        setSelectedGHRepo('');
        setSelectedBranch('');
        if (type === GitProvider.GITHUB) {
            setSelectedCredential({ id: '', name: '' });
        }
        setGitProvider(type);
    };
    const isValid = projectName.length > 0 && !!projectDir && (!initMonoRepo || (!!selectedGHOrgName &&
        !!selectedGHRepo)) && !validationInProgress && !isBareRepo;
    return (React.createElement(React.Fragment, null,
        loginStatus !== "LoggedIn" && React.createElement(SignIn, null),
        !loginStatusPending && loginStatus === "LoggedIn" && (React.createElement(WizardContainer, null,
            React.createElement(TitleWrapper, null,
                React.createElement("h2", null, "New Choreo Project"),
                React.createElement(OrgContainer, null,
                    "Organization:   ",
                    selectedOrg.name)),
            React.createElement(SectionWrapper, null,
                React.createElement("h3", null, "Project Details"),
                React.createElement(VSCodeTextField, { autofocus: true, 
                    // TODO: Add validation
                    // validate={projectName.length > 0}
                    validationMessage: "Project name is required", placeholder: "Name", onInput: (e) => setProjectName(e.target.value), value: projectName, id: 'project-name-input' },
                    "Project Name ",
                    React.createElement(RequiredFormInput, null)),
                React.createElement(VSCodeTextArea, { placeholder: "Description", onInput: (e) => setProjectDescription(e.target.value), value: projectDescription, id: 'project-description-input' }, "Project Description"),
                React.createElement("span", null, "Region"),
                React.createElement(AutoComplete, { items: regionLabels, selectedItem: selectedRegion, onChange: handleRegionChange }),
                React.createElement(SubContainer, null,
                    React.createElement(CardContainer, null,
                        React.createElement(ProjectTypeCard, { isMonoRepo: true, label: "Mono Repository", isCurrentMonoRepo: initMonoRepo, onChange: handleInitiMonoRepoCheckChange }),
                        React.createElement(ProjectTypeCard, { isMonoRepo: false, label: "Multi Repository", isCurrentMonoRepo: initMonoRepo, onChange: handleInitiMonoRepoCheckChange })))),
            initMonoRepo &&
                (React.createElement(SectionWrapper, null,
                    React.createElement("h3", null, "Git Provider Details"),
                    React.createElement(SubContainer, null,
                        React.createElement(CardContainer, null,
                            React.createElement(ProviderTypeCard, { type: GitProvider.GITHUB, label: "GitHub", currentType: gitProvider, onChange: changeGitProvider }),
                            React.createElement(ProviderTypeCard, { type: GitProvider.BITBUCKET, label: "BitBucket", currentType: gitProvider, onChange: changeGitProvider }))),
                    gitProvider === GitProvider.GITHUB && React.createElement(GithubAutherizer, null),
                    gitProvider === GitProvider.BITBUCKET && React.createElement(BitbucketCredSelector, { org: selectedOrg, selectedCred: selectedCredential, onCredSelect: setSelectedCredential }))),
            initMonoRepo && gitProvider &&
                (React.createElement(SectionWrapper, null,
                    React.createElement(ConfigureRepoAccordion, { selectedOrg: selectedOrg, gitProvider: gitProvider, selectedCredential: selectedCredential, selectedGHOrgName: selectedGHOrgName, selectedGHRepo: selectedGHRepo, setSelectedGHOrgName: setSelectedGHOrgName, setSelectedGHRepo: setSelectedGHRepo, isBareRepo: isBareRepo, setIsBareRepo: setIsBareRepo, validationInProgress: validationInProgress, setValidationInProgress: setValidationInProgress, selectedBranch: selectedBranch, setSelectedBranch: setSelectedBranch, setErrorMsg: setErrorMsg }))),
            React.createElement(SectionWrapper, null,
                React.createElement("h3", null, "  Project Location  "),
                React.createElement(BrowseBtn, { onClick: handleProjecDirSelection }, "Select Directory to Save Project"),
                !!projectDir && React.createElement("span", null, projectDir),
                !projectDir && React.createElement("span", null,
                    "Please choose a directory for project workspace. ",
                    initMonoRepo && React.createElement("span", null, "The git repositories will be cloned here"),
                    " ")),
            errorMsg !== "" && React.createElement(ErrorMessageContainer, null, errorMsg),
            error && (React.createElement(ErrorMessageContainer, null, error.message + error.cause)),
            React.createElement(ActionContainer, null,
                React.createElement(VSCodeButton, { appearance: "secondary", onClick: () => {
                        ChoreoWebViewAPI.getInstance().sendTelemetryEvent({
                            eventName: CREATE_COMPONENT_CANCEL_EVENT
                        });
                        ChoreoWebViewAPI.getInstance().closeWebView();
                    } }, "Cancel"),
                React.createElement(VSCodeButton, { appearance: "primary", onClick: handleCreateProject, disabled: creationInProgress || !isValid, id: 'create-project-btn' }, "Create"),
                creationInProgress && React.createElement(VSCodeProgressRing, null))))));
}
//# sourceMappingURL=ProjectWizard.js.map