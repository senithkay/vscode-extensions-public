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
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { RequiredFormInput } from "../../Commons/RequiredInput";
import { RepoFileOpenDialogInput } from "../ShowOpenDialogInput/RepoFileOpenDialogInput";
import { ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
import { ErrorBanner } from "../../Commons/ErrorBanner";
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;
const MarginTopWrap = styled.div `
    margin-top: 20px
`;
export const WebAppRepoConfig = (props) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { webAppConfig, repository, implementationType } = props.formData;
    const setBuildCtxPath = (ctxPath) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { webAppConfig: Object.assign(Object.assign({}, prevFormData.webAppConfig), { dockerContext: ctxPath }) })));
    };
    const setBuildCommand = (buildCmd) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { webAppConfig: Object.assign(Object.assign({}, prevFormData.webAppConfig), { webAppBuildCommand: buildCmd }) })));
    };
    const setBuildOutputDirectory = (outputDir) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { webAppConfig: Object.assign(Object.assign({}, prevFormData.webAppConfig), { webAppOutputDirectory: outputDir }) })));
    };
    const setNodeVersion = (nodeVersion) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { webAppConfig: Object.assign(Object.assign({}, prevFormData.webAppConfig), { webAppPackageManagerVersion: nodeVersion }) })));
    };
    const setPortValue = (port) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { port })));
    };
    return (React.createElement("div", null,
        React.createElement(StepContainer, null,
            implementationType && [ChoreoImplementationType.React, ChoreoImplementationType.Angular, ChoreoImplementationType.Vue].includes(implementationType) && (React.createElement(React.Fragment, null,
                React.createElement(VSCodeTextField, { placeholder: "", onInput: (e) => setBuildCtxPath(e.target.value), value: (_a = webAppConfig === null || webAppConfig === void 0 ? void 0 : webAppConfig.dockerContext) !== null && _a !== void 0 ? _a : '' },
                    "Build Context Path",
                    React.createElement(RepoFileOpenDialogInput, { label: "Browse", repo: `${repository === null || repository === void 0 ? void 0 : repository.org}/${repository === null || repository === void 0 ? void 0 : repository.repo}`, path: (_b = webAppConfig === null || webAppConfig === void 0 ? void 0 : webAppConfig.dockerContext) !== null && _b !== void 0 ? _b : '', onOpen: setBuildCtxPath, canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: "Select Build Context", filters: {} })),
                React.createElement(VSCodeTextField, { autofocus: true, placeholder: "npm run build", onInput: (e) => setBuildCommand(e.target.value), value: ((_c = props.formData.webAppConfig) === null || _c === void 0 ? void 0 : _c.webAppBuildCommand) || '' },
                    "Build Command ",
                    React.createElement(RequiredFormInput, null)),
                React.createElement(VSCodeTextField, { autofocus: true, placeholder: "build", onInput: (e) => setBuildOutputDirectory(e.target.value), value: ((_d = props.formData.webAppConfig) === null || _d === void 0 ? void 0 : _d.webAppOutputDirectory) || '' },
                    "Build output directory ",
                    React.createElement(RequiredFormInput, null)),
                React.createElement(VSCodeTextField, { autofocus: true, placeholder: "18", onInput: (e) => setNodeVersion(e.target.value), value: ((_e = props.formData.webAppConfig) === null || _e === void 0 ? void 0 : _e.webAppPackageManagerVersion) || '' },
                    "Node Version ",
                    React.createElement(RequiredFormInput, null)))),
            implementationType === ChoreoImplementationType.StaticFiles && (React.createElement(VSCodeTextField, { placeholder: "", onInput: (e) => setBuildOutputDirectory(e.target.value), value: (_f = webAppConfig === null || webAppConfig === void 0 ? void 0 : webAppConfig.webAppOutputDirectory) !== null && _f !== void 0 ? _f : '' },
                "Files Directory",
                React.createElement(RepoFileOpenDialogInput, { label: "Browse", repo: `${repository === null || repository === void 0 ? void 0 : repository.org}/${repository === null || repository === void 0 ? void 0 : repository.repo}`, path: (_g = webAppConfig === null || webAppConfig === void 0 ? void 0 : webAppConfig.webAppOutputDirectory) !== null && _g !== void 0 ? _g : '', onOpen: setBuildOutputDirectory, canSelectFiles: false, canSelectFolders: true, canSelectMany: false, title: "Select files directory", filters: {} }))),
            implementationType === ChoreoImplementationType.Docker && (React.createElement(MarginTopWrap, null,
                React.createElement(VSCodeTextField, { autofocus: true, placeholder: "Port", onInput: (e) => setPortValue(e.target.value), value: ((_h = props.formData) === null || _h === void 0 ? void 0 : _h.port) || '', id: 'component-port-input' },
                    "Port ",
                    React.createElement(RequiredFormInput, null))))),
        props.webAppConfigError && React.createElement(MarginTopWrap, null,
            React.createElement(ErrorBanner, { errorMsg: props.webAppConfigError }))));
};
//# sourceMappingURL=WebAppRepoConfig.js.map