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
import { VSCodeDropdown, VSCodeOption, VSCodeRadio } from "@vscode/webview-ui-toolkit/react";
import { ChoreoServiceComponentType } from "@wso2-enterprise/choreo-core";
import { useCallback, useEffect, useState } from "react";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ComponentTypeCard } from "./ComponentTypeCard";
import { ChoreoComponentType, ComponentType, ComponentWizardState, ExistingChoreoComponentType } from "./types";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;

const CardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
`;

const SubContainer = styled.div`
    margin-left: 50px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: space-between;
    gap: 20px;
`;

export const ComponentTypeStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const setSelectedType = (type: ComponentType, choreoType: ChoreoComponentType, subType?: ChoreoServiceComponentType) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, type, choreoType, subType }));
    };

    useEffect(() => {
        if (!formData?.type) {   
            setSelectedType("Service", "Service", ChoreoServiceComponentType.REST_API);
        }
    }, []);

    useEffect(() => {
        // Make sure we select appropriate choreo type when we switch the mode
        if (formData?.mode === "fromScratch"
            && ["Dockerfile", "Ballerina Package" ].includes(formData?.type as ComponentType)) {
            setSelectedType("Service", "Service", ChoreoServiceComponentType.REST_API);
        } else if (formData?.mode === "fromExisting" 
            && !["Dockerfile", "Ballerina Package" ].includes(formData?.type as ComponentType)) {
            setSelectedType("Ballerina Package", (formData?.choreoType === undefined || formData?.choreoType === "REST API Proxy") ? "Service" : formData?.choreoType);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData?.mode]);

    const handleFromScrachCheckChange = (e: any) => {
       const mode = e.target.checked ? "fromScratch" : "fromExisting";
       onFormDataChange(prevFormData => ({ ...prevFormData, mode }));
    };

    const handleFromExistingCheckChange = (e: any) => {
        const mode = e.target.checked ? "fromExisting" : "fromScratch";
        onFormDataChange(prevFormData => ({ ...prevFormData, mode }));
    };

    const handleOnChoreoTypeChange = (e: any) => {
        const choreoType = e.target.value as ExistingChoreoComponentType;
        onFormDataChange(prevFormData => ({ ...prevFormData, choreoType }));
    };

    return (
        <StepContainer>
            <VSCodeRadio
                checked={formData?.mode === "fromScratch"}
                onChange={handleFromScrachCheckChange}
            >
                Create from scratch (Recommended)
            </VSCodeRadio>
            {formData?.mode  === "fromScratch" && (
                <SubContainer>
                    <CardContainer>
                        <ComponentTypeCard
                            type="Service"
                            choreoComponentType="Service"
                            subType={ChoreoServiceComponentType.REST_API}
                            label="REST API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.REST_API}
                            onSelect={setSelectedType}
                            key={ChoreoServiceComponentType.REST_API}
                        />
                        <ComponentTypeCard
                            type="Service"
                            choreoComponentType="Service"
                            subType={ChoreoServiceComponentType.GQL_API}
                            label="GraphQL API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.GQL_API}
                            onSelect={setSelectedType}
                            key={ChoreoServiceComponentType.GQL_API}
                        />
                        <ComponentTypeCard
                            type="Service"
                            choreoComponentType="Service"
                            subType={ChoreoServiceComponentType.GRPC_API}
                            label="GRPC API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.GRPC_API}
                            onSelect={setSelectedType}
                            key={ChoreoServiceComponentType.GRPC_API}
                        />
                        <ComponentTypeCard
                            type="Service"
                            choreoComponentType="Service"
                            subType={ChoreoServiceComponentType.WEBSOCKET_API}
                            label="Webscoket API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.WEBSOCKET_API}
                            onSelect={setSelectedType}
                            key={ChoreoServiceComponentType.WEBSOCKET_API}
                        />
                        <ComponentTypeCard
                            type="Scheduled Trigger"
                            choreoComponentType="Scheduled Trigger"
                            label="Scheduled Trigger"
                            description="Create programs that can execute on a schedule. E.g., Recurring integration tasks."
                            isSelected={formData?.type === "Scheduled Trigger"}
                            onSelect={setSelectedType}
                            key="Scheduled Trigger"
                        />
                        <ComponentTypeCard
                            type="Manual Trigger"
                            choreoComponentType="Manual Trigger"
                            label="Manual Trigger"
                            description="Create programs that you can execute manually. E.g., One-time integration tasks."
                            isSelected={formData?.type === "Manual Trigger"}
                            onSelect={setSelectedType}
                            key="Manual Trigger"
                        />
                        <ComponentTypeCard
                            type="REST API Proxy"
                            choreoComponentType="REST API Proxy"
                            label="REST API Proxy"
                            description="Provide API management capabilities for existing APIs."
                            onSelect={setSelectedType}
                            isSelected={formData?.type === "REST API Proxy"}
                            key="REST API Proxy"
                        />
                    </CardContainer>
                </SubContainer>
            )}
            <VSCodeRadio
                checked={formData?.mode === "fromExisting"}
                onChange={handleFromExistingCheckChange}
            >
                Create from exisiting
            </VSCodeRadio>
            {formData?.mode === "fromExisting" && (
                <SubContainer>
                    <label>Existing source</label>
                    <CardContainer>
                        <ComponentTypeCard
                            type="Ballerina Package"
                            choreoComponentType={formData?.choreoType as ChoreoComponentType}
                            label="Ballerina"
                            description="Create a component from an existing Ballerina package."
                            isSelected={formData?.type === "Ballerina Package"}
                            onSelect={setSelectedType}
                            key="Ballerina Package"
                        />
                        <ComponentTypeCard
                            type="Dockerfile"
                            choreoComponentType={formData?.choreoType as ChoreoComponentType}
                            label="Dockerfile"
                            description="Create a component from an existing Dockerfile."
                            isSelected={formData?.type === "Dockerfile"}
                            onSelect={setSelectedType}
                            key="Dockerfile"
                        />
                    </CardContainer>
                    <label>Component type to create</label>
                    <VSCodeDropdown id="existing-import-type-dropdown" value={formData?.choreoType} onChange={handleOnChoreoTypeChange}>
                        {["Service", "Scheduled Trigger", "Manual Trigger"].map((type) => (<VSCodeOption selected={formData?.choreoType === type} value={type} key={type}>{type}</VSCodeOption>))}
                    </VSCodeDropdown>
                </SubContainer>
            )}
        </StepContainer>
    );
};

export const ComponentTypeStep: Step<Partial<ComponentWizardState>> = {
    title: 'Component Type',
    component: ComponentTypeStepC,
    validationRules: []
};

