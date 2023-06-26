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
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ComponentWizardState } from "./types";
import { RepoFileOpenDialogInput } from "./ShowOpenDialogInput/RepoFileOpenDialogInput";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ErrorIcon, ErrorBanner } from "../Commons/ErrorBanner";
import { ChoreoServiceType } from "@wso2-enterprise/choreo-core";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-content: center;
    gap: 20px;
    width: 100%;
    min-width: 400px;
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

    return (
        <div>
            <StepContainer>
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

                {formData?.serviceType === ChoreoServiceType.RestApi && <VSCodeTextField
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
    ]
};