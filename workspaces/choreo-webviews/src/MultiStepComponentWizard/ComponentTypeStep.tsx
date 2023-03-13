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
import styled from "@emotion/styled";
import { useCallback, useEffect } from "react";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ComponentTypeCard } from "./ComponentTypeCard";
import { ComponentType, ComponentWizardState } from "./types";

const StepContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

export const ComponentTypeStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;

    const setSelectedType = useCallback((type: ComponentType) => {
        onFormDataChange({ type });
    }, [onFormDataChange]);

   
    useEffect(() => {
        if (!formData?.type) {   
            setSelectedType("Service");
        }
    }, [formData?.type, setSelectedType]);

    return (
        <StepContainer>
            <ComponentTypeCard
                type="Service"
                description="Design, develop, test, and deploy your microservices"
                isSelected={formData?.type === "Service"}
                onSelect={setSelectedType}
                key="Service"
            />
            <ComponentTypeCard
                type="Scheduled Trigger"
                description="Create programs that can execute on a schedule. E.g., Recurring integration tasks."
                isSelected={formData?.type === "Scheduled Trigger"}
                onSelect={setSelectedType}
                key="Scheduled Trigger"
            />
            <ComponentTypeCard
                type="Manual Trigger"
                description="Create programs that you can execute manually. E.g., One-time integration tasks."
                isSelected={formData?.type === "Manual Trigger"}
                onSelect={setSelectedType}
                key="Manual Trigger"
            />
            <ComponentTypeCard
                type="REST API Proxy"
                description="Provide API management capabilities for existing APIs."
                onSelect={setSelectedType}
                isSelected={formData?.type === "REST API Proxy"}
                key="REST API Proxy"
            />
        </StepContainer>
    );
};

export const ComponentTypeStep: Step<Partial<ComponentWizardState>> = {
    title: 'Component Type',
    component: ComponentTypeStepC,
    validationRules: []
};

