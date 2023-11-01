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
import { VSCodeDropdown, VSCodeOption, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ComponentWizardState } from "./types";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ChoreoComponentType, ComponentAccessibility } from "@wso2-enterprise/choreo-core";
import { ConfigCardList } from "./ConfigCardList";
import { TextField, ProgressIndicator } from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "../ProjectWizard/ProjectWizard";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: center;
    gap: 20px;
    width: 100%;
    min-width: 400px;
`;

const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const BuildPackOptionWrap = styled.div`
    position: relative;
`;


export const ComponentDetailsStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange, stepValidationErrors } = props;

    const setComponentName = (name: string) => {
        onFormDataChange(prevFormData =>
        ({
            ...prevFormData, name,
            repository: {
                ...prevFormData.repository,
                subPath: prevFormData?.repository?.subPath
            }
        }));
    };

    const setDescription = (description: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, description }));
    };

    const setAccessibility = (accessibility: ComponentAccessibility) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, accessibility }));
    };

    return (
        <StepContainer>
            <SectionWrapper>
                <h3>Component Details</h3>
                <TextField
                    value={formData?.name || ''}
                    id='component-name-input'
                    label="Component Name"
                    placeholder="Name"
                    onChange={(text: string) => setComponentName(text)}
                    errorMsg={stepValidationErrors["name"]}
                    autoFocus
                    required
                />
                <VSCodeTextArea
                    autofocus
                    placeholder="Description"
                    onInput={(e: any) => setDescription(e.target.value)}
                    value={formData?.description || ''}
                >
                    Description
                </VSCodeTextArea>
                <div>
                    <p>Implementation Type</p>
                    <BuildPackOptionWrap>
                        {formData.buildPacksLoading && <ProgressIndicator />}
                        <ConfigCardList
                            formKey='implementationType'
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                            items={formData?.buildPackList?.map(item=>({ label:item.displayName, icon: item.iconUrl, value:item.language }))}
                        />
                    </BuildPackOptionWrap>
                    {formData?.type === ChoreoComponentType.Webhook && (
                        <DropDownContainer>
                            <label htmlFor="access-mode">Access Mode</label>
                            <VSCodeDropdown id="access-mode" onChange={(e: any) => setAccessibility(e.target.value)}>
                                <VSCodeOption value={'external'}><b>External:</b> API is publicly accessible</VSCodeOption>
                                <VSCodeOption value={'internal'}><b>Internal:</b> API is accessible only within Choreo</VSCodeOption>
                            </VSCodeDropdown>
                        </DropDownContainer>
                    )}
                </div>
            </SectionWrapper>
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
    ]
};
