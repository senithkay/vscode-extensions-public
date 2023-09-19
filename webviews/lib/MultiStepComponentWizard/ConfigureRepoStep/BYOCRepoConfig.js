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
import { cx } from "@emotion/css";
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner, ErrorIcon } from "../../Commons/ErrorBanner";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { useChoreoWebViewContext } from "../../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../../utilities/WebViewRpc";
import debounce from "lodash.debounce";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import { useQuery } from "@tanstack/react-query";
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;
export const BYOCRepoConfig = (props) => {
    const { repository } = props.formData;
    const { choreoProject } = useChoreoWebViewContext();
    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(["getLocalComponentDirMetaData", choreoProject, repository], () => ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
        orgName: repository === null || repository === void 0 ? void 0 : repository.org,
        repoName: repository === null || repository === void 0 ? void 0 : repository.repo,
        projectId: choreoProject.id,
        subPath: repository === null || repository === void 0 ? void 0 : repository.subPath,
        dockerFilePath: repository === null || repository === void 0 ? void 0 : repository.dockerFile,
        dockerContextPath: repository === null || repository === void 0 ? void 0 : repository.dockerContext
    }));
    const setDockerFile = (fName) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { dockerFile: fName }) })));
    };
    const setDockerFileCtx = (ctxPath) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { dockerContext: ctxPath }) })));
    };
    const dockerFileError = useMemo(() => {
        if (localDirectorMetaData) {
            if (!localDirectorMetaData.dockerFilePathValid) {
                return "There isn't such a Dockerfile in the repository";
            }
            if (localDirectorMetaData.dockerFilePathValid && !localDirectorMetaData.isDockerContextPathValid) {
                return "Provide a valid path for docker context.";
            }
        }
    }, [repository, localDirectorMetaData]);
    const debouncedSetDockerFile = debounce(setDockerFile, 500);
    const debouncedSetDockerContext = debounce(setDockerFileCtx, 500);
    return (React.createElement("div", null,
        React.createElement(StepContainer, null,
            React.createElement(VSCodeTextField, { placeholder: "", onInput: (e) => setDockerFile(e.target.value), value: repository === null || repository === void 0 ? void 0 : repository.dockerFile },
                "Docker File Path ",
                React.createElement(RequiredFormInput, null),
                dockerFileError && React.createElement("span", { slot: "end", className: `codicon codicon-error ${cx(ErrorIcon)}` }),
                React.createElement(RepoFileOpenDialogInput, { label: "Browse", repo: `${repository === null || repository === void 0 ? void 0 : repository.org}/${repository === null || repository === void 0 ? void 0 : repository.repo}`, path: repository === null || repository === void 0 ? void 0 : repository.dockerFile, onOpen: debouncedSetDockerFile, canSelectFiles: true, canSelectFolders: false, canSelectMany: false, title: "Select Dockerfile", filters: { "Dockerfile": ['*'] } })),
            React.createElement(VSCodeTextField, { placeholder: "", onInput: (e) => setDockerFileCtx(e.target.value), value: repository === null || repository === void 0 ? void 0 : repository.dockerContext },
                "Docker Context Path",
                dockerFileError && React.createElement("span", { slot: "end", className: `codicon codicon-error ${cx(ErrorIcon)}` }),
                React.createElement(RepoFileOpenDialogInput, { label: "Browse", repo: `${repository === null || repository === void 0 ? void 0 : repository.org}/${repository === null || repository === void 0 ? void 0 : repository.repo}`, path: repository === null || repository === void 0 ? void 0 : repository.dockerContext, onOpen: debouncedSetDockerContext, canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: "Select Docker Context", filters: {} }))),
        fetchingDirectoryMetadata && React.createElement("div", { style: { marginTop: "5px" } }, "validating paths..."),
        dockerFileError && React.createElement(ErrorBanner, { errorMsg: dockerFileError })));
};
//# sourceMappingURL=BYOCRepoConfig.js.map