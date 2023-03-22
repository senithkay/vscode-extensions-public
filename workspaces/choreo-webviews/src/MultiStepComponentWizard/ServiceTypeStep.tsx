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
import { ChoreoServiceComponentType } from "@wso2-enterprise/choreo-core";
import { useCallback, useEffect } from "react";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ComponentTypeSelector } from "../ComponentWizard/ComponetTypeSelector/ComponentTypeSelector";
import { ComponentWizardState } from "./types";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
`;

export const ServiceTypeStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const setSelectedType = (subType: ChoreoServiceComponentType) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, subType }));
    };
   
    useEffect(() => {
        if (!formData?.subType) {   
            setSelectedType(ChoreoServiceComponentType.REST_API);
        }
    }, [formData?.subType, setSelectedType]);

    return (
        <StepContainer>
            <ComponentTypeSelector selectedType={formData?.subType} onChange={setSelectedType} />
        </StepContainer>
    );
};

export const ServiceComponentTypeStep: Step<Partial<ComponentWizardState>> = {
    title: 'Service Type',
    component: ServiceTypeStepC,
    validationRules: []
};

