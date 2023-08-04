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

import { WizardState } from "../Commons/MultiStepWizard/types";
import { Wizard } from "../Commons/MultiStepWizard/Wizard";
import { TriggerConfigStep } from "./WebhookTriggerSelectorStep/WebhookTriggerSelector";

import { ComponentDetailsStep } from "./ComponentDetailsStep";
import { ComponentWizardState } from "./types";
import { ComponentTypeStep } from "./ComponentTypeStep";
import { ServiceTypeStep } from "./ServiceTypeStep";
import { BYOCRepositoryDetails, ChoreoComponentCreationParams, ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType, ComponentCreateMode, ComponentDisplayType, ComponentNetworkVisibility, CREATE_COMPONENT_CANCEL_EVENT, CREATE_COMPONENT_FAILURE_EVENT, CREATE_COMPONENT_START_EVENT, CREATE_COMPONENT_SUCCESS_EVENT, GitProvider, GitRepo } from "@wso2-enterprise/choreo-core";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { SignIn } from "../SignIn/SignIn";
import { ConfigureRepoStep } from './ConfigureRepoStep/ConfigureRepoStep'
import { useQuery } from "@tanstack/react-query";
import { EndpointConfigStep } from './EndpointConfigStep';


const handleComponentCreation = async (formData: Partial<ComponentWizardState>) => {
    try {
        const { mode, name, type, serviceType, implementationType, repository, description, accessibility, trigger, port, networkVisibility, endpointContext } = formData;
        const { org, repo, branch, subPath, dockerContext, dockerFile, openApiFilePath, credentialID, gitProvider, isMonoRepo } = repository;

        const choreoProject = await ChoreoWebViewAPI.getInstance().getChoreoProject();
        const selectedOrg = await ChoreoWebViewAPI.getInstance().getCurrentOrg();
        const bitbucketCredentialId = credentialID ? credentialID : '';

        let selectedDisplayType: ComponentDisplayType;
        if(type === ChoreoComponentType.WebApplication){
            if (implementationType === ChoreoImplementationType.Docker) {
                selectedDisplayType = ComponentDisplayType.ByocWebApp;
            } else {
                selectedDisplayType = ComponentDisplayType.ByocWebAppDockerLess;
            }
        } else if (implementationType === ChoreoImplementationType.Ballerina) {
            switch (type) {
                case ChoreoComponentType.Service:
                    if(serviceType === ChoreoServiceType.GraphQL){
                        selectedDisplayType = ComponentDisplayType.GraphQL;
                    }else{
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
        } else if(implementationType === ChoreoImplementationType.Docker){
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

        const componentParams: ChoreoComponentCreationParams = {
            name: name,
            projectId: choreoProject?.id,
            org: selectedOrg,
            displayType: selectedDisplayType,
            description: description ?? '',
            repositoryInfo: { org, repo, branch, subPath, gitProvider, bitbucketCredentialId },
            accessibility
        };

        if(formData?.type === ChoreoComponentType.Service ){
            componentParams.serviceType = serviceType;
        }

        if(formData?.type === ChoreoComponentType.Webhook ){
            componentParams.trigger = trigger;
        }

        const projectManager = ChoreoWebViewAPI.getInstance().getChoreoProjectManager();
        if (mode === 'fromScratch') {
            if (implementationType === ChoreoImplementationType.Docker) {
                const repoDetails: BYOCRepositoryDetails = {
                    ...componentParams.repositoryInfo,
                    dockerFile: subPath ? `${subPath}/Dockerfile` : 'Dockerfile',
                    dockerContext: subPath,
                }
                componentParams.repositoryInfo = repoDetails;

                await ChoreoWebViewAPI.getInstance().createNonBalComponent(componentParams);
            } else if (implementationType === ChoreoImplementationType.Ballerina) {
                const response: any = await projectManager.createLocalComponent(componentParams);
                if (response.message){
                    throw new Error(`Failed to create component (${response.message})`);
                }
            }
        } else {
            if (type === ChoreoComponentType.WebApplication) {
                componentParams.webAppConfig = formData.webAppConfig;
                if(implementationType === ChoreoImplementationType.Docker){
                    const repoDetails: BYOCRepositoryDetails = {
                        ...componentParams.repositoryInfo,
                        dockerFile,
                        dockerContext,
                    }
                    componentParams.repositoryInfo = repoDetails;
                    componentParams.port = formData.port ? Number(formData.port) : 3000;
                }else{
                    componentParams.webAppConfig.webAppType = implementationType;
                }
                await ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
            } else if (implementationType === ChoreoImplementationType.Docker) {
                const repoDetails: BYOCRepositoryDetails = {
                    ...componentParams.repositoryInfo,
                    dockerFile,
                    dockerContext,
                    openApiFilePath,
                }
                componentParams.repositoryInfo = repoDetails;
                componentParams.port = Number(port);
                componentParams.networkVisibility = networkVisibility;
                componentParams.endpointContext = endpointContext;

                await ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
            } else {
                await projectManager.createLocalBalComponentFromExistingSource(componentParams);
            }
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: CREATE_COMPONENT_SUCCESS_EVENT,
                properties: { type: formData?.type?.toString(), mode: formData?.mode }
            });
        }

        if (!isMonoRepo) {
            const repoDetails: GitRepo = { provider: gitProvider, orgName: org, repoName: repo };
            if (gitProvider === GitProvider.BITBUCKET) {
                repoDetails.bitbucketCredentialId = credentialID
            }
            await ChoreoWebViewAPI.getInstance().setPreferredProjectRepository(choreoProject?.id, repoDetails);
        }
        await ChoreoWebViewAPI.getInstance().fireRefreshComponents();
    } catch (err: any) {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_FAILURE_EVENT,
            properties: { type: formData?.type?.toString(), mode: formData?.mode, cause: err.message }
        });
        throw new Error(err)
    }
};


export const ComponentWizard: React.FC<{ componentCreateMode?: ComponentCreateMode }> = (props) => {
    const { loginStatus, choreoProject } = useChoreoWebViewContext();

    const initialState: WizardState<Partial<ComponentWizardState>> = {
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
        validationErrors: {} as Record<keyof ComponentWizardState, string>,
        stepValidationErrors: {} as Record<keyof ComponentWizardState, string>,
        isStepValidating: false,
    };

    const [state, setState] = useState(initialState);

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_START_EVENT,
        });
    }, []);

    useEffect(() => {
        setState({
            ...state,
            formData: {
                ...state.formData,
                repository: {
                    ...state.formData.repository,
                    repo: choreoProject?.repository ?? '',
                    org: choreoProject?.gitOrganization ?? '',
                    branch: choreoProject?.branch ?? '',
                    isMonoRepo: choreoProject?.repository ? true : false,
                    gitProvider: choreoProject?.gitProvider ? choreoProject?.gitProvider as GitProvider : GitProvider.GITHUB,
                }
            }
        })
    }, [choreoProject])

    const { formData: { type, mode, implementationType, repository } } = state;

    useQuery(
        ["readEndpointsYaml", repository?.dockerContext, type, mode],
        async () => {
            const endpointData =
                await ChoreoWebViewAPI.getInstance().readEndpointsYaml({
                    orgName: repository?.org,
                    repoName: repository?.repo,
                    projectID: choreoProject.id,
                    subpath: repository?.dockerContext,
                });
            return endpointData || null;
        },
        {
            enabled:
                type === ChoreoComponentType.Service &&
                mode === "fromExisting" &&
                !!repository?.dockerContext,
            refetchOnWindowFocus: false,
            onSuccess: (data) => {
                setState({
                    ...state,
                    formData: {
                        ...state.formData,
                        networkVisibility:
                            (data.networkVisibility as ComponentNetworkVisibility) ||
                            state.formData.networkVisibility,
                        port: data.port?.toString() || state.formData.port,
                        endpointContext: data.context || state.formData.endpointContext,
                        repository: {
                            ...state.formData.repository,
                            openApiFilePath: data.schemaFilePath
                                ? `${repository?.dockerContext}/${data.schemaFilePath}`
                                : state.formData.repository.openApiFilePath,
                        },
                    },
                });
            },
        }
    );

    let steps = [ComponentTypeStep, ComponentDetailsStep, ConfigureRepoStep];
    if (type === ChoreoComponentType.Service) {
        steps = [ComponentTypeStep, ServiceTypeStep, ComponentDetailsStep, ConfigureRepoStep];

        if (implementationType === ChoreoImplementationType.Docker) {
            steps = [...steps, EndpointConfigStep]
        }
    } else if (type === ChoreoComponentType.Webhook) {
        steps = [ComponentTypeStep, TriggerConfigStep, ComponentDetailsStep, ConfigureRepoStep];
    }

    return (
        <>
            {loginStatus === "LoggedIn" ?
                <Wizard
                    title={mode === 'fromScratch' ? "Create a new component" : "Bring in an existing component"}
                    steps={steps}
                    state={state}
                    setState={setState}
                    validationRules={[]}
                    onSave={handleComponentCreation}
                    onCancel={(formData) => {
                        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                            eventName: CREATE_COMPONENT_CANCEL_EVENT,
                            properties: {
                                type: formData?.type?.toString(),
                                mode: formData?.mode,
                            }
                        });
                    }}
                    saveButtonText="Create"
                    closeOnSave={true}
                /> :
                <SignIn />
            }
        </>
    );
};
