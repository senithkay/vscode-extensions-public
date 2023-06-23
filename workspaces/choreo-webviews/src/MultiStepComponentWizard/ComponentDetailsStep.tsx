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
import { VSCodeTextArea, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ErrorBanner, ErrorIcon } from "../Commons/ErrorBanner";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { ComponentWizardState } from "./types";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ChoreoComponentType, ChoreoImplementationType } from "@wso2-enterprise/choreo-core";
import { ConfigCardList } from "./ConfigCardList";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    gap: 20px;
    width: 100%;
    min-width: 400px;
`;


function sanitizeFolderName(folderName: string): string {
    // Replace any characters that are not letters, numbers, spaces, or underscores with an empty string
    const sanitized = folderName.replace(/[^a-zA-Z0-9\s_]/g, '');

    // Remove any leading or trailing spaces
    const trimmed = sanitized.trim();

    // Replace any consecutive spaces with a single space
    const final = trimmed.replace(/\s+/g, ' ');

    return final;
}

export const ComponentDetailsStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange, stepValidationErrors } = props;

    const setComponentName = (name: string) => {
        onFormDataChange(prevFormData =>
        ({
            ...prevFormData, name,
            repository: {
                ...prevFormData.repository,
                subPath: prevFormData.mode === "fromScratch" ? sanitizeFolderName(name) : prevFormData?.repository?.subPath
            }
        }));
    };

    const setDescription = (description: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, description }));
    };


    return (
        <StepContainer>
            <VSCodeTextField
                autofocus
                placeholder="Name"
                onInput={(e: any) => setComponentName(e.target.value)}
                value={formData?.name || ''}
                id='component-name-input'
            >
                Component Name <RequiredFormInput />
                {stepValidationErrors["name"] && <span slot="end" className={`codicon codicon-error ${ErrorIcon}`} />}
            </VSCodeTextField>
            {stepValidationErrors["name"] && <ErrorBanner errorMsg={stepValidationErrors["name"]} />}
            <VSCodeTextArea
                autofocus
                placeholder="Description"
                onInput={(e: any) => setDescription(e.target.value)}
                value={formData?.description || ''}
            >
                Description
            </VSCodeTextArea>
            <div>
                {[ChoreoComponentType.Service, ChoreoComponentType.ScheduledTask, ChoreoComponentType.ManualTrigger].includes(formData.type) && <>
                    <p>How do you want to implement it?</p>
                    <ConfigCardList 
                        formKey='implementationType'
                        formData={formData}
                        onFormDataChange={onFormDataChange}
                        items={[
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
                        ]}
                    />
                </>}
                {formData.type === ChoreoComponentType.WebApplication && <>
                    <p>Web Application Type</p>
                    <ConfigCardList 
                        formKey='implementationType'
                        formData={formData}
                        onFormDataChange={onFormDataChange}
                        items={[
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
                        ]}
                    />
                </>}
            </div>
        </StepContainer>
    );
};

export const ComponentDetailsStep: Step<Partial<ComponentWizardState>> = {
    title: 'Component Details',
    component: ComponentDetailsStepC,
    validationRules: [
        {
            field: 'name',
            message: 'Component name is already taken',
            rule: async (value: any, _formData, context) => {
                const { isChoreoProject, choreoProject } = context;
                if (isChoreoProject && choreoProject && choreoProject?.id) {
                    return ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isComponentNameAvailable(value);
                }
                return true;
            }
        },
        {
            field: 'name',
            message: 'Name is required',
            rule: async (value: any) => {
                return value !== undefined && value !== '';
            }
        },
        {
            field: 'implementationType',
            message: 'Type is required',
            rule: async (implementationType, formData) => {
                if (
                    formData.type === ChoreoComponentType.WebApplication &&
                    ![
                        ChoreoImplementationType.React,
                        ChoreoImplementationType.Angular,
                        ChoreoImplementationType.Vue,
                        ChoreoImplementationType.StaticFiles,
                        ChoreoImplementationType.Docker,
                    ].includes(implementationType)
                ) {
                    return false;
                }
                if (
                    [ChoreoComponentType.Service, ChoreoComponentType.ScheduledTask, ChoreoComponentType.ManualTrigger].includes(formData.type) &&
                    ![
                        ChoreoImplementationType.Ballerina,
                        ChoreoImplementationType.Docker,
                    ].includes(implementationType)
                ) {
                    return false;
                }
                return true;
            },
        },
    ]
};
