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
import cn from "classnames";

import styled from "@emotion/styled";
import { VSCodeDropdown, VSCodeOption, VSCodeRadio } from "@vscode/webview-ui-toolkit/react";
import { ChoreoComponentType } from "@wso2-enterprise/choreo-core";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ComponentTypeCard } from "./ComponentTypeCard";
import { ComponentWizardState } from "./types";

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

const SourceTypeCardContainer = styled.div`
    // Flex Props
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    width: 120px;
    padding: 5px;
    // End Sizing Props
    // Border Props
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    border-color: var(--vscode-panel-border);
    cursor: pointer;
    &:hover, &.active {
        border-color: var(--vscode-focusBorder);
    }
`;

export const ComponentTypeStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;

    const [sourceType, setSourceType] = 
        React.useState<"Ballerina" | "Dockerfile">(formData?.type?.startsWith("byoc") ? "Dockerfile" : "Ballerina");

    const setSelectedType = (type: ChoreoComponentType) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, type }));
    };

    const handleFromScrachCheckChange = (e: any) => {
       const mode = e.target.checked ? "fromScratch" : "fromExisting";
       onFormDataChange(prevFormData => ({ ...prevFormData, mode }));
    };

    const handleFromExistingCheckChange = (e: any) => {
        const mode = e.target.checked ? "fromExisting" : "fromScratch";
        onFormDataChange(prevFormData => ({ ...prevFormData, mode }));
    };

    const handleExistingComponentTypeChange = (e: any) => { 
        const type = e.target.value;
        setSelectedType(type);
    }

    const handleSourceTypeChange = (type: "Ballerina" | "Dockerfile") => {
        setSourceType(type);
        // Reset type upon source type change
        setSelectedType(type === "Ballerina" ? ChoreoComponentType.Service : ChoreoComponentType.ByocService);
    };

    return (
        <StepContainer>
            <VSCodeRadio
                checked={formData?.mode === "fromScratch"}
                onChange={handleFromScrachCheckChange}
            >
                Create from scratch
            </VSCodeRadio>
            {formData?.mode  === "fromScratch" && (
                <SubContainer>
                    <CardContainer>
                        <ComponentTypeCard
                            type={ChoreoComponentType.Service}
                            label="Service"
                            description="Design, develop, test, and deploy your microservices"
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        />
                        <ComponentTypeCard
                            type={ChoreoComponentType.ScheduledTask}
                            label="Scheduled Trigger"
                            description="Create programs that can execute on a schedule. E.g., Recurring integration tasks."
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        />
                        <ComponentTypeCard
                            type={ChoreoComponentType.ManualTrigger}
                            label="Manual Trigger"
                            description="Create programs that you can execute manually. E.g., One-time integration tasks."
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        />
                        {/* <ComponentTypeCard
                            type={ChoreoComponentType.Proxy}
                            label="REST API Proxy"
                            description="Provide API management capabilities for existing APIs."
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        /> */}
                        {/* <ComponentTypeCard
                            type={ChoreoComponentType.RestApi}
                            label="REST API"
                            description="Design, develop, test, and manage your REST APIs."
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        /> */}
                        <ComponentTypeCard
                            type={ChoreoComponentType.Webhook}
                            label="Webhook"
                            description="Create programs that trigger via events. E.g., Business automation tasks."
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                        />
                        <ComponentTypeCard
                            type={ChoreoComponentType.GraphQL}
                            label="GraphQL API"
                            description="Design, develop, test, and manage your GraphQL endpoints."
                            formData={formData}
                            onFormDataChange={onFormDataChange}
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
                    <CardContainer id="source-type-cards">
                        <SourceTypeCardContainer
                            className={cn({ "active": sourceType === "Ballerina"})}
                            onClick={() => handleSourceTypeChange("Ballerina")}
                            title="Create from an existing Ballerina package."
                        >
                            <h4>Ballerina Package</h4>
                        </SourceTypeCardContainer>
                        <SourceTypeCardContainer
                            className={cn({ "active":  sourceType === "Dockerfile"})}
                            onClick={() => handleSourceTypeChange("Dockerfile")}
                            title="Create from an existing Dockerfile."
                        >
                            <h4>Dockerfile</h4> 
                        </SourceTypeCardContainer>
                    </CardContainer>
                    <label htmlFor="existing-import-type-dropdown">Component type</label>
                    <VSCodeDropdown
                        id="existing-import-type-dropdown"
                        value={formData?.type}
                        onChange={handleExistingComponentTypeChange}
                    >
                        {sourceType === "Ballerina" && (
                            <VSCodeOption value={ChoreoComponentType.Service}>Service</VSCodeOption>)}
                        {sourceType === "Ballerina" && (
                            <VSCodeOption value={ChoreoComponentType.ScheduledTask}>Scheduled Trigger</VSCodeOption>)}
                        {sourceType === "Ballerina" && (
                            <VSCodeOption value={ChoreoComponentType.ManualTrigger}>Manual Trigger</VSCodeOption>)}
                        {/* {sourceType === "Ballerina" && (
                            <VSCodeOption value={ChoreoComponentType.RestApi}>REST API</VSCodeOption>)} */}
                        {sourceType === "Ballerina" && (
                            <VSCodeOption value={ChoreoComponentType.Webhook}>Webhook</VSCodeOption>)}
                        {sourceType === "Ballerina" && (
                            <VSCodeOption value={ChoreoComponentType.GraphQL}>GraphQL API</VSCodeOption>)}
                        {sourceType === "Dockerfile" && (
                            <VSCodeOption value={ChoreoComponentType.ByocService}>Service</VSCodeOption>)}
                        {sourceType === "Dockerfile" && (
                            <VSCodeOption value={ChoreoComponentType.ByocCronjob}>Scheduled Trigger</VSCodeOption>)}
                        {sourceType === "Dockerfile" && (
                            <VSCodeOption value={ChoreoComponentType.ByocJob}>Manual Trigger</VSCodeOption>)}
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
