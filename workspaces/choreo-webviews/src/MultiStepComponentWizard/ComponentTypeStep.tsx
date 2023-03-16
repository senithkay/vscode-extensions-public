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
import { ChoreoComponentType, ComponentType, ComponentWizardState } from "./types";

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
    gap: 20px;
`;


export const ComponentTypeStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;

    const [mode, setMode] = useState<"fromScratch" | "fromExisting">("fromScratch");

    const setSelectedType = useCallback((type: ComponentType, subType?: ChoreoServiceComponentType) => {
        const choreoType = (["Service", "Scheduled Trigger", "Manual Trigger", "REST API Proxy"].includes(type) ? type : undefined) as ChoreoComponentType | undefined ;
        onFormDataChange({ type, subType, choreoType });
    }, [onFormDataChange]);

   
    useEffect(() => {
        if (!formData?.type) {   
            setSelectedType("Service", ChoreoServiceComponentType.REST_API);
        }
    }, [formData?.type, setSelectedType]);

    useEffect(() => {
        if (mode === "fromScratch") {
            setSelectedType("Service", ChoreoServiceComponentType.REST_API);
        } else {
            setSelectedType("Ballerina Package", undefined);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const handleFromScrachCheckChange = (e: any) => {
        setMode(e.target.checked ? "fromScratch" : "fromExisting");
    };

    const handleFromExistingCheckChange = (e: any) => {
        setMode(e.target.checked ? "fromExisting" : "fromScratch");
    };

    const handleOnChoreoTypeChange = (e: any) => {
        const choreoType = e.target.value as ChoreoComponentType;
        onFormDataChange({ choreoType });
    };

    return (
        <StepContainer>
            <VSCodeRadio
                checked={mode === "fromScratch"}
                onChange={handleFromScrachCheckChange}
            >
                Create from scratch (Recommended)
            </VSCodeRadio>
            {mode === "fromScratch" && (
                <SubContainer>
                    <CardContainer>
                        <ComponentTypeCard
                            type="Service"
                            subType={ChoreoServiceComponentType.REST_API}
                            label="REST API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.REST_API}
                            onSelect={setSelectedType}
                            key="Service"
                        />
                        <ComponentTypeCard
                            type="Service"
                            subType={ChoreoServiceComponentType.GQL_API}
                            label="GraphQL API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.GQL_API}
                            onSelect={setSelectedType}
                            key="Service"
                        />
                        <ComponentTypeCard
                            type="Service"
                            subType={ChoreoServiceComponentType.GRPC_API}
                            label="GRPC API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.GRPC_API}
                            onSelect={setSelectedType}
                            key="Service"
                        />
                        <ComponentTypeCard
                            type="Service"
                            subType={ChoreoServiceComponentType.WEBSOCKET_API}
                            label="Webscoket API"
                            description="Design, develop, test, and deploy your microservices"
                            isSelected={formData?.type === "Service" && formData?.subType === ChoreoServiceComponentType.WEBSOCKET_API}
                            onSelect={setSelectedType}
                            key="Service"
                        />
                        <ComponentTypeCard
                            type="Scheduled Trigger"
                            label="Scheduled Trigger"
                            description="Create programs that can execute on a schedule. E.g., Recurring integration tasks."
                            isSelected={formData?.type === "Scheduled Trigger"}
                            onSelect={setSelectedType}
                            key="Scheduled Trigger"
                        />
                        <ComponentTypeCard
                            type="Manual Trigger"
                            label="Manual Trigger"
                            description="Create programs that you can execute manually. E.g., One-time integration tasks."
                            isSelected={formData?.type === "Manual Trigger"}
                            onSelect={setSelectedType}
                            key="Manual Trigger"
                        />
                        <ComponentTypeCard
                            type="REST API Proxy"
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
                checked={mode === "fromExisting"}
                onChange={handleFromExistingCheckChange}
            >
                Create from exisiting
            </VSCodeRadio>
            {mode === "fromExisting" && (
                <SubContainer>
                    <label>Existing source</label>
                    <CardContainer>
                        <ComponentTypeCard
                            type="Ballerina Package"
                            label="Ballerina"
                            description="Create a component from an existing Ballerina package."
                            isSelected={formData?.type === "Ballerina Package"}
                            onSelect={setSelectedType}
                            key="Ballerina Package"
                        />
                        <ComponentTypeCard
                            type="Dockerfile"
                            label="Dockerfile"
                            description="Create a component from an existing Dockerfile."
                            isSelected={formData?.type === "Dockerfile"}
                            onSelect={setSelectedType}
                            key="Dockerfile"
                        />
                    </CardContainer>
                    <label>Component type to create</label>
                    <VSCodeDropdown id="existing-import-type-dropdown" onChange={handleOnChoreoTypeChange}>
                        {["Service", "Scheduled Trigger", "Manual Trigger"].map((type) => (<VSCodeOption>{type}</VSCodeOption>))}
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

