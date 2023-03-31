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

import { WizardState } from "../Commons/MultiStepWizard/types";
import { Wizard } from "../Commons/MultiStepWizard/Wizard";
import { ConfigureRepoStep } from "./ConfigureRepoStep/ConfigureRepoStep";
import { TriggerConfigStep  } from "./WebhookTriggerSelectorStep/WebhookTriggerSelector";

import { ComponentDetailsStep } from "./ComponentDetailsStep";
import { ComponentWizardState } from "./types";
import { ComponentTypeStep } from "./ComponentTypeStep";
import { ChoreoComponentType } from "@wso2-enterprise/choreo-core";
import { IChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";

const handleComponentCreation = async (formData: Partial<ComponentWizardState>, context: IChoreoWebViewContext) => {
    const { name, type, repository: { org, repo, branch, subPath }, description, accessibility, trigger  } = formData;
    const { choreoProject, selectedOrg } = context;
    const componentParams = {
        name: name,
        projectId: choreoProject?.id,
        org: selectedOrg,
        displayType: type,
        accessibility,
        triggerId: trigger,
        description: description ?? '',
        repositoryInfo: {
            org,
            repo,
            branch,
            subPath
        }
    };

    const response: any = await ChoreoWebViewAPI.getInstance().getChoreoProjectManager().createLocalComponent(componentParams);
    if (response !== true) {
        throw new Error("Failed to create component. Error: " + response.message);
    }
};

export const ComponentWizard: React.FC = () => {
    const initialState: WizardState<Partial<ComponentWizardState>> = {
        currentStep: 0,
        formData: {
            mode: "fromScratch",
            name: '',
            accessibility: "external",
            type: ChoreoComponentType.Service,
            cache: {
                authorizedOrgs: [],
            }
        },
        isFormValid: false,
        isStepValid: false,
        validationErrors: {} as Record<keyof ComponentWizardState, string>,
        stepValidationErrors: {} as Record<keyof ComponentWizardState, string>,
        isStepValidating: false,
    };

    return (
        <Wizard 
            title="Create New Choreo Component"
            steps={[ComponentTypeStep, ComponentDetailsStep, TriggerConfigStep, ConfigureRepoStep, ]}
            initialState={initialState}
            validationRules={[]}
            onSave={handleComponentCreation}
            onCancel={() => {}}
            saveButtonText="Create"
            closeOnSave={true}
        />
    );
};
