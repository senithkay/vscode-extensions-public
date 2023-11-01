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
import { ChoreoComponentType } from "@wso2-enterprise/choreo-core";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ComponentWizardState } from "./types";
import { ConfigCardList } from "./ConfigCardList";
import { ManualTriggerIcon, ScheduledTriggerIcon, ServiceIcon, WebAppIcon, WebhookIcon } from "../icons";
import { Typography } from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "../ProjectWizard/ProjectWizard";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
    min-height: calc(100vh - 160px);
`;

export const ComponentTypeStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange } = props;

    const items = [
        {
            label: "Service",
            description: "Design, develop, test, and deploy your microservices",
            value: ChoreoComponentType.Service,
            icon: ServiceIcon
        },
        {
            label: "Scheduled Trigger",
            description: "Create programs that can execute on a schedule. E.g., Recurring integration tasks.",
            value: ChoreoComponentType.ScheduledTask,
            icon: ScheduledTriggerIcon
        },
        {
            label: "Manual Trigger",
            description: "Create programs that you can execute manually. E.g., One-time integration tasks.",
            value: ChoreoComponentType.ManualTrigger,
            icon: ManualTriggerIcon
        },
        {
            label: "Webhook",
            description: "Create programs that trigger via events. E.g., Business automation tasks.",
            value: ChoreoComponentType.Webhook,
            icon: WebhookIcon
        },
        {
            label: "Web Application",
            value: ChoreoComponentType.WebApplication,
            description: "Create and manage web applications in Choreo",
            icon: WebAppIcon
        }
    ];

    const description = items.find(item => item.value === formData.type).description;

    return (
        <StepContainer>
            <SectionWrapper>
                <Typography variant="h3">Component Type</Typography>
                <ConfigCardList 
                    formKey='type'
                    formData={formData}
                    onFormDataChange={onFormDataChange}
                    items={items}
                />
                <p>{description}</p>
            </SectionWrapper>
        </StepContainer>
    );
};

export const ComponentTypeStep: Step<Partial<ComponentWizardState>> = {
    title: 'Component Type',
    component: ComponentTypeStepC,
    validationRules: []
};
