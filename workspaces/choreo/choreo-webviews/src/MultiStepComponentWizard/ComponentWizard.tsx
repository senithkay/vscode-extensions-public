/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from "react";

import { WizardState } from "../Commons/MultiStepWizard/types";
import { Wizard } from "../Commons/MultiStepWizard/Wizard";

import { ComponentDetailsStep } from "./ComponentDetailsStep";
import { ComponentWizardState } from "./types";
import { ComponentTypeStep } from "./ComponentTypeStep";
import { BYOCRepositoryDetails, ChoreoBuildPackNames, ChoreoComponentCreationParams, ChoreoComponentType, ChoreoImplementationType, ChoreoServiceType, ComponentDisplayType, ComponentNetworkVisibility, CREATE_COMPONENT_CANCEL_EVENT, CREATE_COMPONENT_FAILURE_EVENT, CREATE_COMPONENT_START_EVENT, CREATE_COMPONENT_SUCCESS_EVENT, GitProvider, GitRepo, WebAppSPATypes } from "@wso2-enterprise/choreo-core";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { SignIn } from "../SignIn/SignIn";
import { ConfigureRepoStep } from './ConfigureRepoStep/ConfigureRepoStep'
import { useQuery } from "@tanstack/react-query";
import { EndpointConfigStep } from './EndpointConfigStep';


const handleComponentCreation = async (formData: Partial<ComponentWizardState>) => {
    try {
        const { name, type, implementationType, repository, description, accessibility, networkVisibility, endpointContext, serviceType} = formData;
        const { org, repo, branch, subPath, dockerContext, dockerFile, openApiFilePath, credentialID, gitProvider, isMonoRepo, createNewDir } = repository;

        const choreoProject = await ChoreoWebViewAPI.getInstance().getChoreoProject();
        const selectedOrg = await ChoreoWebViewAPI.getInstance().getCurrentOrg();
        const bitbucketCredentialId = credentialID ? credentialID : '';
        
        const isBuildPackType = ![
            ChoreoImplementationType.Ballerina, 
            ChoreoImplementationType.MicroIntegrator, 
            ChoreoImplementationType.Docker,
            ChoreoImplementationType.StaticFiles,
            ...WebAppSPATypes
        ].includes(implementationType as ChoreoImplementationType);

        let selectedDisplayType: ComponentDisplayType;
        if (type === ChoreoComponentType.Service) {
            switch (implementationType) {
                case ChoreoImplementationType.Ballerina:
                    selectedDisplayType = ComponentDisplayType.Service;
                    break;
                case ChoreoImplementationType.Docker:
                    selectedDisplayType = ComponentDisplayType.ByocService;
                    break;
                case ChoreoImplementationType.MicroIntegrator:
                    selectedDisplayType = ComponentDisplayType.MiApiService;
                    break;
                default:
                    selectedDisplayType = ComponentDisplayType.BuildpackService;
            }
        } else if (type === ChoreoComponentType.ScheduledTask) {
            switch (implementationType) {
                case ChoreoImplementationType.Ballerina:
                    selectedDisplayType = ComponentDisplayType.ScheduledTask;
                    break;
                case ChoreoImplementationType.Docker:
                    selectedDisplayType = ComponentDisplayType.ByocCronjob;
                    break;
                case ChoreoImplementationType.MicroIntegrator:
                    selectedDisplayType = ComponentDisplayType.MiCronjob
                    break;
                default:
                    selectedDisplayType = ComponentDisplayType.BuildpackCronJob;
            }
        } else if (type === ChoreoComponentType.ManualTrigger) {
            switch (implementationType) {
                case ChoreoImplementationType.Ballerina:
                    selectedDisplayType = ComponentDisplayType.ManualTrigger;
                    break;
                case ChoreoImplementationType.Docker:
                    selectedDisplayType = ComponentDisplayType.ByocJob;
                    break;
                case ChoreoImplementationType.MicroIntegrator:
                    selectedDisplayType = ComponentDisplayType.MiJob;
                    break;
                default:
                    selectedDisplayType = ComponentDisplayType.BuildpackJob;
            }
        } else if (type === ChoreoComponentType.WebApplication) {
            if (implementationType === ChoreoImplementationType.Docker) {
                selectedDisplayType = ComponentDisplayType.ByocWebApp;
            } else if (WebAppSPATypes.includes(implementationType as ChoreoBuildPackNames) || ChoreoBuildPackNames.StaticFiles.toString() == implementationType) {
                selectedDisplayType = ComponentDisplayType.ByocWebAppDockerLess;
            } else {
                selectedDisplayType = ComponentDisplayType.BuildpackWebApp;
            }
        } else if (type === ChoreoComponentType.Webhook) {
            selectedDisplayType = ComponentDisplayType.Webhook;
        }

        const componentParams: ChoreoComponentCreationParams = {
            name: name,
            projectId: choreoProject?.id,
            org: selectedOrg,
            displayType: selectedDisplayType,
            description: description ?? '',
            repositoryInfo: { org, repo, branch, subPath, gitProvider, bitbucketCredentialId, openApiFilePath },
            accessibility,
            port: formData.port ? Number(formData.port) : 3000,
            networkVisibility,
            endpointContext,
            serviceType,
            initializeNewDirectory: createNewDir
        };

        if (isBuildPackType) {
            componentParams.implementationType = implementationType;
            componentParams.languageVersion = formData.selectedBuildPackVersion;
            const buildPack = formData.buildPackList.find(item => item.language === formData.implementationType);
            componentParams.buildPackId = buildPack.id;
            await ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
        } else if (type === ChoreoComponentType.WebApplication) {
            componentParams.webAppConfig = formData.webAppConfig;
            if (implementationType === ChoreoImplementationType.Docker) {
                const repoDetails: BYOCRepositoryDetails = {
                    ...componentParams.repositoryInfo,
                    dockerFile,
                    dockerContext,
                }
                componentParams.repositoryInfo = repoDetails;
                componentParams.port = formData.port ? Number(formData.port) : 3000;
            } else {
                componentParams.webAppConfig.webAppType = implementationType;
            }
            await ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
        } else if (implementationType === ChoreoImplementationType.Docker) {
            const repoDetails: BYOCRepositoryDetails = {
                ...componentParams.repositoryInfo,
                dockerFile,
                dockerContext,
            }
            componentParams.repositoryInfo = repoDetails;
            await ChoreoWebViewAPI.getInstance().createNonBalLocalComponentFromExistingSource(componentParams);
        } else {
            await ChoreoWebViewAPI.getInstance().createBalLocalComponentFromExistingSource(componentParams);
        }
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_SUCCESS_EVENT,
            properties: { type: formData?.type?.toString() }
        });

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
            properties: { type: formData?.type?.toString(), cause: err.message }
        });
        throw new Error(err)
    }
};


export const ComponentWizard: React.FC = () => {
    const { loginStatus, choreoProject, selectedOrg } = useChoreoWebViewContext();

    const initialState: WizardState<Partial<ComponentWizardState>> = {
        currentStep: 0,
        formData: {
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
                isMonoRepo: false,
                createNewDir: false,
                directoryPathError: ""
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

    const { formData: { type, repository } } = state;

    const { data: buildPackList, isLoading: buildPacksLoading } = useQuery(
        ["getBuildPacks", selectedOrg, state.formData?.type],
        async () => {
            return ChoreoWebViewAPI.getInstance().getBuildpack({
                componentType: state.formData.type,
                orgId: selectedOrg.id,
            })
        },
        { enabled: !!state.formData?.type && !!selectedOrg?.id }
    );

    useQuery(
        ["readEndpointsYaml", repository?.dockerContext, type],
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
        steps = [...steps, EndpointConfigStep]
    }

    return (
        <>
            {loginStatus === "LoggedIn" ?
                <Wizard
                    title="Create a new component"
                    steps={steps}
                    state={{
                        ...state,
                        formData: { ...state.formData, buildPackList, buildPacksLoading }
                    }}
                    setState={setState}
                    validationRules={[]}
                    onSave={handleComponentCreation}
                    onCancel={(formData) => {
                        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                            eventName: CREATE_COMPONENT_CANCEL_EVENT,
                            properties: { type: formData?.type }
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
