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
import React, { useEffect, useState } from "react";
import { Wizard } from "../Commons/MultiStepWizard/Wizard";
import { TriggerConfigStep } from "./WebhookTriggerSelectorStep/WebhookTriggerSelector";
import { ComponentDetailsStep } from "./ComponentDetailsStep";
import { ComponentTypeStep } from "./ComponentTypeStep";
import { ServiceTypeStep } from "./ServiceTypeStep";
import { ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType, ComponentDisplayType, CREATE_COMPONENT_CANCEL_EVENT, CREATE_COMPONENT_FAILURE_EVENT, CREATE_COMPONENT_START_EVENT, CREATE_COMPONENT_SUCCESS_EVENT, GitProvider } from "@wso2-enterprise/choreo-core";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { SignIn } from "../SignIn/SignIn";
import { ConfigureRepoStep } from './ConfigureRepoStep/ConfigureRepoStep';
import { useQuery } from "@tanstack/react-query";
import { EndpointConfigStep } from './EndpointConfigStep';
const handleComponentCreation = (formData) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { mode, name, type, serviceType, implementationType, repository, description, accessibility, trigger, port, networkVisibility, endpointContext } = formData;
        const { org, repo, branch, subPath, dockerContext, dockerFile, openApiFilePath, credentialID, gitProvider, isMonoRepo } = repository;
        const choreoProject = yield ChoreoWebViewAPI.getInstance().getChoreoProject();
        const selectedOrg = yield ChoreoWebViewAPI.getInstance().getCurrentOrg();
        const bitbucketCredentialId = credentialID ? credentialID : '';
        let selectedDisplayType;
        if (type === ChoreoComponentType.WebApplication) {
            if (implementationType === ChoreoImplementationType.Docker) {
                selectedDisplayType = ComponentDisplayType.ByocWebApp;
            }
            else {
                selectedDisplayType = ComponentDisplayType.ByocWebAppDockerLess;
            }
        }
        else if (implementationType === ChoreoImplementationType.Ballerina) {
            switch (type) {
                case ChoreoComponentType.Service:
                    if (serviceType === ChoreoServiceType.GraphQL) {
                        selectedDisplayType = ComponentDisplayType.GraphQL;
                    }
                    else {
                        selectedDisplayType = ComponentDisplayType.Service;
                    }
                    break;
                case ChoreoComponentType.ManualTrigger:
                    selectedDisplayType = ComponentDisplayType.ManualTrigger;
                    break;
                case ChoreoComponentType.ScheduledTask:
                    selectedDisplayType = ComponentDisplayType.ScheduledTask;
                    break;
                case ChoreoComponentType.Webhook:
                    selectedDisplayType = ComponentDisplayType.Webhook;
                    break;
            }
        }
        else if (implementationType === ChoreoImplementationType.Docker) {
            switch (type) {
                case ChoreoComponentType.Service:
                    selectedDisplayType = ComponentDisplayType.ByocService;
                    break;
                case ChoreoComponentType.ManualTrigger:
                    selectedDisplayType = ComponentDisplayType.ByocJob;
                    break;
                case ChoreoComponentType.ScheduledTask:
                    selectedDisplayType = ComponentDisplayType.ByocCronjob;
                    break;
            }
        }
        const componentParams = {
            name: name,
            projectId: choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id,
            org: selectedOrg,
            displayType: selectedDisplayType,
            description: description !== null && description !== void 0 ? description : '',
            repositoryInfo: { org, repo, branch, subPath, gitProvider, bitbucketCredentialId },
            accessibility
        };
        if ((formData === null || formData === void 0 ? void 0 : formData.type) === ChoreoComponentType.Service) {
            componentParams.serviceType = serviceType;
        }
        if ((formData === null || formData === void 0 ? void 0 : formData.type) === ChoreoComponentType.Webhook) {
            componentParams.trigger = trigger;
        }
        const projectManager = ChoreoWebViewAPI.getInstance().getChoreoProjectManager();
        if (mode === 'fromScratch') {
            if (implementationType === ChoreoImplementationType.Docker) {
                const repoDetails = Object.assign(Object.assign({}, componentParams.repositoryInfo), { dockerFile: subPath ? `${subPath}/Dockerfile` : 'Dockerfile', dockerContext: subPath });
                componentParams.repositoryInfo = repoDetails;
                yield ChoreoWebViewAPI.getInstance().createNonBalComponent(componentParams);
            }
            else if (implementationType === ChoreoImplementationType.Ballerina) {
                const response = yield projectManager.createLocalComponent(componentParams);
                if (response.message) {
                    throw new Error(`Failed to create component (${response.message})`);
                }
            }
        }
        else {
            if (type === ChoreoComponentType.WebApplication) {
                componentParams.webAppConfig = formData.webAppConfig;
                if (implementationType === ChoreoImplementationType.Docker) {
                    const repoDetails = Object.assign(Object.assign({}, componentParams.repositoryInfo), { dockerFile,
                        dockerContext });
                    componentParams.repositoryInfo = repoDetails;
                    componentParams.port = formData.port ? Number(formData.port) : 3000;
                }
                else {
                    componentParams.webAppConfig.webAppType = implementationType;
                }
                yield ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
            }
            else if (implementationType === ChoreoImplementationType.Docker) {
                const repoDetails = Object.assign(Object.assign({}, componentParams.repositoryInfo), { dockerFile,
                    dockerContext,
                    openApiFilePath });
                componentParams.repositoryInfo = repoDetails;
                componentParams.port = Number(port);
                componentParams.networkVisibility = networkVisibility;
                componentParams.endpointContext = endpointContext;
                yield ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
            }
            else {
                yield projectManager.createLocalBalComponentFromExistingSource(componentParams);
            }
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: CREATE_COMPONENT_SUCCESS_EVENT,
                properties: { type: (_a = formData === null || formData === void 0 ? void 0 : formData.type) === null || _a === void 0 ? void 0 : _a.toString(), mode: formData === null || formData === void 0 ? void 0 : formData.mode }
            });
        }
        if (!isMonoRepo) {
            const repoDetails = { provider: gitProvider, orgName: org, repoName: repo };
            if (gitProvider === GitProvider.BITBUCKET) {
                repoDetails.bitbucketCredentialId = credentialID;
            }
            yield ChoreoWebViewAPI.getInstance().setPreferredProjectRepository(choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.id, repoDetails);
        }
        yield ChoreoWebViewAPI.getInstance().fireRefreshComponents();
    }
    catch (err) {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_FAILURE_EVENT,
            properties: { type: (_b = formData === null || formData === void 0 ? void 0 : formData.type) === null || _b === void 0 ? void 0 : _b.toString(), mode: formData === null || formData === void 0 ? void 0 : formData.mode, cause: err.message }
        });
        throw new Error(err);
    }
});
export const ComponentWizard = (props) => {
    const { loginStatus, choreoProject } = useChoreoWebViewContext();
    const initialState = {
        currentStep: 0,
        formData: {
            mode: props.componentCreateMode,
            name: '',
            accessibility: "external",
            networkVisibility: "Project",
            type: ChoreoComponentType.Service,
            serviceType: ChoreoServiceType.RestApi,
            implementationType: ChoreoImplementationType.Ballerina,
            repository: {
                dockerContext: '',
                dockerFile: '',
                subPath: '',
                openApiFilePath: '',
                isBareRepo: false,
                isCloned: false,
                gitProvider: GitProvider.GITHUB,
                credentialID: '',
                repo: '',
                org: '',
                branch: '',
                isMonoRepo: false
            },
            port: '3000',
            endpointContext: '.',
            webAppConfig: {
                dockerContext: '',
                webAppBuildCommand: '',
                webAppOutputDirectory: '',
                webAppPackageManagerVersion: '',
            }
        },
        isFormValid: false,
        isStepValid: false,
        validationErrors: {},
        stepValidationErrors: {},
        isStepValidating: false,
    };
    const [state, setState] = useState(initialState);
    useEffect(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_START_EVENT,
        });
    }, []);
    useEffect(() => {
        var _a, _b, _c;
        setState(Object.assign(Object.assign({}, state), { formData: Object.assign(Object.assign({}, state.formData), { repository: Object.assign(Object.assign({}, state.formData.repository), { repo: (_a = choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.repository) !== null && _a !== void 0 ? _a : '', org: (_b = choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.gitOrganization) !== null && _b !== void 0 ? _b : '', branch: (_c = choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.branch) !== null && _c !== void 0 ? _c : '', isMonoRepo: (choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.repository) ? true : false, gitProvider: (choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.gitProvider) ? choreoProject === null || choreoProject === void 0 ? void 0 : choreoProject.gitProvider : GitProvider.GITHUB }) }) }));
    }, [choreoProject]);
    const { formData: { type, mode, implementationType, repository } } = state;
    useQuery(["readEndpointsYaml", repository === null || repository === void 0 ? void 0 : repository.dockerContext, type, mode], () => __awaiter(void 0, void 0, void 0, function* () {
        const endpointData = yield ChoreoWebViewAPI.getInstance().readEndpointsYaml({
            orgName: repository === null || repository === void 0 ? void 0 : repository.org,
            repoName: repository === null || repository === void 0 ? void 0 : repository.repo,
            projectID: choreoProject.id,
            subpath: repository === null || repository === void 0 ? void 0 : repository.dockerContext,
        });
        return endpointData || null;
    }), {
        enabled: type === ChoreoComponentType.Service &&
            mode === "fromExisting" &&
            !!(repository === null || repository === void 0 ? void 0 : repository.dockerContext),
        refetchOnWindowFocus: false,
        onSuccess: (data) => {
            var _a;
            setState(Object.assign(Object.assign({}, state), { formData: Object.assign(Object.assign({}, state.formData), { networkVisibility: data.networkVisibility ||
                        state.formData.networkVisibility, port: ((_a = data.port) === null || _a === void 0 ? void 0 : _a.toString()) || state.formData.port, endpointContext: data.context || state.formData.endpointContext, repository: Object.assign(Object.assign({}, state.formData.repository), { openApiFilePath: data.schemaFilePath
                            ? `${repository === null || repository === void 0 ? void 0 : repository.dockerContext}/${data.schemaFilePath}`
                            : state.formData.repository.openApiFilePath }) }) }));
        },
    });
    let steps = [ComponentTypeStep, ComponentDetailsStep, ConfigureRepoStep];
    if (type === ChoreoComponentType.Service) {
        steps = [ComponentTypeStep, ServiceTypeStep, ComponentDetailsStep, ConfigureRepoStep];
        if (implementationType === ChoreoImplementationType.Docker) {
            steps = [...steps, EndpointConfigStep];
        }
    }
    else if (type === ChoreoComponentType.Webhook) {
        steps = [ComponentTypeStep, TriggerConfigStep, ComponentDetailsStep, ConfigureRepoStep];
    }
    return (React.createElement(React.Fragment, null, loginStatus === "LoggedIn" ?
        React.createElement(Wizard, { title: mode === 'fromScratch' ? "Create component from scratch" : "Create component from existing source", steps: steps, state: state, setState: setState, validationRules: [], onSave: handleComponentCreation, onCancel: (formData) => {
                var _a;
                ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                    eventName: CREATE_COMPONENT_CANCEL_EVENT,
                    properties: {
                        type: (_a = formData === null || formData === void 0 ? void 0 : formData.type) === null || _a === void 0 ? void 0 : _a.toString(),
                        mode: formData === null || formData === void 0 ? void 0 : formData.mode,
                    }
                });
            }, saveButtonText: "Create", closeOnSave: true }) :
        React.createElement(SignIn, null)));
};
//# sourceMappingURL=ComponentWizard.js.map