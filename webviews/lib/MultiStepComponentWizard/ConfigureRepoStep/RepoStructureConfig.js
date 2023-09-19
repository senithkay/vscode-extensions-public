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
import React, { useMemo } from "react";
import styled from "@emotion/styled";
import debounce from "lodash.debounce";
import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { useContext } from "react";
import { ErrorBanner, ErrorIcon } from "../../Commons/ErrorBanner";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { ChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import { BYOCRepoConfig } from "./BYOCRepoConfig";
import { WebAppRepoConfig } from "./WebAppRepoConfig";
import { ChoreoComponentType, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import { useQuery } from "@tanstack/react-query";
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;
export const RepoStructureConfig = (props) => {
    const { mode, repository, type, implementationType } = props.formData;
    const { choreoProject } = useContext(ChoreoWebViewContext);
    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(["getLocalComponentDirMetaData", choreoProject, repository], () => ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
        orgName: repository === null || repository === void 0 ? void 0 : repository.org,
        repoName: repository === null || repository === void 0 ? void 0 : repository.repo,
        projectId: choreoProject.id,
        subPath: repository === null || repository === void 0 ? void 0 : repository.subPath,
    }));
    const setFolderName = (fName) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { subPath: fName }) })));
    };
    const folderNameError = useMemo(() => {
        if (localDirectorMetaData) {
            if (repository === null || repository === void 0 ? void 0 : repository.subPath) {
                if (mode === 'fromExisting') {
                    if (!(localDirectorMetaData === null || localDirectorMetaData === void 0 ? void 0 : localDirectorMetaData.isSubPathValid)) {
                        return 'Sub path does not exist';
                    }
                    if (localDirectorMetaData === null || localDirectorMetaData === void 0 ? void 0 : localDirectorMetaData.isSubPathEmpty) {
                        return "Please provide a path that is not empty";
                    }
                    if (implementationType === ChoreoImplementationType.Ballerina && !(localDirectorMetaData === null || localDirectorMetaData === void 0 ? void 0 : localDirectorMetaData.hasBallerinaTomlInPath)) {
                        return "Please provide a path that contains a Ballerina project.";
                    }
                }
                if (mode === 'fromScratch') {
                    if (!(localDirectorMetaData === null || localDirectorMetaData === void 0 ? void 0 : localDirectorMetaData.isSubPathEmpty)) {
                        return "Please provide a path that is empty";
                    }
                }
            }
            else {
                if (mode === 'fromExisting') {
                    if (implementationType === ChoreoImplementationType.Ballerina && !(localDirectorMetaData === null || localDirectorMetaData === void 0 ? void 0 : localDirectorMetaData.hasBallerinaTomlInRoot)) {
                        return "Repository root does not contain a valid Ballerina project";
                    }
                }
            }
        }
    }, [repository, localDirectorMetaData]);
    const updateSubFolderName = debounce(setFolderName, 500);
    return (React.createElement("div", null,
        (mode === "fromScratch" || implementationType === ChoreoImplementationType.Ballerina) && (React.createElement(StepContainer, null,
            React.createElement(VSCodeTextField, { placeholder: "", onInput: (e) => updateSubFolderName(e.target.value), value: repository === null || repository === void 0 ? void 0 : repository.subPath },
                "Directory ",
                React.createElement(RequiredFormInput, null),
                folderNameError && React.createElement("span", { slot: "end", className: `codicon codicon-error ${cx(ErrorIcon)}` }),
                React.createElement(RepoFileOpenDialogInput, { label: "Browse", repo: `${repository === null || repository === void 0 ? void 0 : repository.org}/${repository === null || repository === void 0 ? void 0 : repository.repo}`, path: repository === null || repository === void 0 ? void 0 : repository.subPath, onOpen: updateSubFolderName, canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: `Select the directory where your ${mode === "fromExisting" ? "existing code is" : "component will be created"}`, filters: {} })))),
        fetchingDirectoryMetadata && React.createElement("div", { style: { marginTop: "5px" } }, "validating paths..."),
        folderNameError && React.createElement(ErrorBanner, { errorMsg: folderNameError }),
        mode === "fromExisting" && implementationType === ChoreoImplementationType.Docker && (React.createElement(BYOCRepoConfig, { formData: props.formData, onFormDataChange: props.onFormDataChange })),
        mode === "fromExisting" && type === ChoreoComponentType.WebApplication && (React.createElement(WebAppRepoConfig, { formData: props.formData, onFormDataChange: props.onFormDataChange, webAppConfigError: props.formErrors['webAppConfig'] || props.formErrors['port'] }))));
};
//# sourceMappingURL=RepoStructureConfig.js.map