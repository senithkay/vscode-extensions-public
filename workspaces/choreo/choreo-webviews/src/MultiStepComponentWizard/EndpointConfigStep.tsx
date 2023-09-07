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
import { VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ComponentWizardState } from "./types";
import { RepoFileOpenDialogInput } from "./ShowOpenDialogInput/RepoFileOpenDialogInput";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ErrorBanner, ErrorIcon, Typography } from "@wso2-enterprise/ui-toolkit";
import { ChoreoComponentType, ChoreoServiceType, ComponentNetworkVisibility } from "@wso2-enterprise/choreo-core";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: center;
    gap: 20px;
    width: 100%;
    min-height: calc(100vh - 160px);
`;

const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const VisibilityLabel = styled.label`
    margin-top: 5px;
    font-weight: lighter;
`;

const SectionWrapper = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    position: relative;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    padding: 20px;
    // End Sizing Props
    // Border Props
    border-radius: 10px;
    border-style: solid;
    border-width: 1px;
    border-color: transparent;
    background-color: var(--vscode-welcomePage-tileBackground);
    &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

export interface EndpointConfigProps {
    formData: Partial<ComponentWizardState>;
    onFormDataChange: (updater: (prevFormData: Partial<ComponentWizardState>) => Partial<ComponentWizardState>) => void;
}

export const EndpointConfigStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, stepValidationErrors, onFormDataChange } = props;
    const { repository } = formData;

    const setOpenApiFilePath = (openApiFilePath: string) => {
        props.onFormDataChange(prevFormData => ({
            ...prevFormData,
            repository: {
                ...prevFormData.repository,
                openApiFilePath,
            }
        }));
    }

    const setPortValue = (port: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, port }));
    };

    const setContextValue = (endpointContext: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, endpointContext }));
    };

    const setNetworkVisibility = (networkVisibility: ComponentNetworkVisibility) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, networkVisibility }));
    };

    const projectDesc = {
        'Project': 'Allows components within the same project to access the endpoint.',
        'Organization': 'Allows any component within the same organization to access the endpoint.',
        'Public': 'Allows any client to access the endpoint, regardless of location or organization.'
    }

    return (
        <div>
            <StepContainer>
                <SectionWrapper>
                    <Typography variant="h3">Configure Endpoints</Typography>
                    <VSCodeTextField
                        autofocus
                        placeholder="Port"
                        onInput={(e: any) => setPortValue(e.target.value)}
                        value={formData?.port || ''}
                        id='component-port-input'
                    >
                        Port
                        {stepValidationErrors["port"] && <span slot="end" className={`codicon codicon-error ${ErrorIcon}`} />}
                    </VSCodeTextField>
                    {stepValidationErrors["port"] && <ErrorBanner errorMsg={stepValidationErrors["port"]} />}

                    {formData?.type === ChoreoComponentType.Service && (
                        <DropDownContainer>
                            <label htmlFor="network-visibility">Network Visibility</label>
                            <VSCodeDropdown value={formData.networkVisibility} id="network-visibility" onChange={(e: any) => setNetworkVisibility(e.target.value)}>
                                <VSCodeOption value='Project'>Project</VSCodeOption>
                                <VSCodeOption value='Organization'>Organization</VSCodeOption>
                                <VSCodeOption value='Public'>Public</VSCodeOption>
                            </VSCodeDropdown>
                            <VisibilityLabel>{projectDesc[formData.networkVisibility]}</VisibilityLabel>
                        </DropDownContainer>
                    )}

                    {[ChoreoServiceType.RestApi, ChoreoServiceType.GraphQL].includes(formData?.serviceType) && (
                        <>
                            <VSCodeTextField
                                autofocus
                                placeholder="/greeting"
                                onInput={(e: any) => setContextValue(e.target.value)}
                                value={formData?.endpointContext || ''}
                                id='component-context-input'
                            >
                                Context
                                {stepValidationErrors["endpointContext"] && <span slot="end" className={`codicon codicon-error ${ErrorIcon}`} />}
                            </VSCodeTextField>
                            {stepValidationErrors["endpointContext"] && <ErrorBanner errorMsg={stepValidationErrors["endpointContext"]} />}
                        </>
                    )}

                    {formData.mode === 'fromExisting' && formData?.serviceType === ChoreoServiceType.RestApi && <VSCodeTextField
                        placeholder=""
                        onInput={(e: any) => setOpenApiFilePath(e.target.value)}
                        value={repository?.openApiFilePath}
                    >
                        OpenAPI file Path
                        <RepoFileOpenDialogInput
                            label="Browse"
                            repo={`${repository?.org}/${repository?.repo}`}
                            path={repository?.openApiFilePath || ''}
                            onOpen={setOpenApiFilePath}
                            canSelectFiles={true}
                            canSelectFolders={false}
                            canSelectMany={false}
                            title="Select OpenAPI file path"
                            filters={{ 'YAML Files': ['yaml'] }}
                        />
                    </VSCodeTextField>}
                </SectionWrapper>
            </StepContainer>
        </div>
    );
};


export const EndpointConfigStep: Step<Partial<ComponentWizardState>> = {
    title: 'Configure Endpoints',
    component: EndpointConfigStepC,
    validationRules: [
        {
            field: 'port',
            message: 'Port is required',
            rule: async (value: any) => {
                return value !== undefined && value !== '';
            }
        },
        {
            field: 'port',
            message: 'Port should be a number',
            rule: async (value: any) => {
                return value !== undefined && !isNaN(value)
            }
        },
        {
            field: 'endpointContext',
            message: 'Context is required',
            rule: async (value: any, formData) => {
                if ([ChoreoServiceType.RestApi, ChoreoServiceType.GraphQL].includes(formData?.serviceType)) {
                    return value !== undefined && value !== '';
                }
                return false;
            }
        },
    ]
};