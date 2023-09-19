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
import { ConfigCardList } from "./ConfigCardList";
const StepContainer = styled.div `
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
`;
export const ComponentTypeStepC = (props) => {
    const { formData, onFormDataChange } = props;
    const items = [
        {
            label: "Service",
            description: "Design, develop, test, and deploy your microservices",
            value: ChoreoComponentType.Service
        },
        {
            label: "Scheduled Trigger",
            description: "Create programs that can execute on a schedule. E.g., Recurring integration tasks.",
            value: ChoreoComponentType.ScheduledTask
        },
        {
            label: "Manual Trigger",
            description: "Create programs that you can execute manually. E.g., One-time integration tasks.",
            value: ChoreoComponentType.ManualTrigger
        },
        {
            label: "Webhook",
            description: "Create programs that trigger via events. E.g., Business automation tasks.",
            value: ChoreoComponentType.Webhook
        }
    ];
    if (formData.mode === 'fromExisting') {
        items.push({
            label: "Web Application",
            value: ChoreoComponentType.WebApplication,
            description: "Create and manage web applications in Choreo"
        });
    }
    return (React.createElement(StepContainer, null,
        React.createElement(ConfigCardList, { formKey: 'type', formData: formData, onFormDataChange: onFormDataChange, items: items })));
};
export const ComponentTypeStep = {
    title: 'Component Type',
    component: ComponentTypeStepC,
    validationRules: []
};
//# sourceMappingURL=ComponentTypeStep.js.map