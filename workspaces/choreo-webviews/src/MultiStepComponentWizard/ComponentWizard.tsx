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
import React, { useContext, useEffect } from "react";

import { WizardState } from "../Commons/MultiStepWizard/types";
import { Wizard } from "../Commons/MultiStepWizard/Wizard";
import { ConfigureRepoStep } from "./ConfigureRepoStep/ConfigureRepoStep";
import { TriggerConfigStep } from "./WebhookTriggerSelectorStep/WebhookTriggerSelector";

import { ComponentDetailsStep } from "./ComponentDetailsStep";
import { ComponentWizardState } from "./types";
import { ComponentTypeStep } from "./ComponentTypeStep";
import { BYOCRepositoryDetails, ChoreoComponentCreationParams, ChoreoComponentType, CREATE_COMPONENT_CANCEL_EVENT, CREATE_COMPONENT_FAILURE_EVENT, CREATE_COMPONENT_START_EVENT, CREATE_COMPONENT_SUCCESS_EVENT } from "@wso2-enterprise/choreo-core";
import { ChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { SignIn } from "../SignIn/SignIn";

const handleComponentCreation = async (formData: Partial<ComponentWizardState>) => {
    const { mode, name, type, repository: { org, repo, branch, subPath, dockerContext, dockerFile }, description, accessibility, trigger } = formData;

    const choreoProject = await ChoreoWebViewAPI.getInstance().getChoreoProject();
    const selectedOrg = await ChoreoWebViewAPI.getInstance().getCurrentOrg();


    const componentParams: ChoreoComponentCreationParams = {
        name: name,
        projectId: choreoProject?.id,
        org: selectedOrg,
        displayType: type,
        accessibility,
        trigger,
        description: description ?? '',
        repositoryInfo: {
            org,
            repo,
            branch,
            subPath
        }
    };

    if (mode === "fromScratch") {

        const response: any = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().createLocalComponent(componentParams);
        if (response !== true) {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: CREATE_COMPONENT_FAILURE_EVENT,
                properties: {
                    type: formData?.type,
                    mode: formData?.mode,
                    cause: response.message
                }
            });
            throw new Error("Failed to create component. Error: " + response.message);
        }
    } else {
        if (type.startsWith("byoc")) {
            const repoDetails: BYOCRepositoryDetails = {
                ...componentParams.repositoryInfo,
                dockerFile,
                dockerContext
            }
            componentParams.repositoryInfo = repoDetails;
        }
        const response: any = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().createLocalComponentFromExistingSource(componentParams);
        if (response !== true) {
            ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                eventName: CREATE_COMPONENT_FAILURE_EVENT,
                properties: {
                    type: formData?.type,
                    mode: formData?.mode,
                    cause: response.message
                }
            });
            throw new Error("Failed to create component. Error: " + response.message);
        }
    }
    ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
        eventName: CREATE_COMPONENT_SUCCESS_EVENT,
        properties: {
            type: formData?.type,
            mode: formData?.mode,
        }
    });
};

export const ComponentWizard: React.FC = () => {
    const { loginStatus } = useContext(ChoreoWebViewContext);

    const initialState: WizardState<Partial<ComponentWizardState>> = {
        currentStep: 0,
        formData: {
            mode: "fromScratch",
            name: '',
            accessibility: "external",
            type: ChoreoComponentType.Service,
            repository: {
                dockerContext: '',
                dockerFile: '',
                subPath: '',
                isBareRepo: false,
                isCloned: false,
            }
        },
        isFormValid: false,
        isStepValid: false,
        validationErrors: {} as Record<keyof ComponentWizardState, string>,
        stepValidationErrors: {} as Record<keyof ComponentWizardState, string>,
        isStepValidating: false,
    };

    useEffect(() => {
        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
            eventName: CREATE_COMPONENT_START_EVENT,
        });
    }, []);

    return (
        <>
            {loginStatus === "LoggedIn" ?
                <Wizard
                    title="Create New Choreo Component"
                    steps={[ComponentTypeStep, ComponentDetailsStep, TriggerConfigStep, ConfigureRepoStep,]}
                    initialState={initialState}
                    validationRules={[]}
                    onSave={handleComponentCreation}
                    onCancel={(formData) => {
                        ChoreoWebViewAPI.getInstance().sendProjectTelemetryEvent({
                            eventName: CREATE_COMPONENT_CANCEL_EVENT,
                            properties: {
                                type: formData?.type,
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
