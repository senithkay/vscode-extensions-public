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
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";
import { ChoreoServiceComponentType, Component } from "@wso2-enterprise/choreo-core";
import { useCallback, useEffect } from "react";
import { ErrorBanner, ErrorIcon } from "../Commons/ErrorBanner";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { RequiredFormInput } from "../Commons/RequiredInput";
import { ComponentTypeSelector } from "../ComponentWizard/ComponetTypeSelector/ComponentTypeSelector";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { ComponentWizardState } from "./types";


export const ComponentDetailsStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange, stepValidationErrors } = props;

    const setSelectedType = useCallback((type: ChoreoServiceComponentType) => {
        onFormDataChange({ type });
    }, [onFormDataChange]);

    const setComponentName = useCallback((name: string) => {
        onFormDataChange({ name });
    }, [onFormDataChange]);

    useEffect(() => {
        if (!formData?.type) {   
            setSelectedType(ChoreoServiceComponentType.REST_API);
        }
    }, [formData?.type, setSelectedType]);

    return (
        <div>
            <ComponentTypeSelector selectedType={formData?.type} onChange={setSelectedType} />
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
        </div>
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
        {
            field: 'name',
            message: 'Componet name is already taken',
            rule: async (value: any, formData, context) => {
                const {  isChoreoProject, choreoProject }  = context;
                if (isChoreoProject && choreoProject && choreoProject?.id) {
                    const components = await ChoreoWebViewAPI.getInstance().getComponents(choreoProject?.id);
                    if (components.length) {
                        const component = components.find((component: Component) => component.name === value);
                        if (component) {
                            return false;
                        }
                    }
                }
                return true;
            }
        },
        {
            field: 'name',
            message: 'Name is required',
            rule: async (value: any) => {
                return value !== undefined;
            }
        },
    ]
};

