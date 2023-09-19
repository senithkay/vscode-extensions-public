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
import { VSCodeDropdown, VSCodeOption, VSCodeTextArea, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner, ErrorIcon } from "../Commons/ErrorBanner";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ChoreoComponentType, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
import { ConfigCardList } from "./ConfigCardList";
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
function sanitizeFolderName(folderName) {
    // Replace any characters that are not letters, numbers, spaces, or underscores with an empty string
    const sanitized = folderName.replace(/[^a-zA-Z0-9\s_]/g, '');
    // Remove any leading or trailing spaces
    const trimmed = sanitized.trim();
    // Replace any consecutive spaces with a dash
    const final = trimmed.replace(/\s+/g, '-');
    return final;
}
export const ComponentDetailsStepC = (props) => {
    const { formData, onFormDataChange, stepValidationErrors } = props;
    const setComponentName = (name) => {
        onFormDataChange(prevFormData => {
            var _a;
            return (Object.assign(Object.assign({}, prevFormData), { name, repository: Object.assign(Object.assign({}, prevFormData.repository), { subPath: prevFormData.mode === "fromScratch" ? sanitizeFolderName(name) : (_a = prevFormData === null || prevFormData === void 0 ? void 0 : prevFormData.repository) === null || _a === void 0 ? void 0 : _a.subPath }) }));
        });
    };
    const setDescription = (description) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { description })));
    };
    const setAccessibility = (accessibility) => {
        onFormDataChange(prevFormData => (Object.assign(Object.assign({}, prevFormData), { accessibility })));
    };
    return (React.createElement(StepContainer, null,
        React.createElement(VSCodeTextField, { autofocus: true, placeholder: "Name", onInput: (e) => setComponentName(e.target.value), value: (formData === null || formData === void 0 ? void 0 : formData.name) || '', id: 'component-name-input' },
            "Component Name ",
            React.createElement(RequiredFormInput, null),
            stepValidationErrors["name"] && React.createElement("span", { slot: "end", className: `codicon codicon-error ${ErrorIcon}` })),
        stepValidationErrors["name"] && React.createElement(ErrorBanner, { errorMsg: stepValidationErrors["name"] }),
        React.createElement(VSCodeTextArea, { autofocus: true, placeholder: "Description", onInput: (e) => setDescription(e.target.value), value: (formData === null || formData === void 0 ? void 0 : formData.description) || '' }, "Description"),
        React.createElement("div", null,
            [ChoreoComponentType.Service, ChoreoComponentType.ScheduledTask, ChoreoComponentType.ManualTrigger].includes(formData.type) && React.createElement(React.Fragment, null,
                React.createElement("p", null, "How do you want to implement it?"),
                React.createElement(ConfigCardList, { formKey: 'implementationType', formData: formData, onFormDataChange: onFormDataChange, items: [
                        {
                            label: "Ballerina",
                            description: "Component impelmented using Ballerina Language",
                            value: ChoreoImplementationType.Ballerina
                        },
                        {
                            label: "Docker",
                            description: "Component impelmented using other language and built using Docker",
                            value: ChoreoImplementationType.Docker
                        }
                    ] })),
            formData.type === ChoreoComponentType.WebApplication && React.createElement(React.Fragment, null,
                React.createElement("p", null, "Web Application Type"),
                React.createElement(ConfigCardList, { formKey: 'implementationType', formData: formData, onFormDataChange: onFormDataChange, items: [
                        {
                            label: "React SPA",
                            description: "Create a React SPA web application component in Choreo",
                            value: ChoreoImplementationType.React
                        },
                        {
                            label: "Angular SPA",
                            description: "Create a Angular SPA web application component in Choreo",
                            value: ChoreoImplementationType.Angular
                        },
                        {
                            label: "Vue SPA",
                            description: "Create a Vue SPA web application component in Choreo",
                            value: ChoreoImplementationType.Vue
                        },
                        {
                            label: "Static Website",
                            description: "Create a static website component in Choreo",
                            value: ChoreoImplementationType.StaticFiles
                        },
                        {
                            label: "Dockerfile",
                            description: "Create a Docker based web application component in Choreo",
                            value: ChoreoImplementationType.Docker
                        },
                    ] })),
            (formData === null || formData === void 0 ? void 0 : formData.type) === ChoreoComponentType.Webhook && (React.createElement(DropDownContainer, null,
                React.createElement("label", { htmlFor: "access-mode" }, "Access Mode"),
                React.createElement(VSCodeDropdown, { id: "access-mode", onChange: (e) => setAccessibility(e.target.value) },
                    React.createElement(VSCodeOption, { value: 'external' },
                        React.createElement("b", null, "External:"),
                        " API is publicly accessible"),
                    React.createElement(VSCodeOption, { value: 'internal' },
                        React.createElement("b", null, "Internal:"),
                        " API is accessible only within Choreo")))))));
};
export const ComponentDetailsStep = {
    title: 'Component Details',
    component: ComponentDetailsStepC,
    validationRules: [
        {
            field: 'name',
            message: 'Component name is already taken',
            rule: (value, _formData, context) => __awaiter(void 0, void 0, void 0, function* () {
                const { isChoreoProject, choreoProject } = context;
                if (isChoreoProject && choreoProject && (choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id)) {
                    return ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isComponentNameAvailable(value);
                }
                return true;
            })
        },
        {
            field: 'name',
            message: 'Name is required',
            rule: (value) => __awaiter(void 0, void 0, void 0, function* () {
                return value !== undefined && value !== '';
            })
        },
        {
            field: 'implementationType',
            message: 'Type is required',
            rule: (implementationType, formData) => __awaiter(void 0, void 0, void 0, function* () {
                if (formData.type === ChoreoComponentType.WebApplication &&
                    ![
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                        ChoreoImplementationType.StaticFiles,
                        ChoreoImplementationType.Docker,
                    ].includes(implementationType)) {
                    return false;
                }
                if ([ChoreoComponentType.Service, ChoreoComponentType.ScheduledTask, ChoreoComponentType.ManualTrigger].includes(formData.type) &&
                    ![
                        ChoreoImplementationType.Ballerina,
                        ChoreoImplementationType.Docker,
                    ].includes(implementationType)) {
                    return false;
                }
                return true;
            }),
        },
    ]
};
//# sourceMappingURL=ComponentDetailsStep.js.map