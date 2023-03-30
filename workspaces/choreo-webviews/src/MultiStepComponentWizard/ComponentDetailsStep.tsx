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
import { ChoreoComponentType, ComponentAccessibility } from "@wso2-enterprise/choreo-core";
import { ErrorBanner, ErrorIcon } from "../Commons/ErrorBanner";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { RequiredFormInput } from "../Commons/RequiredInput";
// import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ComponentWizardState } from "./types";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    gap: 20px;
    width: 100%;
    min-width: 400px;
`;

const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
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
                subPath: prevFormData.mode === "fromScratch" ? sanitizeFolderName(name) : prevFormData.repository.subPath
            }
        }));
    };

    const setDescription = (description: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, description }));
    };

    const setAccessibility = (accessibility: ComponentAccessibility) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, accessibility }));
    };

    const showAccessibility = formData?.type === ChoreoComponentType.Service 
        || formData?.type === ChoreoComponentType.ByocService
        || formData?.type === ChoreoComponentType.RestApi
        || formData?.type === ChoreoComponentType.ByocRestApi
        || formData?.type === ChoreoComponentType.Proxy;

    return (
        <StepContainer>
            <VSCodeTextField
                autofocus
                placeholder="Name"
                onInput={(e: any) => setComponentName(e.target.value)}
                value={formData?.name || ''}
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
            {showAccessibility && (
                <DropDownContainer>
                    <label htmlFor="access-mode">Access Mode</label>
                    <VSCodeDropdown id="access-mode" onChange={(e: any) => setAccessibility(e.target.value)}>
                        <VSCodeOption value={'external'}><b>External:</b> API is publicly accessible</VSCodeOption>
                        <VSCodeOption value={'internal'}><b>Internal:</b> API is accessible only within Choreo</VSCodeOption>
                    </VSCodeDropdown>
                </DropDownContainer>    
            )}
        </StepContainer>
    );
};

export const ComponentDetailsStep: Step<Partial<ComponentWizardState>> = {
    title: 'Component Details',
    component: ComponentDetailsStepC,
    validationRules: [
        {
            field: 'type',
            message: 'Please select a component type',
            rule: async (value: any) => {
                return value !== undefined;
            }
        },
        // {
        //     field: 'name',
        //     message: 'Componet name is already taken',
        //     rule: async (value: any, _formData, context) => {
        //         const {  isChoreoProject, choreoProject }  = context;
        //         if (isChoreoProject && choreoProject && choreoProject?.id) {
        //             const components = await ChoreoWebViewAPI.getInstance().getComponents(choreoProject?.id);
        //             if (components.length) {
        //                 const component = components.find((component: Component) => component.name === value);
        //                 if (component) {
        //                     return false;
        //                 }
        //             }
        //         }
        //         return true;
        //     }
        // },
        {
            field: 'name',
            message: 'Name is required',
            rule: async (value: any) => {
                return value !== undefined && value !== '';
            }
        },
    ]
};
