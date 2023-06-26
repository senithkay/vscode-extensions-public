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
import React, { useContext, useEffect, useState } from "react";

import { GitProvider } from "@wso2-enterprise/choreo-client/lib/github/types";
import { WizardState } from "../Commons/MultiStepWizard/types";
import { Wizard } from "../Commons/MultiStepWizard/Wizard";
import { TriggerConfigStep } from "./WebhookTriggerSelectorStep/WebhookTriggerSelector";

import { ComponentDetailsStep } from "./ComponentDetailsStep";
import { ComponentWizardState } from "./types";
import { ComponentTypeStep } from "./ComponentTypeStep";
import { ServiceTypeStep } from "./ServiceTypeStep";
import { BYOCRepositoryDetails, ChoreoComponentCreationParams, ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType, ComponentCreateMode, ComponentDisplayType, CREATE_COMPONENT_CANCEL_EVENT, CREATE_COMPONENT_FAILURE_EVENT, CREATE_COMPONENT_START_EVENT, CREATE_COMPONENT_SUCCESS_EVENT } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { SignIn } from "../SignIn/SignIn";
import { ConfigureRepoStep } from './ConfigureRepoStep/ConfigureRepoStep'
import { useQuery } from "@tanstack/react-query";
import { EndpointConfigStep } from './EndpointConfigStep';


const handleComponentCreation = async (formData: Partial<ComponentWizardState>) => {
    try {
        const { mode, name, type, serviceType, implementationType, repository: { org, repo, branch, subPath, dockerContext, dockerFile, openApiFilePath, credentialID, gitProvider }, description, accessibility, trigger, port } = formData;

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
            accessibility,
            trigger,
            description: description ?? '',
            repositoryInfo: { org, repo, branch, subPath, gitProvider, bitbucketCredentialId },
            serviceType: type === ChoreoComponentType.Service ? serviceType : undefined,
        };

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
                await projectManager.createLocalComponent(componentParams);
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

                await ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
            } else {
                await projectManager.createLocalBalComponentFromExistingSource(componentParams);
            }
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: CREATE_COMPONENT_SUCCESS_EVENT,
                properties: { type: formData?.type?.toString(), mode: formData?.mode }
            });
        }
    } catch (err: any) {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_FAILURE_EVENT,
            properties: { type: formData?.type?.toString(), mode: formData?.mode, cause: err.message }
        });
    }
};


export const ComponentWizard: React.FC<{ componentCreateMode?: ComponentCreateMode }> = (props) => {
    const initialState: WizardState<Partial<ComponentWizardState>> = {
        currentStep: 0,
        formData: {
            mode: props.componentCreateMode,
            name: '',
            accessibility: "external",
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
                credentialID: ''
            },
            port: '3000',
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

    const { loginStatus, choreoProject } = useContext(ChoreoWebViewContext);
    const [state, setState] = useState(initialState);

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_START_EVENT,
        });
    }, []);

    const { formData: { repository, type, mode, implementationType } } = state;

    const { data: localDirectorMetaData, isFetching: fetchingDirectoryMetadata } = useQuery(
        ["getLocalComponentDirMetaData", choreoProject, repository, type, mode],
        () =>
            ChoreoWebViewAPI.getInstance().getLocalComponentDirMetaData({
                orgName: repository?.org,
                repoName: repository?.repo,
                projectId: choreoProject.id,
                subPath: repository?.subPath,
                dockerFilePath: repository?.dockerFile,
                dockerContextPath: repository?.dockerContext
            }),
        { enabled: type === ChoreoComponentType.Service && mode === 'fromExisting' }
    );

    let steps = [ComponentTypeStep, ComponentDetailsStep, ConfigureRepoStep];
    if (type === ChoreoComponentType.Service) {
        steps = [ComponentTypeStep, ServiceTypeStep, ComponentDetailsStep, ConfigureRepoStep];

        if (mode === 'fromExisting' && implementationType === ChoreoImplementationType.Docker && !localDirectorMetaData?.hasEndpointsYaml) {
            steps = [...steps, EndpointConfigStep]
        }
    } else if (type === ChoreoComponentType.Webhook) {
        steps = [ComponentTypeStep, TriggerConfigStep, ComponentDetailsStep, ConfigureRepoStep];
    }

    return (
        <>
            {loginStatus === "LoggedIn" ?
                <Wizard
                    title="Create New Choreo Component"
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
                    loading={fetchingDirectoryMetadata}
                /> :
                <SignIn />
            }
        </>
    );
};
