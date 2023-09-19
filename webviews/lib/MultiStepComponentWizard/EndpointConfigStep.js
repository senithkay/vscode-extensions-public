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
import { VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { RepoFileOpenDialogInput } from "./ShowOpenDialogInput/RepoFileOpenDialogInput";
import { ErrorIcon, ErrorBanner } from "../Commons/ErrorBanner";
import { ChoreoComponentType, ChoreoServiceType } from "@wso2-enterprise/choreo-core";
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    gap: 20px;
    width: 100%;
    min-width: 400px;
`;
const DropDownContainer = styled.div `
    display: flex;
    flex-direction: column;
`;
const VisibilityLabel = styled.label `
    margin-top: 5px;
    font-weight: lighter;
`;
export const EndpointConfigStepC = (props) => {
    const { formData, stepValidationErrors, onFormDataChange } = props;
    const { repository } = formData;
    const setOpenApiFilePath = (openApiFilePath) => {
        props.onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { repository: Object.assign(Object.assign({}, prevFormData.repository), { openApiFilePath }) })));
    };
    const setPortValue = (port) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { port })));
    };
    const setContextValue = (endpointContext) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { endpointContext })));
    };
    const setNetworkVisibility = (networkVisibility) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { networkVisibility })));
    };
    const projectDesc = {
        'Project': 'Allows components within the same project to access the endpoint.',
        'Organization': 'Allows any component within the same organization to access the endpoint.',
        'Public': 'Allows any client to access the endpoint, regardless of location or organization.'
    };
    return (React.createElement("div", null,
        React.createElement(StepContainer, null,
            React.createElement(VSCodeTextField, { autofocus: true, placeholder: "Port", onInput: (e) => setPortValue(e.target.value), value: (formData === null || formData === void 0 ? void 0 : formData.port) || '', id: 'component-port-input' },
                "Port",
                stepValidationErrors["port"] && React.createElement("span", { slot: "end", className: `codicon codicon-error ${ErrorIcon}` })),
            stepValidationErrors["port"] && React.createElement(ErrorBanner, { errorMsg: stepValidationErrors["port"] }),
            (formData === null || formData === void 0 ? void 0 : formData.type) === ChoreoComponentType.Service && (React.createElement(DropDownContainer, null,
                React.createElement("label", { htmlFor: "network-visibility" }, "Network Visibility"),
                React.createElement(VSCodeDropdown, { value: formData.networkVisibility, id: "network-visibility", onChange: (e) => setNetworkVisibility(e.target.value) },
                    React.createElement(VSCodeOption, { value: 'Project' }, "Project"),
                    React.createElement(VSCodeOption, { value: 'Organization' }, "Organization"),
                    React.createElement(VSCodeOption, { value: 'Public' }, "Public")),
                React.createElement(VisibilityLabel, null, projectDesc[formData.networkVisibility]))),
            [ChoreoServiceType.RestApi, ChoreoServiceType.GraphQL].includes(formData === null || formData === void 0 ? void 0 : formData.serviceType) && (React.createElement(React.Fragment, null,
                React.createElement(VSCodeTextField, { autofocus: true, placeholder: "/greeting", onInput: (e) => setContextValue(e.target.value), value: (formData === null || formData === void 0 ? void 0 : formData.endpointContext) || '', id: 'component-context-input' },
                    "Context",
                    stepValidationErrors["endpointContext"] && React.createElement("span", { slot: "end", className: `codicon codicon-error ${ErrorIcon}` })),
                stepValidationErrors["endpointContext"] && React.createElement(ErrorBanner, { errorMsg: stepValidationErrors["endpointContext"] }))),
            formData.mode === 'fromExisting' && (formData === null || formData === void 0 ? void 0 : formData.serviceType) === ChoreoServiceType.RestApi && React.createElement(VSCodeTextField, { placeholder: "", onInput: (e) => setOpenApiFilePath(e.target.value), value: repository === null || repository === void 0 ? void 0 : repository.openApiFilePath },
                "OpenAPI file Path",
                React.createElement(RepoFileOpenDialogInput, { label: "Browse", repo: `${repository === null || repository === void 0 ? void 0 : repository.org}/${repository === null || repository === void 0 ? void 0 : repository.repo}`, path: (repository === null || repository === void 0 ? void 0 : repository.openApiFilePath) || '', onOpen: setOpenApiFilePath, canSelectFiles: true, canSelectFolders: false, canSelectMany: false, title: "Select OpenAPI file path", filters: { 'YAML Files': ['yaml'] } })))));
};
export const EndpointConfigStep = {
    title: 'Configure Endpoints',
    component: EndpointConfigStepC,
    validationRules: [
        {
            field: 'port',
            message: 'Port is required',
            rule: (value) => __awaiter(void 0, void 0, void 0, function* () {
                return value !== undefined && value !== '';
            })
        },
        {
            field: 'port',
            message: 'Port should be a number',
            rule: (value) => __awaiter(void 0, void 0, void 0, function* () {
                return value !== undefined && !isNaN(value);
            })
        },
        {
            field: 'endpointContext',
            message: 'Context is required',
            rule: (value, formData) => __awaiter(void 0, void 0, void 0, function* () {
                if ([ChoreoServiceType.RestApi, ChoreoServiceType.GraphQL].includes(formData === null || formData === void 0 ? void 0 : formData.serviceType)) {
                    return value !== undefined && value !== '';
                }
                return false;
            })
        },
    ]
};
//# sourceMappingURL=EndpointConfigStep.js.map